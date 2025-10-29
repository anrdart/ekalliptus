/**
 * Health Check & Monitoring System
 * Provides real-time system health monitoring and alerting
 */

import { backendApi } from './backendApi';
import { paymentLogger, PaymentEventType, LogLevel, logApiEvent, logPaymentEvent } from './paymentLogger';

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    api: HealthCheck;
    database: HealthCheck;
    paymentGateway: HealthCheck;
    webhookProcessing: HealthCheck;
    circuitBreaker: HealthCheck;
  };
  metrics: SystemMetrics;
  alerts: HealthAlert[];
}

export interface HealthCheck {
  status: 'pass' | 'fail' | 'warning';
  responseTime: number;
  message: string;
  lastCheck: string;
  consecutiveFailures?: number;
  details?: any;
}

export interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  payments: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
  };
  errors: {
    total: number;
    critical: number;
    recent: number;
  };
}

export interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  source: string;
  details?: any;
}

// Health Monitor Configuration
interface HealthMonitorConfig {
  checkInterval: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    successRate: number;
  };
  consecutiveFailures: number;
  recoveryThreshold: number;
}

class HealthMonitor {
  private config: HealthMonitorConfig;
  private lastCheckTime: number = 0;
  private alerts: HealthAlert[] = [];
  private consecutiveFailures: Map<string, number> = new Map();
  private startTime: number = Date.now();

  constructor(config?: Partial<HealthMonitorConfig>) {
    this.config = {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        responseTime: 5000, // 5 seconds
        errorRate: 10, // 10%
        memoryUsage: 80, // 80%
        successRate: 90, // 90%
      },
      consecutiveFailures: 3,
      recoveryThreshold: 2,
      ...config,
    };
  }

  async performHealthCheck(): Promise<HealthStatus> {
    const checks = {
      api: await this.checkApiHealth(),
      database: await this.checkDatabaseHealth(),
      paymentGateway: await this.checkPaymentGatewayHealth(),
      webhookProcessing: await this.checkWebhookProcessingHealth(),
      circuitBreaker: await this.checkCircuitBreakerHealth(),
    };

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(checks);
    
    // Get system metrics
    const metrics = await this.getSystemMetrics();
    
    // Process alerts
    this.processAlerts(checks, metrics);

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      metrics,
      alerts: this.alerts.filter(alert => !alert.resolved),
    };

    logApiEvent(PaymentEventType.API_SUCCESS, {
      action: 'health_check',
      status: overallStatus,
      checks: Object.keys(checks),
      metrics,
    });

    return healthStatus;
  }

  private async checkApiHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const response = await backendApi.getHealthStatus();
      const responseTime = Date.now() - startTime;

      if (response.success) {
        this.resetConsecutiveFailures('api');
        return {
          status: 'pass',
          responseTime,
          message: 'API is healthy',
          lastCheck: new Date().toISOString(),
        };
      } else {
        this.incrementConsecutiveFailures('api');
        return {
          status: 'fail',
          responseTime,
          message: `API health check failed: ${response.error}`,
          lastCheck: new Date().toISOString(),
          consecutiveFailures: this.consecutiveFailures.get('api') || 0,
        };
      }
    } catch (error) {
      this.incrementConsecutiveFailures('api');
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `API health check error: ${error}`,
        lastCheck: new Date().toISOString(),
        consecutiveFailures: this.consecutiveFailures.get('api') || 0,
      };
    }
  }

  private async checkDatabaseHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check localStorage availability (mock database health)
      const testKey = 'health_check_test';
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      const responseTime = Date.now() - startTime;

      if (retrieved === 'test') {
        this.resetConsecutiveFailures('database');
        return {
          status: 'pass',
          responseTime,
          message: 'Database is healthy',
          lastCheck: new Date().toISOString(),
        };
      } else {
        this.incrementConsecutiveFailures('database');
        return {
          status: 'fail',
          responseTime,
          message: 'Database write/read test failed',
          lastCheck: new Date().toISOString(),
          consecutiveFailures: this.consecutiveFailures.get('database') || 0,
        };
      }
    } catch (error) {
      this.incrementConsecutiveFailures('database');
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `Database health check error: ${error}`,
        lastCheck: new Date().toISOString(),
        consecutiveFailures: this.consecutiveFailures.get('database') || 0,
      };
    }
  }

  private async checkPaymentGatewayHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check Midtrans API availability
      const midtransUrl = 'https://api.midtrans.com/v1/payment_methods';
      const response = await fetch(midtransUrl, {
        method: 'HEAD',
        mode: 'no-cors', // This will always succeed for CORS
      });

      const responseTime = Date.now() - startTime;

      this.resetConsecutiveFailures('paymentGateway');
      return {
        status: 'pass',
        responseTime,
        message: 'Payment gateway is accessible',
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      this.incrementConsecutiveFailures('paymentGateway');
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `Payment gateway check failed: ${error}`,
        lastCheck: new Date().toISOString(),
        consecutiveFailures: this.consecutiveFailures.get('paymentGateway') || 0,
      };
    }
  }

  private async checkWebhookProcessingHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check webhook processing capabilities
      const recentLogs = paymentLogger.getLogs({ 
        limit: 10,
        category: 'webhook' 
      });

      const webhookErrors = recentLogs.filter(log => 
        log.level === 'error' && 
        new Date(log.timestamp) > new Date(Date.now() - 300000) // Last 5 minutes
      );

      const responseTime = Date.now() - startTime;

      if (webhookErrors.length === 0) {
        this.resetConsecutiveFailures('webhookProcessing');
        return {
          status: 'pass',
          responseTime,
          message: 'Webhook processing is healthy',
          lastCheck: new Date().toISOString(),
        };
      } else {
        this.incrementConsecutiveFailures('webhookProcessing');
        return {
          status: 'warning',
          responseTime,
          message: `${webhookErrors.length} webhook errors in last 5 minutes`,
          lastCheck: new Date().toISOString(),
          consecutiveFailures: this.consecutiveFailures.get('webhookProcessing') || 0,
        };
      }
    } catch (error) {
      this.incrementConsecutiveFailures('webhookProcessing');
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `Webhook processing check failed: ${error}`,
        lastCheck: new Date().toISOString(),
        consecutiveFailures: this.consecutiveFailures.get('webhookProcessing') || 0,
      };
    }
  }

  private async checkCircuitBreakerHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const circuitBreakerState = backendApi.getCircuitBreakerState();
      const responseTime = Date.now() - startTime;

      this.resetConsecutiveFailures('circuitBreaker');
      return {
        status: 'pass',
        responseTime: Date.now() - startTime,
        message: `Circuit breaker is ${circuitBreakerState}`,
        lastCheck: new Date().toISOString(),
        details: { state: circuitBreakerState },
      };
    } catch (error) {
      this.incrementConsecutiveFailures('circuitBreaker');
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `Circuit breaker check failed: ${error}`,
        lastCheck: new Date().toISOString(),
        consecutiveFailures: this.consecutiveFailures.get('circuitBreaker') || 0,
      };
    }
  }

  private async getSystemMetrics(): Promise<SystemMetrics> {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Memory metrics (browser-based approximation)
    const memory = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
    };

    // Request metrics from logger
    const apiLogs = paymentLogger.getLogs({ 
      category: 'api',
      startDate: new Date(now - 3600000) // Last hour
    });

    const successfulRequests = apiLogs.filter(log => 
      log.data?.eventType === PaymentEventType.API_SUCCESS
    ).length;

    const failedRequests = apiLogs.filter(log => 
      log.data?.eventType === PaymentEventType.API_ERROR
    ).length;

    const totalRequests = successfulRequests + failedRequests;

    // Payment metrics
    const paymentLogs = paymentLogger.getLogs({ 
      category: 'payment',
      startDate: new Date(now - 3600000) // Last hour
    });

    const successfulPayments = paymentLogs.filter(log => 
      log.data?.eventType === PaymentEventType.PAYMENT_SUCCESS
    ).length;

    const failedPayments = paymentLogs.filter(log => 
      log.data?.eventType === PaymentEventType.PAYMENT_FAILED
    ).length;

    const pendingPayments = paymentLogs.filter(log => 
      log.data?.eventType === PaymentEventType.PAYMENT_PENDING
    ).length;

    const totalPayments = successfulPayments + failedPayments + pendingPayments;
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 100;

    // Error metrics
    const errorLogs = paymentLogger.getLogs({
      level: LogLevel.ERROR,
      startDate: new Date(now - 3600000) // Last hour
    });

    return {
      uptime,
      memory: {
        used: memory.usedJSHeapSize || 0,
        total: memory.totalJSHeapSize || 0,
        percentage: memory.totalJSHeapSize > 0 ? 
          (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0,
      },
      requests: {
        total: totalRequests,
        successful: successfulRequests,
        failed: failedRequests,
        averageResponseTime: this.calculateAverageResponseTime(apiLogs),
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments,
        pending: pendingPayments,
        successRate,
      },
      errors: {
        total: errorLogs.length,
        critical: errorLogs.filter(log => 
          log.message.toLowerCase().includes('critical') || 
          log.message.toLowerCase().includes('fatal')
        ).length,
        recent: errorLogs.filter(log => 
          new Date(log.timestamp) > new Date(now - 60000) // Last minute
        ).length,
      },
    };
  }

  private calculateAverageResponseTime(logs: any[]): number {
    const responseTimeLogs = logs.filter(log => log.data?.processingTime);
    
    if (responseTimeLogs.length === 0) return 0;
    
    const totalTime = responseTimeLogs.reduce((sum, log) => sum + log.data.processingTime, 0);
    return Math.round(totalTime / responseTimeLogs.length);
  }

  private calculateOverallStatus(checks: any): 'healthy' | 'degraded' | 'unhealthy' {
    const checkValues = Object.values(checks) as HealthCheck[];
    const failedChecks = checkValues.filter(check => check.status === 'fail');
    const warningChecks = checkValues.filter(check => check.status === 'warning');

    if (failedChecks.length > 0) {
      return 'unhealthy';
    }

    if (warningChecks.length > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  private processAlerts(checks: any, metrics: SystemMetrics): void {
    const newAlerts: HealthAlert[] = [];

    // API response time alert
    const apiCheck = checks.api;
    if (apiCheck.responseTime > this.config.alertThresholds.responseTime) {
      newAlerts.push({
        id: `response_time_${Date.now()}`,
        type: 'warning',
        message: `High API response time: ${apiCheck.responseTime}ms`,
        timestamp: new Date().toISOString(),
        resolved: false,
        source: 'health_check',
        details: { responseTime: apiCheck.responseTime, threshold: this.config.alertThresholds.responseTime },
      });
    }

    // Error rate alert
    const errorRate = metrics.requests.total > 0 ? 
      (metrics.requests.failed / metrics.requests.total) * 100 : 0;
    
    if (errorRate > this.config.alertThresholds.errorRate) {
      newAlerts.push({
        id: `error_rate_${Date.now()}`,
        type: 'critical',
        message: `High error rate: ${errorRate.toFixed(2)}%`,
        timestamp: new Date().toISOString(),
        resolved: false,
        source: 'health_check',
        details: { errorRate, threshold: this.config.alertThresholds.errorRate },
      });
    }

    // Memory usage alert
    if (metrics.memory.percentage > this.config.alertThresholds.memoryUsage) {
      newAlerts.push({
        id: `memory_usage_${Date.now()}`,
        type: 'warning',
        message: `High memory usage: ${metrics.memory.percentage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        resolved: false,
        source: 'health_check',
        details: { memoryUsage: metrics.memory.percentage, threshold: this.config.alertThresholds.memoryUsage },
      });
    }

    // Payment success rate alert
    if (metrics.payments.successRate < this.config.alertThresholds.successRate && metrics.payments.total > 0) {
      newAlerts.push({
        id: `success_rate_${Date.now()}`,
        type: 'warning',
        message: `Low payment success rate: ${metrics.payments.successRate.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        resolved: false,
        source: 'health_check',
        details: { successRate: metrics.payments.successRate, threshold: this.config.alertThresholds.successRate },
      });
    }

    // Add new alerts
    this.alerts.push(...newAlerts);

    // Remove resolved alerts
    this.resolveOldAlerts();

    // Log alerts
    newAlerts.forEach(alert => {
      if (alert.type === 'critical') {
        paymentLogger.error(`CRITICAL ALERT: ${alert.message}`, undefined, { alert }, 'api');
      } else {
        paymentLogger.warn(`ALERT: ${alert.message}`, { alert }, 'api');
      }
    });
  }

  private resolveOldAlerts(): void {
    // Mark alerts as resolved if conditions improve
    this.alerts.forEach(alert => {
      if (!alert.resolved) {
        // Simple resolution logic - mark as resolved if no new alerts of same type in last 5 minutes
        const recentSimilarAlerts = this.alerts.filter(a => 
          a !== alert && 
          a.message.includes(alert.message.split(':')[0]) &&
          new Date(a.timestamp) > new Date(Date.now() - 300000)
        );

        if (recentSimilarAlerts.length === 0) {
          alert.resolved = true;
        }
      }
    });

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  private incrementConsecutiveFailures(service: string): void {
    const current = this.consecutiveFailures.get(service) || 0;
    this.consecutiveFailures.set(service, current + 1);
  }

  private resetConsecutiveFailures(service: string): void {
    this.consecutiveFailures.set(service, 0);
  }

  // Public methods
  getAlerts(includeResolved: boolean = false): HealthAlert[] {
    return includeResolved ? this.alerts : this.alerts.filter(alert => !alert.resolved);
  }

  dismissAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  getConfig(): HealthMonitorConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<HealthMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor();
export default healthMonitor;