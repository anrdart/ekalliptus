/**
 * Enhanced Environment Configuration Management
 * Provides secure, type-safe environment configuration with validation
 */

import { MIDTRANS_CONFIG } from './midtrans';

// Environment Types
export interface EnvironmentConfig {
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    enableLogging: boolean;
  };

  // Security Configuration
  security: {
    enableRateLimiting: boolean;
    maxRequestSize: number;
    allowedOrigins: string[];
    corsEnabled: boolean;
  };

  // Payment Configuration
  payment: {
    midtrans: {
      clientKey: string;
      isProduction: boolean;
      snapUrl: string;
    };
    webhookUrls: {
      paymentNotification: string;
      recurringNotification: string;
      payAccountNotification: string;
      finishRedirect: string;
      unfinishRedirect: string;
      errorRedirect: string;
    };
  };

  // Monitoring Configuration
  monitoring: {
    enableHealthCheck: boolean;
    checkInterval: number;
    alertThresholds: {
      responseTime: number;
      errorRate: number;
      memoryUsage: number;
      successRate: number;
    };
  };

  // Feature Flags
  features: {
    enableMockMode: boolean;
    enableSecurityMiddleware: boolean;
    enableCircuitBreaker: boolean;
    enableDetailedLogging: boolean;
    enablePerformanceMonitoring: boolean;
  };

  // Development Configuration
  development: {
    enableDebugMode: boolean;
    enableHotReload: boolean;
    port: number;
    enableMockData: boolean;
  };
}

// Default Configuration
const DEFAULT_CONFIG: EnvironmentConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://ekalliptus.id/api',
    timeout: 30000, // 30 seconds
    retries: 3,
    enableLogging: import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
  },

  security: {
    enableRateLimiting: import.meta.env.VITE_ENABLE_RATE_LIMITING !== 'false',
    maxRequestSize: 10 * 1024, // 10KB
    allowedOrigins: [
      'https://ekalliptus.id',
      'https://www.ekalliptus.id',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    corsEnabled: true,
  },

  payment: {
    midtrans: {
      clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '',
      isProduction: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true',
      snapUrl: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',
    },
    webhookUrls: {
      paymentNotification: import.meta.env.VITE_PAYMENT_NOTIFICATION_URL || 'https://ekalliptus.id/notification/handling',
      recurringNotification: import.meta.env.VITE_RECURRING_NOTIFICATION_URL || 'https://ekalliptus.id/notification/recurring',
      payAccountNotification: import.meta.env.VITE_PAY_ACCOUNT_NOTIFICATION_URL || 'https://ekalliptus.id/notification/pay-account',
      finishRedirect: import.meta.env.VITE_FINISH_REDIRECT_URL || 'https://ekalliptus.id/payment/finish',
      unfinishRedirect: import.meta.env.VITE_UNFINISH_REDIRECT_URL || 'https://ekalliptus.id/payment/unfinish',
      errorRedirect: import.meta.env.VITE_ERROR_REDIRECT_URL || 'https://ekalliptus.id/error',
    },
  },

  monitoring: {
    enableHealthCheck: import.meta.env.VITE_ENABLE_HEALTH_CHECK !== 'false',
    checkInterval: 30000, // 30 seconds
    alertThresholds: {
      responseTime: 5000, // 5 seconds
      errorRate: 10, // 10%
      memoryUsage: 80, // 80%
      successRate: 90, // 90%
    },
  },

  features: {
    enableMockMode: !import.meta.env.VITE_API_BASE_URL,
    enableSecurityMiddleware: import.meta.env.VITE_ENABLE_SECURITY_MIDDLEWARE !== 'false',
    enableCircuitBreaker: import.meta.env.VITE_ENABLE_CIRCUIT_BREAKER !== 'false',
    enableDetailedLogging: import.meta.env.VITE_ENABLE_DETAILED_LOGGING === 'true',
    enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
  },

  development: {
    enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    enableHotReload: import.meta.env.DEV,
    port: parseInt(import.meta.env.VITE_PORT || '5173'),
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA !== 'false',
  },
};

// Environment Validator
class EnvironmentValidator {
  private errors: string[] = [];

  validate(): { valid: boolean; errors: string[] } {
    this.errors = [];

    this.validateRequiredFields();
    this.validateUrls();
    this.validateSecuritySettings();
    this.validateFeatureFlags();

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  private validateRequiredFields(): void {
    const requiredEnvVars = [
      'VITE_MIDTRANS_CLIENT_KEY',
    ];

    for (const envVar of requiredEnvVars) {
      if (!import.meta.env[envVar]) {
        this.errors.push(`Missing required environment variable: ${envVar}`);
      }
    }
  }

  private validateUrls(): void {
    const urlFields = [
      { field: 'VITE_API_BASE_URL', name: 'API Base URL' },
      { field: 'VITE_PAYMENT_NOTIFICATION_URL', name: 'Payment Notification URL' },
      { field: 'VITE_FINISH_REDIRECT_URL', name: 'Finish Redirect URL' },
      { field: 'VITE_UNFINISH_REDIRECT_URL', name: 'Unfinish Redirect URL' },
      { field: 'VITE_ERROR_REDIRECT_URL', name: 'Error Redirect URL' },
    ];

    for (const { field, name } of urlFields) {
      const value = import.meta.env[field];
      if (value && !this.isValidUrl(value)) {
        this.errors.push(`Invalid URL format for ${name}: ${value}`);
      }
    }
  }

  private validateSecuritySettings(): void {
    const corsOrigins = [
      import.meta.env.VITE_CORS_ORIGINS,
    ].filter(Boolean);

    for (const origin of corsOrigins) {
      if (!this.isValidOrigin(origin)) {
        this.errors.push(`Invalid CORS origin: ${origin}`);
      }
    }
  }

  private validateFeatureFlags(): void {
    const booleanFlags = [
      'VITE_ENABLE_SECURITY_MIDDLEWARE',
      'VITE_ENABLE_CIRCUIT_BREAKER',
      'VITE_ENABLE_HEALTH_CHECK',
      'VITE_ENABLE_RATE_LIMITING',
    ];

    for (const flag of booleanFlags) {
      const value = import.meta.env[flag];
      if (value && !['true', 'false', '1', '0'].includes(value)) {
        this.errors.push(`Invalid boolean value for ${flag}: ${value} (must be true/false or 1/0)`);
      }
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidOrigin(origin: string): boolean {
    // Basic origin validation (protocol + hostname + optional port)
    const originPattern = /^https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?$/;
    return originPattern.test(origin);
  }
}

// Environment Manager
export class EnvironmentManager {
  private config: EnvironmentConfig;
  private validator: EnvironmentValidator;

  constructor() {
    this.validator = new EnvironmentValidator();
    this.config = this.loadAndValidateConfig();
    this.setupEnvironmentHandlers();
  }

  private loadAndValidateConfig(): EnvironmentConfig {
    const validation = this.validator.validate();

    if (!validation.valid) {
      console.warn('Environment configuration warnings:', validation.errors);
      
      // In development, log warnings but continue
      if (import.meta.env.DEV) {
        console.warn('Continuing with default configuration for development');
      }
    }

    return DEFAULT_CONFIG;
  }

  private setupEnvironmentHandlers(): void {
    // Handle environment changes in development
    if (import.meta.env.DEV) {
      // Watch for environment changes (useful for hot reloading)
      this.setupEnvironmentWatchers();
    }
  }

  private setupEnvironmentWatchers(): void {
    // This would be useful for development hot-reloading of config
    // Currently not implementing as it's browser-specific
  }

  // Public getters
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  get apiConfig() {
    return this.config.api;
  }

  get securityConfig() {
    return this.config.security;
  }

  get paymentConfig() {
    return this.config.payment;
  }

  get monitoringConfig() {
    return this.config.monitoring;
  }

  get featureFlags() {
    return this.config.features;
  }

  get developmentConfig() {
    return this.config.development;
  }

  // Utility methods
  isProduction(): boolean {
    return this.config.payment.midtrans.isProduction;
  }

  isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  isMockMode(): boolean {
    return this.config.features.enableMockMode;
  }

  // Environment-specific settings
  getApiBaseUrl(): string {
    return this.config.api.baseUrl;
  }

  getMidtransClientKey(): string {
    return this.config.payment.midtrans.clientKey;
  }

  getMidtransConfig() {
    return this.config.payment.midtrans;
  }

  getWebhookUrls() {
    return this.config.payment.webhookUrls;
  }

  // Feature flag checks
  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Validation
  validate(): { valid: boolean; errors: string[] } {
    return this.validator.validate();
  }

  // Environment info
  getEnvironmentInfo() {
    return {
      nodeEnv: import.meta.env.MODE,
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      isMockMode: this.isMockMode(),
      timestamp: new Date().toISOString(),
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    };
  }

  // Configuration updates (useful for runtime changes)
  updateConfig(updates: Partial<EnvironmentConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };

    // Notify listeners about configuration changes
    this.notifyConfigChange();
  }

  private notifyConfigChange(): void {
    // Dispatch custom event for configuration changes
    window.dispatchEvent(new CustomEvent('environmentConfigChanged', {
      detail: {
        config: this.config,
        timestamp: new Date().toISOString(),
      },
    }));
  }

  // Configuration export for debugging
  exportConfig(): string {
    const safeConfig = {
      ...this.config,
      // Remove sensitive data
      payment: {
        ...this.config.payment,
        midtrans: {
          ...this.config.payment.midtrans,
          clientKey: this.config.payment.midtrans.clientKey ? '***' : '',
        },
      },
    };

    return JSON.stringify(safeConfig, null, 2);
  }
}

// Export singleton instance
export const environmentManager = new EnvironmentManager();
export default environmentManager;

// Configuration hooks for React components
export const useEnvironmentConfig = () => {
  return environmentManager.getConfig();
};

export const useFeatureFlag = (feature: keyof EnvironmentConfig['features']) => {
  return environmentManager.isFeatureEnabled(feature);
};