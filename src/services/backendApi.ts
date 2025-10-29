/**
 * Enhanced Backend API Service with Circuit Breaker Pattern
 * This service handles all backend communication with proper security and resilience
 */

import { MIDTRANS_CONFIG } from '@/config/midtrans';
import { paymentLogger, PaymentEventType, logApiEvent, logValidationError } from './paymentLogger';

// Circuit Breaker States
enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

// Circuit Breaker Configuration
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

// Circuit Breaker Implementation
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.failureThreshold) {
        this.state = CircuitBreakerState.CLOSED;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }
}

// Request/Response Interceptors
interface RequestInterceptor {
  (config: any): any;
}

interface ResponseInterceptor {
  (response: any): any;
}

// Enhanced API Response Type
export interface EnhancedApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    circuitBreakerState?: string;
  };
}

// Retry Configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

class BackendApiService {
  private circuitBreaker: CircuitBreaker;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor() {
    const config: CircuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      monitoringPeriod: 60000, // 1 minute
    };
    
    this.circuitBreaker = new CircuitBreaker(config);
    
    // Add default interceptors
    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors(): void {
    // Request interceptor for adding common headers
    this.addRequestInterceptor((config) => {
      config.headers = {
        ...config.headers,
        'X-Request-ID': this.generateRequestId(),
        'X-Client-Version': '2.0.0',
        'X-Content-Type': 'application/json',
      };
      return config;
    });

    // Response interceptor for error handling
    this.addResponseInterceptor((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(config: any): Promise<any> {
    let interceptedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      interceptedConfig = await interceptor(interceptedConfig);
    }
    return interceptedConfig;
  }

  private async applyResponseInterceptors(response: any): Promise<any> {
    let interceptedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      interceptedResponse = await interceptor(interceptedResponse);
    }
    return interceptedResponse;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = { method: 'GET' },
    retryConfig?: RetryConfig
  ): Promise<EnhancedApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    return this.circuitBreaker.execute(async () => {
      const { method = 'GET', headers = {}, body } = await this.applyRequestInterceptors(options);

      logApiEvent(PaymentEventType.API_CALL, {
        endpoint,
        method,
        requestId,
        circuitBreakerState: this.circuitBreaker.getState(),
      });

      try {
        const requestBody = body ? JSON.stringify(body) : undefined;
        const response = await fetch(`${MIDTRANS_CONFIG.endpoints.apiBase}${endpoint}`, {
          method,
          headers,
          body: requestBody,
        });

        const processedResponse = await this.applyResponseInterceptors(response);
        const processingTime = Date.now() - startTime;

        // Enhanced error logging
        if (!processedResponse.ok) {
          logApiEvent(PaymentEventType.API_ERROR, {
            endpoint,
            status: processedResponse.status,
            statusText: processedResponse.statusText,
            requestId,
            processingTime,
          });

          return {
            success: false,
            error: `HTTP ${processedResponse.status}: ${processedResponse.statusText}`,
            meta: {
              requestId,
              timestamp: new Date().toISOString(),
              processingTime,
              circuitBreakerState: this.circuitBreaker.getState(),
            },
          };
        }

        // Parse response
        let data;
        const contentType = processedResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await processedResponse.json();
        } else {
          data = await processedResponse.text();
        }

        logApiEvent(PaymentEventType.API_SUCCESS, {
          endpoint,
          requestId,
          processingTime,
          circuitBreakerState: this.circuitBreaker.getState(),
        });

        return {
          success: true,
          data,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            processingTime,
            circuitBreakerState: this.circuitBreaker.getState(),
          },
        };

      } catch (error) {
        const processingTime = Date.now() - startTime;
        
        logApiEvent(PaymentEventType.API_ERROR, {
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId,
          processingTime,
          circuitBreakerState: this.circuitBreaker.getState(),
        });

        // Apply retry logic
        if (retryConfig) {
          return this.handleRetry(endpoint, options, retryConfig, processingTime);
        }

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            processingTime,
            circuitBreakerState: this.circuitBreaker.getState(),
          },
        };
      }
    });
  }

  private async handleRetry<T>(
    endpoint: string,
    options: RequestInit,
    retryConfig: RetryConfig,
    currentAttempt: number = 1
  ): Promise<EnhancedApiResponse<T>> {
    if (currentAttempt > retryConfig.maxRetries) {
      return {
        success: false,
        error: `Max retries exceeded for ${endpoint}`,
        meta: {
          requestId: this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime: 0,
          circuitBreakerState: this.circuitBreaker.getState(),
        },
      };
    }

    const delay = retryConfig.retryDelay * Math.pow(retryConfig.backoffMultiplier, currentAttempt - 1);
    
    logApiEvent(PaymentEventType.API_ERROR, {
      endpoint,
      retryAttempt: currentAttempt,
      retryDelay: delay,
      maxRetries: retryConfig.maxRetries,
    });

    await new Promise(resolve => setTimeout(resolve, delay));

    return this.makeRequest(endpoint, options, {
      ...retryConfig,
      maxRetries: retryConfig.maxRetries - 1,
    });
  }

  // Public API Methods

  async createTransaction(transactionData: any): Promise<EnhancedApiResponse> {
    return this.makeRequest('/payments/transactions', {
      method: 'POST',
      body: transactionData,
    }, {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      retryCondition: (error) => error.status >= 500,
    });
  }

  async verifyNotificationSignature(notificationData: any): Promise<EnhancedApiResponse<{ verified: boolean }>> {
    return this.makeRequest('/payments/verify-signature', {
      method: 'POST',
      body: notificationData,
    }, {
      maxRetries: 2,
      retryDelay: 500,
      backoffMultiplier: 1.5,
    });
  }

  async handlePaymentNotification(notificationData: any): Promise<EnhancedApiResponse> {
    return this.makeRequest('/payments/notifications', {
      method: 'POST',
      body: notificationData,
    }, {
      maxRetries: 3,
      retryDelay: 2000,
      backoffMultiplier: 2,
    });
  }

  async getTransactionStatus(orderId: string): Promise<EnhancedApiResponse> {
    return this.makeRequest(`/payments/transactions/${orderId}`, {
      method: 'GET',
    }, {
      maxRetries: 2,
      retryDelay: 1000,
      backoffMultiplier: 1.5,
      retryCondition: (error) => error.status >= 500,
    });
  }

  async cancelTransaction(orderId: string): Promise<EnhancedApiResponse> {
    return this.makeRequest(`/payments/transactions/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  async expireTransaction(orderId: string): Promise<EnhancedApiResponse> {
    return this.makeRequest(`/payments/transactions/${orderId}/expire`, {
      method: 'POST',
    });
  }

  async refundTransaction(orderId: string, amount?: number): Promise<EnhancedApiResponse> {
    const body = amount ? { amount } : undefined;
    const options: RequestInit = {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    };
    
    return this.makeRequest(`/payments/transactions/${orderId}/refund`, options);
  }

  async getHealthStatus(): Promise<EnhancedApiResponse> {
    return this.makeRequest('/health', {
      method: 'GET',
    }, {
      maxRetries: 1,
      retryDelay: 1000,
      backoffMultiplier: 1,
    });
  }

  // Utility Methods
  isHealthy(): boolean {
    return this.circuitBreaker.getState() !== CircuitBreakerState.OPEN;
  }

  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreaker.getState();
  }

  // Input Sanitization
  sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+="[^"]*"/gi, ''); // Remove event handlers
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Remove dangerous keys
        if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
          sanitized[key] = this.sanitizeInput(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  validateOrderId(orderId: string): boolean {
    const orderIdPattern = /^[A-Z0-9\-_]{10,50}$/;
    return orderIdPattern.test(orderId);
  }

  validateAmount(amount: number): boolean {
    return typeof amount === 'number' && amount > 0 && amount <= 1000000000; // Max 1 billion
  }
}

// Export singleton instance
export const backendApi = new BackendApiService();
export default backendApi;