
/**
 * Performance Testing Suite for Payment System
 * Comprehensive performance tests including load testing, stress testing, and monitoring
 */

import { backendApi } from '@/services/backendApi';
import { paymentLogger, PaymentEventType, logApiEvent } from '@/services/paymentLogger';
import { healthMonitor } from '@/services/healthCheck';

// Performance Test Types
export interface PerformanceTestResult {
  testName: string;
  category: 'load' | 'stress' | 'endurance' | 'spike' | 'volume';
  status: 'PASS' | 'FAIL' | 'WARNING';
  metrics: PerformanceMetrics;
  details?: any;
  timestamp: string;
}

export interface PerformanceMetrics {
  responseTime: {
    average: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requests: number;
    successful: number;
    failed: number;
    rate: number; // requests per second
  };
  resources: {
    memory: {
      before: number;
      after: number;
      peak: number;
    };
    cpu: {
      average: number;
      peak: number;
    };
  };
  errors: {
    total: number;
    rate: number;
    types: Record<string, number>;
  };
}

export interface PerformanceTestSuite {
  suiteName: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  results: PerformanceTestResult[];
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    throughput: number;
    successRate: number;
    errorRate: number;
  };
}

// Performance Test Configuration
interface PerformanceTestConfig {
  loadTest: {
    concurrentUsers: number;
    rampUpTime: number;
    duration: number;
    targetRPS: number;
  };
  stressTest: {
    maxUsers: number;
    stepSize: number;
    stepDuration: number;
  };
  enduranceTest: {
    duration: number;
    users: number;
    targetRPS: number;
  };
  spikeTest: {
    baselineUsers: number;
    spikeUsers: number;
    spikeDuration: number;
    recoveryDuration: number;
  };
  volumeTest: {
    records: number;
    batchSize: number;
  };
}

// Test Data Generator
class PerformanceTestData {
  static generateTransactionData(count: number = 1): any[] {
    const transactions = [];
    for (let i = 0; i < count; i++) {
      transactions.push({
        transaction_details: {
          order_id: `PERF-TEST-${Date.now()}-${i}`,
          gross_amount: Math.floor(Math.random() * 100000) + 10000,
        },
        customer_details: {
          first_name: 'Perf',
          last_name: `Test${i}`,
          email: `perf.test${i}@example.com`,
          phone: '+6281234567890',
        },
        item_details: [
          {
            id: `item-${i}`,
            price: Math.floor(Math.random() * 50000) + 10000,
            quantity: Math.floor(Math.random() * 5) + 1,
            name: `Performance Test Item ${i}`,
          },
        ],
      });
    }
    return transactions;
  }

  static generateWebhookData(count: number = 1): any[] {
    const webhooks = [];
    for (let i = 0; i < count; i++) {
      webhooks.push({
        order_id: `PERF-WEBHOOK-${Date.now()}-${i}`,
        transaction_id: `trans-${Date.now()}-${i}`,
        gross_amount: (Math.floor(Math.random() * 100) + 1) * 1000,
        payment_type: ['bank_transfer', 'credit_card', 'e_wallet'][Math.floor(Math.random() * 3)],
        transaction_time: new Date().toISOString(),
        transaction_status: ['settlement', 'pending', 'capture'][Math.floor(Math.random() * 3)],
        status_code: '200',
        status_message: 'Transaction is successful',
        fraud_status: 'accept',
        signature_key: `mock-signature-${i}`,
      });
    }
    return webhooks;
  }
}

// Performance Monitor
class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number;
  private requests: number[] = [];
  private errors: string[] = [];

  constructor() {
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      responseTime: {
        average: 0,
        min: Infinity,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      },
      throughput: {
        requests: 0,
        successful: 0,
        failed: 0,
        rate: 0,
      },
      resources: {
        memory: {
          before: this.getMemoryUsage(),
          after: 0,
          peak: 0,
        },
        cpu: {
          average: 0,
          peak: 0,
        },
      },
      errors: {
        total: 0,
        rate: 0,
        types: {},
      },
    };
  }

  startRequest(): number {
    return performance.now();
  }

  endRequest(startTime: number, success: boolean, error?: string): void {
    const responseTime = performance.now() - startTime;
    this.requests.push(responseTime);
    this.metrics.throughput.requests++;

    if (success) {
      this.metrics.throughput.successful++;
    } else {
      this.metrics.throughput.failed++;
      this.metrics.errors.total++;
      if (error) {
        this.errors.push(error);
        const errorType = this.categorizeError(error);
        this.metrics.errors.types[errorType] = (this.metrics.errors.types[errorType] || 0) + 1;
      }
    }

    // Update response time statistics
    this.updateResponseTimeStats();
    this.updateResourceUsage();
  }

  private updateResponseTimeStats(): void {
    if (this.requests.length === 0) return;

    const sorted = [...this.requests].sort((a, b) => a - b);
    const total = sorted.reduce((sum, time) => sum + time, 0);

    this.metrics.responseTime.average = total / sorted.length;
    this.metrics.responseTime.min = sorted[0];
    this.metrics.responseTime.max = sorted[sorted.length - 1];
    this.metrics.responseTime.p50 = this.getPercentile(sorted, 0.5);
    this.metrics.responseTime.p95 = this.getPercentile(sorted, 0.95);
    this.metrics.responseTime.p99 = this.getPercentile(sorted, 0.99);

    // Update throughput
    const duration = (Date.now() - this.startTime) / 1000; // seconds
    this.metrics.throughput.rate = this.metrics.throughput.requests / duration;
    this.metrics.errors.rate = this.errors.length / duration;
  }

  private getPercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)];
  }

  private getMemoryUsage(): number {
    const memory = (performance as any).memory;
    return memory ? memory.usedJSHeapSize : 0;
  }

  private updateResourceUsage(): void {
    const currentMemory = this.getMemoryUsage();
    this.metrics.resources.memory.after = currentMemory;
    this.metrics.resources.memory.peak = Math.max(this.metrics.resources.memory.peak, currentMemory);
  }

  private categorizeError(error: string): string {
    if (error.includes('timeout')) return 'timeout';
    if (error.includes('network')) return 'network';
    if (error.includes('validation')) return 'validation';
    if (error.includes('authorization')) return 'auth';
    if (error.includes('server')) return 'server';
    return 'unknown';
  }

  finalize(): PerformanceMetrics {
    this.metrics.resources.memory.after = this.getMemoryUsage();
    return { ...this.metrics };
  }
}

// Performance Test Runner
export class PerformanceTestRunner {
  private results: PerformanceTestResult[] = [];

  async runAllTests(): Promise<PerformanceTestSuite> {
    const startTime = Date.now();
    console.log('Starting Performance Test Suite...');

    // Run performance tests
    await this.runLoadTest();
    await this.runStressTest();
    await this.runEnduranceTest();
    await this.runSpikeTest();
    await this.runVolumeTest();

    const endTime = Date.now();
    const duration = endTime - startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    const summary = this.calculateSummary();

    return {
      suiteName: 'Performance Test Suite',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      results: this.results,
      summary,
    };
  }

  private async runLoadTest(): Promise<void> {
    console.log('Running Load Test...');
    const monitor = new PerformanceMonitor();
    const concurrentUsers = 10;
    const duration = 30000; // 30 seconds
    const targetRPS = 5;

    const promises = [];
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(this.simulateLoad(monitor, duration, targetRPS));
    }

    await Promise.all(promises);
    const metrics = monitor.finalize();

    this.addResult('Load Test - 10 Concurrent Users', 'load', this.evaluateMetrics(metrics, {
      maxResponseTime: 2000,
      minSuccessRate: 95,
      maxErrorRate: 5,
    }), metrics);
  }

  private async runStressTest(): Promise<void> {
    console.log('Running Stress Test...');
    const monitor = new PerformanceMonitor();
    const maxUsers = 50;
    const stepSize = 10;
    const stepDuration = 5000; // 5 seconds per step

    for (let users = stepSize; users <= maxUsers; users += stepSize) {
      console.log(`Testing with ${users} concurrent users...`);
      const promises = [];
      
      for (let i = 0; i < users; i++) {
        promises.push(this.simulateUserAction(monitor));
      }
      
      await Promise.all(promises);
      await this.delay(stepDuration);
    }

    const metrics = monitor.finalize();
    this.addResult('Stress Test - Progressive Load', 'stress', this.evaluateMetrics(metrics, {
      maxResponseTime: 5000,
      minSuccessRate: 80,
      maxErrorRate: 20,
    }), metrics);
  }

  private async runEnduranceTest(): Promise<void> {
    console.log('Running Endurance Test...');
    const monitor = new PerformanceMonitor();
    const users = 5;
    const duration = 60000; // 1 minute
    const targetRPS = 2;

    const promises = [];
    for (let i = 0; i < users; i++) {
      promises.push(this.simulateLoad(monitor, duration, targetRPS));
    }

    await Promise.all(promises);
    const metrics = monitor.finalize();

    this.addResult('Endurance Test - Sustained Load', 'endurance', this.evaluateMetrics(metrics, {
      maxResponseTime: 3000,
      minSuccessRate: 90,
      maxErrorRate: 10,
    }), metrics);
  }

  private async runSpikeTest(): Promise<void> {
    console.log('Running Spike Test...');
    const monitor = new PerformanceMonitor();
    const baselineUsers = 2;
    const spikeUsers = 20;
    const spikeDuration = 10000; // 10 seconds
    const recoveryDuration = 30000; // 30 seconds

    // Baseline load
    const baselinePromises = [];
    for (let i = 0; i < baselineUsers; i++) {
      baselinePromises.push(this.simulateUserAction(monitor));
    }
    await Promise.all(baselinePromises);

    // Spike load
    const spikePromises = [];
    for (let i = 0; i < spikeUsers; i++) {
      spikePromises.push(this.simulateUserAction(monitor));
    }
    await Promise.all(spikePromises);

    // Recovery period
    await this.delay(spikeDuration);

    const recoveryPromises = [];
    for (let i = 0; i < baselineUsers; i++) {
      recoveryPromises.push(this.simulateUserAction(monitor));
    }
    await Promise.all(recoveryPromises);

    await this.delay(recoveryDuration);

    const metrics = monitor.finalize();
    this.addResult('Spike Test - Traffic Spike Handling', 'spike', this.evaluateMetrics(metrics, {
      maxResponseTime: 4000,
      minSuccessRate: 85,
      maxErrorRate: 15,
    }), metrics);
  }

  private async runVolumeTest(): Promise<void> {
    console.log('Running Volume Test...');
    const monitor = new PerformanceMonitor();
    const recordCount = 100;
    const batchSize = 10;

    for (let i = 0; i < recordCount; i += batchSize) {
      const batch = PerformanceTestData.generateTransactionData(Math.min(batchSize, recordCount - i));
      const promises = batch.map(data => this.simulateApiCall(monitor, 'createTransaction', data));
      await Promise.all(promises);
    }

    const metrics = monitor.finalize();
    this.addResult('Volume Test - High Volume Processing', 'volume', this.evaluateMetrics(metrics, {
      maxResponseTime: 3000,
      minSuccessRate: 95,
      maxErrorRate: 5,
    }), metrics);
  }

  private async simulateLoad(monitor: PerformanceMonitor, duration: number, targetRPS: number): Promise<void> {
    const endTime = Date.now() + duration;
    const interval = 1000 / targetRPS;

    while (Date.now() < endTime) {
      await this.simulateUserAction(monitor);
      await this.delay(interval);
    }
  }

  private async simulateUserAction(monitor: PerformanceMonitor): Promise<void> {
    const startTime = monitor.startRequest();
    
    try {
      // Simulate different types of user actions
      const actions = [
        () => this.simulateApiCall(monitor, 'getHealthStatus'),
        () => this.simulateTransactionCreation(monitor),
        () => this.simulateWebhookProcessing(monitor),
      ];

      const action = actions[Math.floor(Math.random() * actions.length)];
      await action();
      
      monitor.endRequest(startTime, true);
    } catch (error) {
      monitor.endRequest(startTime, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async simulateApiCall(monitor: PerformanceMonitor, method: string, data?: any): Promise<void> {
    try {
      switch (method) {
        case 'getHealthStatus':
          await backendApi.getHealthStatus();
          break;
        case 'createTransaction':
          await backendApi.createTransaction(data);
          break;
        case 'verifyNotification':
          await backendApi.verifyNotificationSignature(data);
          break;
        default:
          throw new Error(`Unknown API method: ${method}`);
      }
    } catch (error) {
      // Simulate some failures to test error handling
      if (Math.random() < 0.05) { // 5% failure rate
        throw error;
      }
    }
  }

  private async simulateTransactionCreation(monitor: PerformanceMonitor): Promise<void> {
    const transactionData = PerformanceTestData.generateTransactionData(1)[0];
    await this.simulateApiCall(monitor, 'createTransaction', transactionData);
  }

  private async simulateWebhookProcessing(monitor: PerformanceMonitor): Promise<void> {
    const webhookData = PerformanceTestData.generateWebhookData(1)[0];
    await this.simulateApiCall(monitor, 'verifyNotification', webhookData);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private evaluateMetrics(metrics: PerformanceMetrics, thresholds: any): 'PASS' | 'FAIL' | 'WARNING' {
    const checks = {
      responseTime: metrics.responseTime.average <= thresholds.maxResponseTime,
      successRate: (metrics.throughput.successful / metrics.throughput.requests * 100) >= thresholds.minSuccessRate,
      errorRate: (metrics.throughput.failed / metrics.throughput.requests * 100) <= thresholds.maxErrorRate,
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    if (passedChecks === totalChecks) {
      return 'PASS';
    } else if (passedChecks >= totalChecks * 0.7) { // At least 70% passed
      return 'WARNING';
    } else {
      return 'FAIL';
    }
  }

  private calculateSummary() {
    const totalRequests = this.results.reduce((sum, result) => sum + result.metrics.throughput.requests, 0);
    const totalSuccessful = this.results.reduce((sum, result) => sum + result.metrics.throughput.successful, 0);
    const averageResponseTime = this.results.reduce((sum, result) => sum + result.metrics.responseTime.average, 0) / this.results.length;
    const totalThroughput = this.results.reduce((sum, result) => sum + result.metrics.throughput.rate, 0);
    const successRate = totalRequests > 0 ? (totalSuccessful / totalRequests * 100) : 0;
    const errorRate = 100 - successRate;

    return {
      totalRequests,
      averageResponseTime,
      throughput: totalThroughput,
      successRate,
      errorRate,
    };
  }

  private addResult(
    testName: string,
    category: 'load' | 'stress' | 'endurance' | 'spike' | 'volume',
    status: 'PASS' | 'FAIL' | 'WARNING',
    metrics: PerformanceMetrics
  ): void {
    this.results.push({
      testName,
      category,
      status,
      metrics,
      timestamp: new Date().toISOString(),
    });

    console.log(`${status}: ${testName} - Avg Response: ${metrics.responseTime.average.toFixed(2)}ms`);
  }
}

// Export singleton instance
export const performanceTestRunner = new PerformanceTestRunner();
export default performanceTestRunner;

// Convenience function for running tests
export async function runPerformanceTests(): Promise<PerformanceTestSuite> {
  return await performanceTestRunner.runAllTests();
}