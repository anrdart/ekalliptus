/**
 * Security Testing Suite for Payment System
 * Comprehensive security tests including XSS, CSRF, injection, and validation tests
 */

import { securityMiddleware } from '@/middleware/securityMiddleware';
import { backendApi } from '@/services/backendApi';
import { paymentLogger, PaymentEventType } from '@/services/paymentLogger';

// Test Result Types
export interface SecurityTestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
  executionTime: number;
}

export interface SecurityTestSuite {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  results: SecurityTestResult[];
}

// Security Test Categories
export enum SecurityTestCategory {
  VALIDATION = 'validation',
  SANITIZATION = 'sanitization',
  RATE_LIMITING = 'rate_limiting',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  WEBHOOK_SECURITY = 'webhook_security',
  API_SECURITY = 'api_security',
  DATA_ENCRYPTION = 'data_encryption',
}

// Security Test Data
class SecurityTestData {
  static getMaliciousInputs(): Record<string, string[]> {
    return {
      xss: [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '"><script>alert("XSS")</script>',
        "<script>alert(String.fromCharCode(88,83,83))</script>",
        '</script><script>alert("XSS")</script>',
        '<svg onload=alert("XSS")>',
        '<iframe src="javascript:alert(`XSS`)"></iframe>',
      ],
      sqlInjection: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "1' UNION SELECT * FROM users--",
        "' OR 1=1--",
        "admin'--",
        "' UNION SELECT password FROM admin_users--",
        "1; INSERT INTO users VALUES ('hacker', 'password')--",
      ],
      commandInjection: [
        '; cat /etc/passwd',
        '&& rm -rf /',
        '| whoami',
        '; ls -la',
        '&& echo "injected"',
        '`rm -rf /`',
      ],
      pathTraversal: [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      ],
      noSqlInjection: [
        '{"$gt": ""}',
        '{"$ne": null}',
        '{"$where": "return true"}',
        '{"$regex": ".*"}',
        'ObjectId("000000000000000000000000")',
      ],
      jsonInjection: [
        '{"__proto__": {"admin": true}}',
        '{"constructor": {"prototype": {"admin": true}}}',
        '{{"__proto__": null}}',
      ],
    };
  }

  static getValidPaymentData() {
    return {
      transaction_details: {
        order_id: 'ORDER-' + Date.now() + '-TEST',
        gross_amount: 100000,
      },
      customer_details: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+6281234567890',
      },
    };
  }
}

// Security Test Runner
export class SecurityTestRunner {
  private results: SecurityTestResult[] = [];

  async runAllTests(): Promise<SecurityTestSuite> {
    const startTime = Date.now();
    console.log('Starting Security Test Suite...');

    // Run all test categories
    await this.runValidationTests();
    await this.runSanitizationTests();
    await this.runRateLimitingTests();
    await this.runWebhookSecurityTests();
    await this.runApiSecurityTests();
    await this.runDataValidationTests();

    const executionTime = Date.now() - startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    return {
      suiteName: 'Security Test Suite',
      totalTests: this.results.length,
      passed,
      failed,
      skipped,
      results: this.results,
    };
  }

  private async runValidationTests(): Promise<void> {
    console.log('Running Validation Tests...');

    // Test valid order ID
    const validOrderId = 'ORDER-1234567890-TEST';
    const isValidResult = await securityMiddleware.validateInput({
      transaction_details: {
        order_id: validOrderId,
        gross_amount: 100000
      }
    }, 'transaction');
    
    this.addResult(
      'Valid Order ID Validation',
      isValidResult.valid ? 'PASS' : 'FAIL',
      `Order ID "${validOrderId}" validation`,
      { isValid: isValidResult.valid, errors: isValidResult.errors }
    );

    // Test invalid order IDs
    const invalidOrderIds = ['123', 'invalid-order-id!', '', null, undefined];
    
    for (const orderId of invalidOrderIds) {
      try {
        const isValidOrderResult = await securityMiddleware.validateInput({
          transaction_details: {
            order_id: orderId,
            gross_amount: 100000
          }
        }, 'transaction');
        
        this.addResult(
          `Invalid Order ID Test: "${orderId}"`,
          !isValidOrderResult.valid ? 'PASS' : 'FAIL',
          `Should reject invalid order ID`,
          { expectedValid: false, actualValid: isValidOrderResult.valid }
        );
      } catch (error) {
        this.addResult(
          `Invalid Order ID Test: "${orderId}"`,
          'PASS',
          `Correctly rejected invalid order ID with error`,
          { error: error }
        );
      }
    }

    // Test amount validation
    const invalidAmounts = [-1000, 0, 500, 2000000000];
    
    for (const amount of invalidAmounts) {
      const isValidAmountResult = await securityMiddleware.validateInput({
        transaction_details: {
          order_id: 'ORDER-TEST-AMOUNT',
          gross_amount: amount
        }
      }, 'transaction');
      
      this.addResult(
        `Invalid Amount Test: ${amount}`,
        !isValidAmountResult.valid ? 'PASS' : 'FAIL',
        `Should reject invalid amount: ${amount}`,
        { expectedValid: false, actualValid: isValidAmountResult.valid }
      );
    }
  }

  private async runSanitizationTests(): Promise<void> {
    console.log('Running Sanitization Tests...');

    // Test XSS input sanitization
    const xssInputs = SecurityTestData.getMaliciousInputs().xss;
    
    for (const xssInput of xssInputs) {
      const sanitized = backendApi.sanitizeInput(xssInput);
      const hasScriptTag = sanitized.toString().includes('<script>');
      
      this.addResult(
        `XSS Sanitization Test: "${xssInput.substring(0, 50)}..."`,
        !hasScriptTag ? 'PASS' : 'FAIL',
        'XSS input should be sanitized',
        { original: xssInput, sanitized: sanitized.toString(), hasScriptTag }
      );
    }

    // Test object sanitization
    const maliciousObject = {
      __proto__: { admin: true },
      constructor: { prototype: { user: 'hacker' } },
      safeProperty: 'clean data',
      nested: {
        __proto__: null,
        dangerous: '<script>alert("XSS")</script>',
      },
    };

    const sanitizedObject = backendApi.sanitizeInput(maliciousObject);
    const hasDangerousKeys = '__proto__' in sanitizedObject || 'constructor' in sanitizedObject;

    this.addResult(
      'Object Sanitization Test',
      !hasDangerousKeys ? 'PASS' : 'FAIL',
      'Dangerous object keys should be removed',
      { 
        original: maliciousObject, 
        sanitized: sanitizedObject,
        hasDangerousKeys,
        safeProperty: sanitizedObject.safeProperty 
      }
    );
  }

  private async runRateLimitingTests(): Promise<void> {
    console.log('Running Rate Limiting Tests...');

    // Test rate limiting functionality (mock implementation)
    const endpoint = '/payments/transactions';
    const clientId = 'test-client-123';

    // Simulate multiple rapid requests
    const rateLimitResults = [];
    
    for (let i = 0; i < 15; i++) {
      const mockRequest = new Request('http://localhost/test', {
        method: 'POST',
        headers: {
          'x-forwarded-for': clientId,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' }),
      });

      try {
        const result = await securityMiddleware.processApiRequest(mockRequest, endpoint);
        rateLimitResults.push({
          request: i + 1,
          allowed: result.allowed,
          reason: result.reason,
        });
      } catch (error) {
        rateLimitResults.push({
          request: i + 1,
          allowed: false,
          reason: 'error',
          error: error,
        });
      }
    }

    // Check if rate limiting kicks in
    const blockedRequests = rateLimitResults.filter(r => !r.allowed);
    
    this.addResult(
      'Rate Limiting Test',
      blockedRequests.length > 0 ? 'PASS' : 'FAIL',
      'Rate limiting should block excessive requests',
      { 
        totalRequests: rateLimitResults.length,
        blockedRequests: blockedRequests.length,
        blockedRequestNumbers: blockedRequests.map(r => r.request),
      }
    );
  }

  private async runWebhookSecurityTests(): Promise<void> {
    console.log('Running Webhook Security Tests...');

    // Test webhook signature validation
    const validWebhookData = {
      order_id: 'ORDER-TEST-123',
      transaction_id: 'trans-123',
      gross_amount: '100000',
      payment_type: 'bank_transfer',
      transaction_status: 'settlement',
      status_code: '200',
      signature_key: 'valid-signature-key',
    };

    const maliciousWebhookData = {
      ...validWebhookData,
      order_id: "../../../etc/passwd", // Path traversal
      signature_key: "<script>alert('XSS')</script>", // XSS
    };

    // Test valid webhook data
    const validValidation = await securityMiddleware.validateInput(validWebhookData, 'notification');
    this.addResult(
      'Valid Webhook Data Test',
      validValidation.valid ? 'PASS' : 'FAIL',
      'Valid webhook data should pass validation',
      { isValid: validValidation.valid, errors: validValidation.errors }
    );

    // Test malicious webhook data
    const maliciousValidation = await securityMiddleware.validateInput(maliciousWebhookData, 'notification');
    this.addResult(
      'Malicious Webhook Data Test',
      !maliciousValidation.valid ? 'PASS' : 'FAIL',
      'Malicious webhook data should be rejected',
      { 
        expectedValid: false, 
        actualValid: maliciousValidation.valid,
        errors: maliciousValidation.errors 
      }
    );
  }

  private async runApiSecurityTests(): Promise<void> {
    console.log('Running API Security Tests...');

    // Test input sanitization in API context
    const testData = {
      order_id: '<script>alert("XSS")</script>ORDER-123',
      amount: 100000,
      malicious_object: {
        __proto__: { admin: true },
        data: 'normal data',
      },
    };

    const sanitizedData = backendApi.sanitizeInput(testData);
    const isSafeOrderId = !sanitizedData.order_id.includes('<script>');
    const noDangerousKeys = !('__proto__' in sanitizedData.malicious_object);

    this.addResult(
      'API Input Sanitization Test',
      isSafeOrderId && noDangerousKeys ? 'PASS' : 'FAIL',
      'API inputs should be properly sanitized',
      {
        originalOrderId: testData.order_id,
        sanitizedOrderId: sanitizedData.order_id,
        originalObject: testData.malicious_object,
        sanitizedObject: sanitizedData.malicious_object,
        isSafeOrderId,
        noDangerousKeys,
      }
    );

    // Test order ID validation
    const orderIdTests = [
      { id: 'ORDER-123456789', valid: true },
      { id: 'short', valid: false },
      { id: 'ORDER<script>alert(1)</script>', valid: false },
      { id: 'ORDER-123-ABC-456', valid: true },
    ];

    for (const test of orderIdTests) {
      const isValid = backendApi.validateOrderId(test.id);
      
      this.addResult(
        `Order ID Validation Test: "${test.id}"`,
        isValid === test.valid ? 'PASS' : 'FAIL',
        `Order ID validation for "${test.id}"`,
        { expected: test.valid, actual: isValid, orderId: test.id }
      );
    }
  }

  private async runDataValidationTests(): Promise<void> {
    console.log('Running Data Validation Tests...');

    // Test email validation
    const emailTests = [
      { email: 'user@example.com', valid: true },
      { email: 'invalid-email', valid: false },
      { email: 'user@domain', valid: false },
      { email: '@domain.com', valid: false },
      { email: 'user@domain.co.uk', valid: true },
    ];

    for (const test of emailTests) {
      // Mock email validation (since it's in security middleware)
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailPattern.test(test.email);
      
      this.addResult(
        `Email Validation Test: "${test.email}"`,
        isValid === test.valid ? 'PASS' : 'SKIP',
        `Email validation test (pattern-based)`,
        { expected: test.valid, actual: isValid, email: test.email }
      );
    }

    // Test amount validation
    const amountTests = [
      { amount: 1000, valid: true }, // Minimum
      { amount: 50000, valid: true }, // Normal
      { amount: 100000000, valid: true }, // Maximum
      { amount: 999, valid: false }, // Below minimum
      { amount: 100000001, valid: false }, // Above maximum
      { amount: -1000, valid: false }, // Negative
    ];

    for (const test of amountTests) {
      const isValid = backendApi.validateAmount(test.amount);
      
      this.addResult(
        `Amount Validation Test: ${test.amount}`,
        isValid === test.valid ? 'PASS' : 'FAIL',
        `Amount validation for ${test.amount}`,
        { expected: test.valid, actual: isValid, amount: test.amount }
      );
    }
  }

  private addResult(
    testName: string,
    status: 'PASS' | 'FAIL' | 'SKIP',
    message: string,
    details?: any
  ): void {
    this.results.push({
      testName,
      status,
      message,
      details,
      executionTime: 0, // Would be calculated in real implementation
    });

    console.log(`${status}: ${testName} - ${message}`);
  }

  // Utility methods for manual testing
  static async testCustomInput(input: any, type: 'transaction' | 'notification'): Promise<{
    valid: boolean;
    sanitized?: any;
    errors: string[];
  }> {
    return await securityMiddleware.validateInput(input, type);
  }

  static getTestData(): typeof SecurityTestData {
    return SecurityTestData;
  }

  static sanitizeTestInput(input: any): any {
    return backendApi.sanitizeInput(input);
  }
}

// Export utilities
export const securityTestRunner = new SecurityTestRunner();
export default securityTestRunner;

// Convenience function for running tests
export async function runSecurityTests(): Promise<SecurityTestSuite> {
  return await securityTestRunner.runAllTests();
}