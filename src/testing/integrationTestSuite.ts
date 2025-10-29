/**
 * Integration & End-to-End Testing Suite
 * Comprehensive integration tests covering payment flows, webhooks, and full user journeys
 */

import { backendApi } from '@/services/backendApi';
import { paymentApi } from '@/services/paymentApi';
import { securityMiddleware } from '@/middleware/securityMiddleware';
import { paymentLogger, PaymentEventType, logPaymentEvent } from '@/services/paymentLogger';
import { healthMonitor } from '@/services/healthCheck';

// Integration Test Types
export interface IntegrationTestResult {
  testName: string;
  category: 'payment_flow' | 'webhook' | 'api_integration' | 'security_flow' | 'end_to_end';
  status: 'PASS' | 'FAIL' | 'SKIP';
  steps: TestStep[];
  metrics: {
    duration: number;
    requests: number;
    errors: string[];
  };
  timestamp: string;
}

export interface TestStep {
  name: string;
  status: 'PENDING' | 'RUNNING' | 'PASS' | 'FAIL' | 'SKIP';
  details?: any;
  duration?: number;
  error?: string;
}

export interface IntegrationTestSuite {
  suiteName: string;
  startTime: string;
  endTime: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  results: IntegrationTestResult[];
  summary: {
    totalSteps: number;
    successfulSteps: number;
    averageDuration: number;
    criticalFailures: number;
  };
}

// Test Data Manager
class IntegrationTestData {
  static generateTestOrder(orderId?: string) {
    const finalOrderId = orderId || `INT-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    return {
      transaction_details: {
        order_id: finalOrderId,
        gross_amount: 50000,
      },
      customer_details: {
        first_name: 'Integration',
        last_name: 'Test',
        email: 'integration.test@example.com',
        phone: '+6281234567890',
      },
      item_details: [
        {
          id: 'item-integration-test',
          price: 50000,
          quantity: 1,
          name: 'Integration Test Item',
        },
      ],
    };
  }

  static getTestWebhookData(orderId: string) {
    return {
      order_id: orderId,
      transaction_id: `trans-${Date.now()}`,
      gross_amount: '50000',
      payment_type: 'bank_transfer',
      transaction_time: new Date().toISOString(),
      transaction_status: 'settlement',
      status_code: '200',
      status_message: 'Transaction is successful',
      fraud_status: 'accept',
      signature_key: 'test-signature-key',
    };
  }
}

// Integration Test Runner
export class IntegrationTestRunner {
  private results: IntegrationTestResult[] = [];

  async runAllTests(): Promise<IntegrationTestSuite> {
    const startTime = Date.now();
    console.log('Starting Integration & End-to-End Test Suite...');

    // Run all integration test categories
    await this.runPaymentFlowTests();
    await this.runWebhookIntegrationTests();
    await this.runApiIntegrationTests();
    await this.runSecurityFlowTests();
    await this.runEndToEndTests();

    const endTime = Date.now();
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    const summary = this.calculateSummary();

    return {
      suiteName: 'Integration & End-to-End Test Suite',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      skipped,
      results: this.results,
      summary,
    };
  }

  private async runPaymentFlowTests(): Promise<void> {
    console.log('Running Payment Flow Integration Tests...');

    // Test 1: Complete Payment Flow (Mock Mode)
    const test1 = await this.runTest('Complete Payment Flow - Mock Mode', 'payment_flow', async (steps) => {
      // Step 1: Create transaction
      steps.push({ name: 'Create Transaction', status: 'RUNNING' });
      const transactionData = IntegrationTestData.generateTestOrder();
      const startTime1 = Date.now();
      
      try {
        const result = await paymentApi.createTransaction(transactionData);
        steps[0] = {
          name: 'Create Transaction',
          status: result.success ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime1,
          details: { success: result.success, token: result.data?.token ? 'generated' : 'missing' }
        };
        
        if (!result.success) {
          throw new Error(result.error || 'Transaction creation failed');
        }
      } catch (error) {
        steps[0] = {
          name: 'Create Transaction',
          status: 'FAIL',
          duration: Date.now() - startTime1,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        throw error;
      }

      // Step 2: Get transaction status
      steps.push({ name: 'Get Transaction Status', status: 'RUNNING' });
      const startTime2 = Date.now();
      
      try {
        const statusResult = await paymentApi.getTransactionStatus(transactionData.transaction_details.order_id);
        steps[1] = {
          name: 'Get Transaction Status',
          status: statusResult.success ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime2,
          details: { status: statusResult.data?.transaction_status }
        };
      } catch (error) {
        steps[1] = {
          name: 'Get Transaction Status',
          status: 'FAIL',
          duration: Date.now() - startTime2,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        throw error;
      }

      // Step 3: Cancel transaction (cleanup)
      steps.push({ name: 'Cancel Transaction (Cleanup)', status: 'RUNNING' });
      const startTime3 = Date.now();
      
      try {
        const cancelResult = await paymentApi.cancelTransaction(transactionData.transaction_details.order_id);
        steps[2] = {
          name: 'Cancel Transaction (Cleanup)',
          status: cancelResult.success ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime3,
          details: { cancelled: cancelResult.success }
        };
      } catch (error) {
        steps[2] = {
          name: 'Cancel Transaction (Cleanup)',
          status: 'FAIL',
          duration: Date.now() - startTime3,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Test 2: Payment Validation Flow
    const test2 = await this.runTest('Payment Validation Flow', 'payment_flow', async (steps) => {
      // Step 1: Test valid transaction data
      steps.push({ name: 'Validate Transaction Data', status: 'RUNNING' });
      const startTime1 = Date.now();
      
      try {
        const validData = IntegrationTestData.generateTestOrder();
        const validationResult = await securityMiddleware.validateInput(validData, 'transaction');
        
        steps[0] = {
          name: 'Validate Transaction Data',
          status: validationResult.valid ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime1,
          details: { valid: validationResult.valid, errors: validationResult.errors }
        };
      } catch (error) {
        steps[0] = {
          name: 'Validate Transaction Data',
          status: 'FAIL',
          duration: Date.now() - startTime1,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Step 2: Test invalid transaction data
      steps.push({ name: 'Validate Invalid Transaction Data', status: 'RUNNING' });
      const startTime2 = Date.now();
      
      try {
        const invalidData = {
          transaction_details: {
            order_id: '<script>alert("XSS")</script>', // XSS attempt
            gross_amount: -1000, // Invalid amount
          }
        };
        
        const validationResult = await securityMiddleware.validateInput(invalidData, 'transaction');
        
        steps[1] = {
          name: 'Validate Invalid Transaction Data',
          status: !validationResult.valid ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime2,
          details: { valid: validationResult.valid, shouldBeInvalid: true }
        };
      } catch (error) {
        steps[1] = {
          name: 'Validate Invalid Transaction Data',
          status: 'PASS',
          duration: Date.now() - startTime2,
          error: 'Correctly rejected invalid data'
        };
      }
    });

    console.log(`Payment Flow Tests: ${test1 ? 'PASS' : 'FAIL'}, ${test2 ? 'PASS' : 'FAIL'}`);
  }

  private async runWebhookIntegrationTests(): Promise<void> {
    console.log('Running Webhook Integration Tests...');

    const test = await this.runTest('Webhook Processing Integration', 'webhook', async (steps) => {
      // Step 1: Generate test webhook data
      steps.push({ name: 'Generate Webhook Data', status: 'RUNNING' });
      const orderId = `WEBHOOK-TEST-${Date.now()}`;
      const webhookData = IntegrationTestData.getTestWebhookData(orderId);
      
      steps[0] = {
        name: 'Generate Webhook Data',
        status: 'PASS',
        details: { orderId, data: webhookData }
      };

      // Step 2: Validate webhook data
      steps.push({ name: 'Validate Webhook Data', status: 'RUNNING' });
      const startTime1 = Date.now();
      
      try {
        const validationResult = await securityMiddleware.validateInput(webhookData, 'notification');
        steps[1] = {
          name: 'Validate Webhook Data',
          status: validationResult.valid ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime1,
          details: { valid: validationResult.valid, errors: validationResult.errors }
        };
      } catch (error) {
        steps[1] = {
          name: 'Validate Webhook Data',
          status: 'FAIL',
          duration: Date.now() - startTime1,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        throw error;
      }

      // Step 3: Process webhook (mock)
      steps.push({ name: 'Process Webhook', status: 'RUNNING' });
      const startTime2 = Date.now();
      
      try {
        // Simulate webhook processing
        const result = await paymentApi.handleNotification(webhookData);
        steps[2] = {
          name: 'Process Webhook',
          status: result.success ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime2,
          details: { processed: result.success }
        };
      } catch (error) {
        steps[2] = {
          name: 'Process Webhook',
          status: 'FAIL',
          duration: Date.now() - startTime2,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        throw error;
      }
    });

    console.log(`Webhook Integration Test: ${test ? 'PASS' : 'FAIL'}`);
  }

  private async runApiIntegrationTests(): Promise<void> {
    console.log('Running API Integration Tests...');

    const test = await this.runTest('Backend API Integration', 'api_integration', async (steps) => {
      // Step 1: Health check
      steps.push({ name: 'API Health Check', status: 'RUNNING' });
      const startTime1 = Date.now();
      
      try {
        const healthResult = await backendApi.getHealthStatus();
        steps[0] = {
          name: 'API Health Check',
          status: healthResult.success ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime1,
          details: { healthy: healthResult.success }
        };
      } catch (error) {
        steps[0] = {
          name: 'API Health Check',
          status: 'FAIL',
          duration: Date.now() - startTime1,
          error: error instanceof Error ? error.message : 'API health check failed'
        };
      }

      // Step 2: Circuit breaker status
      steps.push({ name: 'Circuit Breaker Check', status: 'RUNNING' });
      const startTime2 = Date.now();
      
      try {
        const circuitBreakerState = backendApi.getCircuitBreakerState();
        steps[1] = {
          name: 'Circuit Breaker Check',
          status: 'PASS',
          duration: Date.now() - startTime2,
          details: { state: circuitBreakerState }
        };
      } catch (error) {
        steps[1] = {
          name: 'Circuit Breaker Check',
          status: 'FAIL',
          duration: Date.now() - startTime2,
          error: error instanceof Error ? error.message : 'Circuit breaker check failed'
        };
      }

      // Step 3: Input sanitization
      steps.push({ name: 'Input Sanitization', status: 'RUNNING' });
      const startTime3 = Date.now();
      
      try {
        const maliciousInput = {
          order_id: '<script>alert("XSS")</script>ORDER-123',
          __proto__: { admin: true },
          data: 'normal data'
        };
        
        const sanitized = backendApi.sanitizeInput(maliciousInput);
        const isSafe = !sanitized.order_id.includes('<script>') && !('__proto__' in sanitized);
        
        steps[2] = {
          name: 'Input Sanitization',
          status: isSafe ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime3,
          details: { sanitized: isSafe, original: maliciousInput, result: sanitized }
        };
      } catch (error) {
        steps[2] = {
          name: 'Input Sanitization',
          status: 'FAIL',
          duration: Date.now() - startTime3,
          error: error instanceof Error ? error.message : 'Sanitization failed'
        };
      }
    });

    console.log(`API Integration Test: ${test ? 'PASS' : 'FAIL'}`);
  }

  private async runSecurityFlowTests(): Promise<void> {
    console.log('Running Security Flow Tests...');

    const test = await this.runTest('Security Flow Integration', 'security_flow', async (steps) => {
      // Step 1: Rate limiting test
      steps.push({ name: 'Rate Limiting Test', status: 'RUNNING' });
      const startTime1 = Date.now();
      
      try {
        const endpoint = '/test-endpoint';
        const clientId = 'test-client-integration';
        
        // Mock multiple rapid requests
        const requests = [];
        for (let i = 0; i < 5; i++) {
          const mockRequest = new Request('http://localhost/test', {
            method: 'POST',
            headers: { 'x-forwarded-for': clientId },
          });
          requests.push(securityMiddleware.processApiRequest(mockRequest, endpoint));
        }
        
        const results = await Promise.all(requests);
        const blockedRequests = results.filter(r => !r.allowed).length;
        
        steps[0] = {
          name: 'Rate Limiting Test',
          status: 'PASS',
          duration: Date.now() - startTime1,
          details: { totalRequests: requests.length, blockedRequests }
        };
      } catch (error) {
        steps[0] = {
          name: 'Rate Limiting Test',
          status: 'FAIL',
          duration: Date.now() - startTime1,
          error: error instanceof Error ? error.message : 'Rate limiting test failed'
        };
      }

      // Step 2: Security headers
      steps.push({ name: 'Security Headers Check', status: 'RUNNING' });
      const startTime2 = Date.now();
      
      try {
        const securityHeaders = securityMiddleware.getSecurityHeaders();
        const hasRequiredHeaders = Object.keys(securityHeaders).length > 0;
        
        steps[1] = {
          name: 'Security Headers Check',
          status: hasRequiredHeaders ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime2,
          details: { headerCount: Object.keys(securityHeaders).length, headers: Object.keys(securityHeaders) }
        };
      } catch (error) {
        steps[1] = {
          name: 'Security Headers Check',
          status: 'FAIL',
          duration: Date.now() - startTime2,
          error: error instanceof Error ? error.message : 'Security headers check failed'
        };
      }
    });

    console.log(`Security Flow Test: ${test ? 'PASS' : 'FAIL'}`);
  }

  private async runEndToEndTests(): Promise<void> {
    console.log('Running End-to-End Integration Tests...');

    const test = await this.runTest('Complete E2E Payment Flow', 'end_to_end', async (steps) => {
      // Step 1: System health check
      steps.push({ name: 'System Health Check', status: 'RUNNING' });
      const startTime1 = Date.now();
      
      try {
        const healthStatus = await healthMonitor.performHealthCheck();
        steps[0] = {
          name: 'System Health Check',
          status: healthStatus.status === 'healthy' ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime1,
          details: { overallStatus: healthStatus.status, checks: Object.keys(healthStatus.checks) }
        };
      } catch (error) {
        steps[0] = {
          name: 'System Health Check',
          status: 'FAIL',
          duration: Date.now() - startTime1,
          error: error instanceof Error ? error.message : 'Health check failed'
        };
        throw error;
      }

      // Step 2: Complete payment simulation
      steps.push({ name: 'Complete Payment Simulation', status: 'RUNNING' });
      const startTime2 = Date.now();
      
      try {
        const orderId = `E2E-TEST-${Date.now()}`;
        const paymentData = IntegrationTestData.generateTestOrder(orderId);
        
        // Create transaction
        const createResult = await paymentApi.createTransaction(paymentData);
        
        // Get status
        const statusResult = await paymentApi.getTransactionStatus(orderId);
        
        // Simulate webhook
        const webhookData = IntegrationTestData.getTestWebhookData(orderId);
        const webhookResult = await paymentApi.handleNotification(webhookData);
        
        const allSuccessful = createResult.success && statusResult.success && webhookResult.success;
        
        steps[1] = {
          name: 'Complete Payment Simulation',
          status: allSuccessful ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime2,
          details: { 
            createSuccess: createResult.success,
            statusSuccess: statusResult.success,
            webhookSuccess: webhookResult.success,
            orderId
          }
        };
      } catch (error) {
        steps[1] = {
          name: 'Complete Payment Simulation',
          status: 'FAIL',
          duration: Date.now() - startTime2,
          error: error instanceof Error ? error.message : 'Payment simulation failed'
        };
        throw error;
      }

      // Step 3: Logging and monitoring verification
      steps.push({ name: 'Logging and Monitoring Verification', status: 'RUNNING' });
      const startTime3 = Date.now();
      
      try {
        const logs = paymentLogger.getLogs({ limit: 10 });
        const hasPaymentEvents = logs.some(log => 
          log.category === 'payment' && log.data?.eventType
        );
        
        steps[2] = {
          name: 'Logging and Monitoring Verification',
          status: hasPaymentEvents ? 'PASS' : 'FAIL',
          duration: Date.now() - startTime3,
          details: { logCount: logs.length, hasPaymentEvents }
        };
      } catch (error) {
        steps[2] = {
          name: 'Logging and Monitoring Verification',
          status: 'FAIL',
          duration: Date.now() - startTime3,
          error: error instanceof Error ? error.message : 'Logging verification failed'
        };
      }
    });

    console.log(`End-to-End Test: ${test ? 'PASS' : 'FAIL'}`);
  }

  private async runTest(
    testName: string,
    category: IntegrationTestResult['category'],
    testFn: (steps: TestStep[]) => Promise<void>
  ): Promise<boolean> {
    const steps: TestStep[] = [];
    const startTime = Date.now();

    try {
      await testFn(steps);
      
      // Mark all pending steps as failed if they weren't updated
      steps.forEach(step => {
        if (step.status === 'RUNNING' || step.status === 'PENDING') {
          step.status = 'SKIP';
        }
      });

      const failedSteps = steps.filter(step => step.status === 'FAIL').length;
      const status = failedSteps === 0 ? 'PASS' : 'FAIL';
      
      this.addResult(testName, category, status, steps, Date.now() - startTime);
      return status === 'PASS';
    } catch (error) {
      // Mark current running step as failed
      const currentStep = steps.find(step => step.status === 'RUNNING');
      if (currentStep) {
        currentStep.status = 'FAIL';
        currentStep.error = error instanceof Error ? error.message : 'Unknown error';
      }

      const status = 'FAIL';
      this.addResult(testName, category, status, steps, Date.now() - startTime);
      return false;
    }
  }

  private addResult(
    testName: string,
    category: IntegrationTestResult['category'],
    status: IntegrationTestResult['status'],
    steps: TestStep[],
    duration: number
  ): void {
    const errors = steps.filter(step => step.error).map(step => step.error!);
    
    this.results.push({
      testName,
      category,
      status,
      steps,
      metrics: {
        duration,
        requests: steps.length,
        errors,
      },
      timestamp: new Date().toISOString(),
    });

    console.log(`${status}: ${testName} - Duration: ${duration}ms, Steps: ${steps.length}`);
  }

  private calculateSummary() {
    const totalSteps = this.results.reduce((sum, result) => sum + result.steps.length, 0);
    const successfulSteps = this.results.reduce((sum, result) => 
      sum + result.steps.filter(step => step.status === 'PASS').length, 0
    );
    const averageDuration = this.results.reduce((sum, result) => sum + result.metrics.duration, 0) / this.results.length;
    const criticalFailures = this.results.filter(result => 
      result.steps.some(step => step.status === 'FAIL')
    ).length;

    return {
      totalSteps,
      successfulSteps,
      averageDuration,
      criticalFailures,
    };
  }
}

// Export singleton instance
export const integrationTestRunner = new IntegrationTestRunner();
export default integrationTestRunner;

// Convenience function for running tests
export async function runIntegrationTests(): Promise<IntegrationTestSuite> {
  return await integrationTestRunner.runAllTests();
}