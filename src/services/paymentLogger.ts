// Payment logging service for debugging and monitoring
const PAYMENT_LOGGING_ENABLED = import.meta.env.VITE_ENABLE_PAYMENT_LOGGING === "true";
const PAYMENT_DEBUG_MODE = import.meta.env.VITE_ENABLE_DEBUG_MODE === "true";

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Log entry interface
export interface PaymentLogEntry {
  timestamp: string;
  level: LogLevel;
  category: 'payment' | 'webhook' | 'api' | 'ui' | 'validation';
  message: string;
  data?: any;
  orderId?: string;
  userId?: string;
  sessionId?: string;
  error?: Error;
}

// Payment event types
export enum PaymentEventType {
  FORM_SUBMIT = 'form_submit',
  PAYMENT_INIT = 'payment_init',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_CANCELLED = 'payment_cancelled',
  WEBHOOK_RECEIVED = 'webhook_received',
  WEBHOOK_PROCESSED = 'webhook_processed',
  WEBHOOK_FAILED = 'webhook_failed',
  API_CALL = 'api_call',
  API_SUCCESS = 'api_success',
  API_ERROR = 'api_error',
  VALIDATION_ERROR = 'validation_error',
  REDIRECT_SUCCESS = 'redirect_success',
  REDIRECT_FAILED = 'redirect_failed',
}

// Payment analytics interface
export interface PaymentAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  cancelledTransactions: number;
  averageProcessingTime: number;
  paymentMethodStats: Record<string, number>;
  errorStats: Record<string, number>;
  lastUpdated: string;
}

class PaymentLogger {
  private logs: PaymentLogEntry[] = [];
  private maxLogs = 1000; // Maximum logs to keep in memory
  private analytics: PaymentAnalytics = {
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
    cancelledTransactions: 0,
    averageProcessingTime: 0,
    paymentMethodStats: {},
    errorStats: {},
    lastUpdated: new Date().toISOString(),
  };

  // Core logging method
  private log(entry: Omit<PaymentLogEntry, 'timestamp'>): void {
    if (!PAYMENT_LOGGING_ENABLED) return;

    const logEntry: PaymentLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Add to memory logs
    this.logs.push(logEntry);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output based on log level
    const logMessage = `[${logEntry.timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.category}] ${logEntry.message}`;
    
    switch (logEntry.level) {
      case LogLevel.DEBUG:
        if (PAYMENT_DEBUG_MODE) {
          console.debug(logMessage, logEntry.data);
        }
        break;
      case LogLevel.INFO:
        console.info(logMessage, logEntry.data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, logEntry.data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, logEntry.data, logEntry.error);
        break;
    }

    // Update analytics
    this.updateAnalytics(logEntry);

    // Store logs in localStorage for persistence
    this.persistLogs();
  }

  // Public logging methods
  debug(message: string, data?: any, category: PaymentLogEntry['category'] = 'payment'): void {
    this.log({ level: LogLevel.DEBUG, message, data, category });
  }

  info(message: string, data?: any, category: PaymentLogEntry['category'] = 'payment'): void {
    this.log({ level: LogLevel.INFO, message, data, category });
  }

  warn(message: string, data?: any, category: PaymentLogEntry['category'] = 'payment'): void {
    this.log({ level: LogLevel.WARN, message, data, category });
  }

  error(message: string, error?: Error, data?: any, category: PaymentLogEntry['category'] = 'payment'): void {
    this.log({ level: LogLevel.ERROR, message, error, data, category });
  }

  // Specific payment event logging
  logPaymentEvent(eventType: PaymentEventType, data?: any, orderId?: string): void {
    const message = this.getEventMessage(eventType);
    this.info(message, { eventType, ...data }, 'payment');
  }

  logWebhookEvent(eventType: PaymentEventType, data?: any, orderId?: string): void {
    const message = this.getEventMessage(eventType);
    this.info(message, { eventType, ...data }, 'webhook');
  }

  logApiEvent(eventType: PaymentEventType, data?: any, orderId?: string): void {
    const message = this.getEventMessage(eventType);
    this.info(message, { eventType, ...data }, 'api');
  }

  logValidationEvent(message: string, data?: any, orderId?: string): void {
    this.warn(message, data, 'validation');
  }

  logUiEvent(message: string, data?: any, orderId?: string): void {
    this.debug(message, data, 'ui');
  }

  // Get human-readable message for event type
  private getEventMessage(eventType: PaymentEventType): string {
    switch (eventType) {
      case PaymentEventType.FORM_SUBMIT:
        return 'Payment form submitted';
      case PaymentEventType.PAYMENT_INIT:
        return 'Payment initialization started';
      case PaymentEventType.PAYMENT_SUCCESS:
        return 'Payment completed successfully';
      case PaymentEventType.PAYMENT_PENDING:
        return 'Payment is pending confirmation';
      case PaymentEventType.PAYMENT_FAILED:
        return 'Payment failed';
      case PaymentEventType.PAYMENT_CANCELLED:
        return 'Payment cancelled by user';
      case PaymentEventType.WEBHOOK_RECEIVED:
        return 'Webhook notification received';
      case PaymentEventType.WEBHOOK_PROCESSED:
        return 'Webhook notification processed successfully';
      case PaymentEventType.WEBHOOK_FAILED:
        return 'Webhook processing failed';
      case PaymentEventType.API_CALL:
        return 'API call initiated';
      case PaymentEventType.API_SUCCESS:
        return 'API call successful';
      case PaymentEventType.API_ERROR:
        return 'API call failed';
      case PaymentEventType.VALIDATION_ERROR:
        return 'Form validation failed';
      case PaymentEventType.REDIRECT_SUCCESS:
        return 'Redirect to payment gateway successful';
      case PaymentEventType.REDIRECT_FAILED:
        return 'Redirect to payment gateway failed';
      default:
        return 'Unknown payment event';
    }
  }

  // Update analytics based on log entry
  private updateAnalytics(entry: PaymentLogEntry): void {
    if (entry.category === 'payment') {
      // Update transaction counts
      switch (entry.data?.eventType) {
        case PaymentEventType.PAYMENT_INIT:
          this.analytics.totalTransactions++;
          break;
        case PaymentEventType.PAYMENT_SUCCESS:
          this.analytics.successfulTransactions++;
          break;
        case PaymentEventType.PAYMENT_FAILED:
          this.analytics.failedTransactions++;
          break;
        case PaymentEventType.PAYMENT_PENDING:
          this.analytics.pendingTransactions++;
          break;
        case PaymentEventType.PAYMENT_CANCELLED:
          this.analytics.cancelledTransactions++;
          break;
      }

      // Update payment method stats
      if (entry.data?.paymentMethod) {
        const method = entry.data.paymentMethod;
        this.analytics.paymentMethodStats[method] = (this.analytics.paymentMethodStats[method] || 0) + 1;
      }

      // Update error stats
      if (entry.level === LogLevel.ERROR) {
        const errorType = entry.data?.errorType || 'unknown';
        this.analytics.errorStats[errorType] = (this.analytics.errorStats[errorType] || 0) + 1;
      }
    }

    this.analytics.lastUpdated = new Date().toISOString();
  }

  // Get logs with optional filtering
  getLogs(filters?: {
    level?: LogLevel;
    category?: PaymentLogEntry['category'];
    orderId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): PaymentLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      if (filters.orderId) {
        filteredLogs = filteredLogs.filter(log => log.orderId === filters.orderId);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= filters.endDate!);
      }
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(-filters.limit);
      }
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get analytics data
  getAnalytics(): PaymentAnalytics {
    return { ...this.analytics };
  }

  // Export logs to JSON
  exportLogs(filters?: {
    level?: LogLevel;
    category?: PaymentLogEntry['category'];
    orderId?: string;
    startDate?: Date;
    endDate?: Date;
  }): string {
    const logs = this.getLogs(filters);
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalLogs: logs.length,
      analytics: this.analytics,
      logs,
    }, null, 2);
  }

  // Export logs to CSV
  exportLogsToCsv(filters?: {
    level?: LogLevel;
    category?: PaymentLogEntry['category'];
    orderId?: string;
    startDate?: Date;
    endDate?: Date;
  }): string {
    const logs = this.getLogs(filters);
    
    const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Order ID', 'Data'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.level,
        log.category,
        `"${log.message.replace(/"/g, '""')}"`, // Escape quotes
        log.orderId || '',
        `"${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`, // Escape quotes
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.analytics = {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      pendingTransactions: 0,
      cancelledTransactions: 0,
      averageProcessingTime: 0,
      paymentMethodStats: {},
      errorStats: {},
      lastUpdated: new Date().toISOString(),
    };
    
    // Clear localStorage
    localStorage.removeItem('payment_logs');
    localStorage.removeItem('payment_analytics');
  }

  // Persist logs to localStorage
  private persistLogs(): void {
    try {
      localStorage.setItem('payment_logs', JSON.stringify(this.logs.slice(-100))); // Keep last 100 logs
      localStorage.setItem('payment_analytics', JSON.stringify(this.analytics));
    } catch (error) {
      console.warn('Failed to persist logs to localStorage:', error);
    }
  }

  // Load logs from localStorage
  loadPersistedLogs(): void {
    try {
      const savedLogs = localStorage.getItem('payment_logs');
      const savedAnalytics = localStorage.getItem('payment_analytics');
      
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
      
      if (savedAnalytics) {
        this.analytics = JSON.parse(savedAnalytics);
      }
    } catch (error) {
      console.warn('Failed to load persisted logs:', error);
    }
  }

  // Get error summary for debugging
  getErrorSummary(): Array<{ error: string; count: number; lastOccurrence: string }> {
    const errorCounts: Record<string, { count: number; lastOccurrence: string }> = {};
    
    this.logs
      .filter(log => log.level === LogLevel.ERROR)
      .forEach(log => {
        const errorKey = log.message;
        if (!errorCounts[errorKey]) {
          errorCounts[errorKey] = { count: 0, lastOccurrence: log.timestamp };
        }
        errorCounts[errorKey].count++;
        if (new Date(log.timestamp) > new Date(errorCounts[errorKey].lastOccurrence)) {
          errorCounts[errorKey].lastOccurrence = log.timestamp;
        }
      });

    return Object.entries(errorCounts)
      .map(([error, data]) => ({ error, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  // Get performance metrics
  getPerformanceMetrics(): {
    averageResponseTime: number;
    slowestTransaction: { orderId: string; duration: number } | null;
    fastestTransaction: { orderId: string; duration: number } | null;
  } {
    const performanceLogs = this.logs.filter(log => 
      log.category === 'api' && log.data?.duration
    );

    if (performanceLogs.length === 0) {
      return {
        averageResponseTime: 0,
        slowestTransaction: null,
        fastestTransaction: null,
      };
    }

    const durations = performanceLogs.map(log => ({
      orderId: log.orderId!,
      duration: log.data.duration,
    }));

    const averageResponseTime = durations.reduce((sum, d) => sum + d.duration, 0) / durations.length;
    const slowest = durations.reduce((max, d) => d.duration > max.duration ? d : max, durations[0]);
    const fastest = durations.reduce((min, d) => d.duration < min.duration ? d : min, durations[0]);

    return {
      averageResponseTime,
      slowestTransaction: slowest,
      fastestTransaction: fastest,
    };
  }
}

// Create singleton instance
export const paymentLogger = new PaymentLogger();

// Initialize logger with persisted data
paymentLogger.loadPersistedLogs();

// Export convenience functions
export const logPaymentEvent = (eventType: PaymentEventType, data?: any, orderId?: string) => {
  paymentLogger.logPaymentEvent(eventType, data, orderId);
};

export const logWebhookEvent = (eventType: PaymentEventType, data?: any, orderId?: string) => {
  paymentLogger.logWebhookEvent(eventType, data, orderId);
};

export const logApiEvent = (eventType: PaymentEventType, data?: any, orderId?: string) => {
  paymentLogger.logApiEvent(eventType, data, orderId);
};

export const logValidationError = (message: string, data?: any, orderId?: string) => {
  paymentLogger.logValidationEvent(message, data, orderId);
};

export const logUiEvent = (message: string, data?: any, orderId?: string) => {
  paymentLogger.logUiEvent(message, data, orderId);
};

export default paymentLogger;