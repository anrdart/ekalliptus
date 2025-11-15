/**
 * Payment Security and Data Sanitization Utilities
 * Handles encryption, masking, and validation of sensitive payment data
 */

export interface SensitiveDataConfig {
  maskCardNumber?: boolean;
  maskEmail?: boolean;
  maskPhone?: boolean;
  preserveLast4?: boolean;
}

// Mask email address
export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal = localPart.length > 2
    ? `${localPart.substring(0, 2)}${'*'.repeat(localPart.length - 2)}`
    : localPart;

  return `${maskedLocal}@${domain}`;
};

// Mask phone number
export const maskPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;

  if (digits.length >= 10) {
    const prefix = digits.substring(0, 3);
    const middle = '*'.repeat(7);
    const suffix = digits.substring(digits.length - 4);
    return `${prefix}${middle}${suffix}`;
  }

  const maskedLength = Math.max(0, phone.length - 4);
  return `${'*'.repeat(maskedLength)}${phone.substring(phone.length - 4)}`;
};

// Mask credit card number
export const maskCardNumber = (cardNumber: string | null | undefined, preserveLast4: boolean = true): string => {
  if (!cardNumber) return '';
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length < 4) return cardNumber;

  if (preserveLast4) {
    const last4 = digits.substring(digits.length - 4);
    return `${'*'.repeat(digits.length - 4)}${last4}`;
  }

  return '*'.repeat(digits.length);
};

// Sanitize notification data
export const sanitizeNotificationData = (data: any, config: SensitiveDataConfig = {}): any => {
  const sanitized = { ...data };

  // Mask sensitive fields
  if (config.maskEmail && sanitized.customer_details?.email) {
    sanitized.customer_details = {
      ...sanitized.customer_details,
      email: maskEmail(sanitized.customer_details.email),
    };
  }

  if (config.maskPhone && sanitized.customer_details?.phone) {
    sanitized.customer_details = {
      ...sanitized.customer_details,
      phone: maskPhone(sanitized.customer_details.phone),
    };
  }

  if (config.preserveLast4 !== false && sanitized.masked_card) {
    sanitized.masked_card = sanitized.masked_card;
  } else {
    delete sanitized.masked_card;
  }

  // Remove sensitive fields entirely
  const sensitiveFields = [
    'card_number',
    'card_token',
    'three_ds_secure',
    'eci',
    'saved_token_id',
    'saved_token_id_expired_at',
  ];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      delete sanitized[field];
    }
  });

  return sanitized;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format (Indonesian format)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validate amount
export const isValidAmount = (amount: number | string): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount >= 0;
};

// Validate transaction status
export const isValidTransactionStatus = (status: string): boolean => {
  const validStatuses = [
    'pending',
    'capture',
    'settlement',
    'deny',
    'cancel',
    'expire',
    'refund',
    'partial_refund',
  ];
  return validStatuses.includes(status);
};

// Validate payment type
export const isValidPaymentType = (paymentType: string): boolean => {
  const validTypes = [
    'credit_card',
    'bank_transfer',
    'gopay',
    'shopeepay',
    'ovo',
    'dana',
    'linkaja',
    'akulaku',
    'bcaklikpay',
    'cimbclicks',
    'danamon',
    'bii',
    'permatava',
    'briva',
    'mandiriva',
    'other',
  ];
  return validTypes.includes(paymentType);
};

// Hash sensitive data (client-side hashing - for display purposes only)
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Generate secure random ID
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Check if running in secure context (HTTPS)
export const isSecureContext = (): boolean => {
  return typeof window !== 'undefined' && window.isSecureContext;
};

// Log security event (for audit)
export const logSecurityEvent = (
  event: string,
  details: Record<string, any>,
  context?: string
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: sanitizeNotificationData(details, { maskEmail: true, maskPhone: true }),
    context: context || 'payment_system',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };

  // In production, send to secure logging service
  console.info('[Security Event]', logEntry);
};

// Validate and sanitize order ID
export const validateOrderId = (orderId: string): boolean => {
  // Order ID should be alphanumeric and between 3-100 characters
  const orderIdRegex = /^[a-zA-Z0-9_-]{3,100}$/;
  return orderIdRegex.test(orderId);
};

// Create audit trail entry
export const createAuditTrail = (
  action: string,
  entityType: string,
  entityId: string,
  userId?: string,
  metadata?: Record<string, any>
): Record<string, any> => {
  return {
    id: generateSecureId(),
    action,
    entity_type: entityType,
    entity_id: entityId,
    user_id: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    ip_address: 'client-side', // Should be captured server-side
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    metadata: metadata || {},
  };
};

// Rate limiting helper (client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(private maxAttempts: number = 5, private windowMs: number = 60000) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Default export
export default {
  maskEmail,
  maskPhone,
  maskCardNumber,
  sanitizeNotificationData,
  isValidEmail,
  isValidPhoneNumber,
  isValidAmount,
  isValidTransactionStatus,
  isValidPaymentType,
  hashData,
  generateSecureId,
  isSecureContext,
  logSecurityEvent,
  validateOrderId,
  createAuditTrail,
  RateLimiter,
};
