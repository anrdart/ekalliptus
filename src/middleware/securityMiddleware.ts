/**
 * Enhanced Security Middleware for Payment System
 * Handles input validation, sanitization, rate limiting, and security headers
 */

import { backendApi } from '@/services/backendApi';
import { paymentLogger, PaymentEventType, logValidationError, logApiEvent } from '@/services/paymentLogger';

// Security configuration
interface SecurityConfig {
  maxRequestSize: number;
  allowedOrigins: string[];
  rateLimits: {
    [endpoint: string]: { requests: number; windowMs: number };
  };
  validationRules: {
    orderId: RegExp;
    email: RegExp;
    phone: RegExp;
    amount: { min: number; max: number };
  };
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxRequestSize: 10 * 1024, // 10KB
  allowedOrigins: [
    'https://ekalliptus.id',
    'https://www.ekalliptus.id',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  rateLimits: {
    '/payments/transactions': { requests: 10, windowMs: 60000 }, // 10 requests per minute
    '/payments/notifications': { requests: 100, windowMs: 60000 }, // 100 notifications per minute
    '/payments/verify-signature': { requests: 50, windowMs: 60000 }, // 50 verifications per minute
  },
  validationRules: {
    orderId: /^[A-Z0-9\-_]{10,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    amount: { min: 1000, max: 100000000 }, // Rp 1,000 - Rp 100,000,000
  },
};

// Rate Limiting State
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(private config: SecurityConfig) {}

  isRateLimited(endpoint: string, clientId: string): boolean {
    const limiter = this.config.rateLimits[endpoint];
    if (!limiter) return false;

    const key = `${endpoint}:${clientId}`;
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + limiter.windowMs });
      return false;
    }

    if (record.count >= limiter.requests) {
      return true;
    }

    record.count++;
    return false;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Input Validator
class InputValidator {
  constructor(private config: SecurityConfig) {}

  validateOrderId(orderId: string): boolean {
    if (!orderId || typeof orderId !== 'string') {
      return false;
    }

    // Check length
    if (orderId.length < 10 || orderId.length > 50) {
      return false;
    }

    // Check pattern
    if (!this.config.validationRules.orderId.test(orderId)) {
      return false;
    }

    // Check for potential SQL injection patterns
    const sqlPatterns = [
      /('|(\\x27)|(\\x22)|(\\x23)|(\\x2d))/i,
      /((\%3D)|(=))[^\n]*((\%27)|(')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|('))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|('))union/i,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(orderId)) {
        return false;
      }
    }

    return true;
  }

  validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    return this.config.validationRules.email.test(email);
  }

  validatePhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d\+]/g, '');
    
    return this.config.validationRules.phone.test(cleaned);
  }

  validateAmount(amount: number): boolean {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return false;
    }

    const { min, max } = this.config.validationRules.amount;
    return amount >= min && amount <= max;
  }

  validateTransactionData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push('Transaction data is required');
      return { valid: false, errors };
    }

    // Validate transaction details
    if (!data.transaction_details) {
      errors.push('Transaction details are required');
    } else {
      const { transaction_details } = data;

      if (!transaction_details.order_id) {
        errors.push('Order ID is required');
      } else if (!this.validateOrderId(transaction_details.order_id)) {
        errors.push('Invalid order ID format');
      }

      if (!transaction_details.gross_amount) {
        errors.push('Gross amount is required');
      } else if (!this.validateAmount(transaction_details.gross_amount)) {
        errors.push('Invalid gross amount');
      }
    }

    // Validate customer details if provided
    if (data.customer_details) {
      const { customer_details } = data;

      if (customer_details.email && !this.validateEmail(customer_details.email)) {
        errors.push('Invalid email format');
      }

      if (customer_details.phone && !this.validatePhone(customer_details.phone)) {
        errors.push('Invalid phone format');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateNotificationData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push('Notification data is required');
      return { valid: false, errors };
    }

    // Required fields for Midtrans notifications
    const requiredFields = [
      'order_id', 'transaction_id', 'gross_amount', 'payment_type', 
      'transaction_time', 'transaction_status', 'signature_key'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    // Validate specific fields
    if (data.order_id && !this.validateOrderId(data.order_id)) {
      errors.push('Invalid order ID in notification');
    }

    if (data.gross_amount && (!this.validateAmount(parseFloat(data.gross_amount)))) {
      errors.push('Invalid gross amount in notification');
    }

    // Validate transaction status
    const validStatuses = [
      'capture', 'settlement', 'pending', 'deny', 'cancel', 'expire',
      'refund', 'partial_refund', 'authorize'
    ];

    if (data.transaction_status && !validStatuses.includes(data.transaction_status)) {
      errors.push(`Invalid transaction status: ${data.transaction_status}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Content Security Policy
class SecurityHeaders {
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://app.midtrans.com https://app.sandbox.midtrans.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.midtrans.com https://app.midtrans.com https://app.sandbox.midtrans.com",
      "frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
  }

  static getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.getCSPHeader(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }
}

// Main Security Middleware Class
export class SecurityMiddleware {
  private rateLimiter: RateLimiter;
  private validator: InputValidator;
  private config: SecurityConfig;

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
    this.rateLimiter = new RateLimiter(config);
    this.validator = new InputValidator(config);

    // Periodic cleanup of rate limiter
    setInterval(() => {
      this.rateLimiter.cleanup();
    }, 60000); // Clean every minute
  }

  // Middleware for API requests
  async processApiRequest(
    request: Request,
    endpoint: string
  ): Promise<{ allowed: boolean; response?: Response; reason?: string }> {
    const clientId = this.getClientId(request);

    // Check rate limiting
    if (this.rateLimiter.isRateLimited(endpoint, clientId)) {
      logValidationError(`Rate limit exceeded for ${clientId} on ${endpoint}`);
      
      return {
        allowed: false,
        response: this.createErrorResponse('Rate limit exceeded', 429),
        reason: 'rate_limited',
      };
    }

    // Validate request size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > this.config.maxRequestSize) {
      logValidationError(`Request size too large: ${contentLength} bytes`);
      
      return {
        allowed: false,
        response: this.createErrorResponse('Request too large', 413),
        reason: 'payload_too_large',
      };
    }

    // Validate request origin
    const origin = request.headers.get('origin');
    if (origin && !this.config.allowedOrigins.includes(origin)) {
      logValidationError(`Invalid origin: ${origin}`);
      
      return {
        allowed: false,
        response: this.createErrorResponse('Invalid origin', 403),
        reason: 'invalid_origin',
      };
    }

    return { allowed: true };
  }

  // Validate and sanitize input data
  async validateInput(data: any, type: 'transaction' | 'notification'): Promise<{
    valid: boolean;
    sanitized?: any;
    errors: string[];
  }> {
    try {
      let validationResult;

      if (type === 'transaction') {
        validationResult = this.validator.validateTransactionData(data);
      } else {
        validationResult = this.validator.validateNotificationData(data);
      }

      if (!validationResult.valid) {
        validationResult.errors.forEach(error => {
          logValidationError(`Validation error: ${error}`, data);
        });

        return {
          valid: false,
          sanitized: undefined,
          errors: validationResult.errors,
        };
      }

      // Sanitize the data
      const sanitized = backendApi.sanitizeInput(data);

      return {
        valid: true,
        sanitized,
        errors: [],
      };

    } catch (error) {
      logValidationError(`Validation error: ${error}`, data);
      return {
        valid: false,
        sanitized: undefined,
        errors: ['Validation failed'],
      };
    }
  }

  // Create security headers for response
  getSecurityHeaders(): Record<string, string> {
    return SecurityHeaders.getSecurityHeaders();
  }

  // Generate unique client ID for rate limiting
  private getClientId(request: Request): string {
    // Try to get from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent') || '';

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (realIp) {
      return realIp;
    }

    // Fallback to a hash of user agent
    let hash = 0;
    for (let i = 0; i < userAgent.length; i++) {
      const char = userAgent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `ua_${Math.abs(hash)}`;
  }

  // Create standardized error response
  private createErrorResponse(message: string, status: number): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...this.getSecurityHeaders(),
        },
      }
    );
  }

  // Get security configuration
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Update security configuration
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.rateLimiter = new RateLimiter(this.config);
    this.validator = new InputValidator(this.config);
  }
}

// Export singleton instance
export const securityMiddleware = new SecurityMiddleware();
export default securityMiddleware;