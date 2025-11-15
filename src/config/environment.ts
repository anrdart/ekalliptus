/**
 * Environment Configuration Management
 * Provides secure, type-safe environment configuration
 */

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

  // QR Payment Configuration
  qrPayment: {
    enabled: boolean;
    instructions: string;
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
    timeout: 30000,
    retries: 3,
    enableLogging: import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
  },

  security: {
    enableRateLimiting: import.meta.env.VITE_ENABLE_RATE_LIMITING !== 'false',
    maxRequestSize: 10 * 1024,
    allowedOrigins: [
      'https://ekalliptus.id',
      'https://www.ekalliptus.id',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    corsEnabled: true,
  },

  qrPayment: {
    enabled: true,
    instructions: 'Scan QR code to pay',
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
    this.validateUrls();
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  private validateUrls(): void {
    const urlFields = [
      { field: 'VITE_API_BASE_URL', name: 'API Base URL' },
    ];

    for (const { field, name } of urlFields) {
      const value = import.meta.env[field];
      if (value && !this.isValidUrl(value)) {
        this.errors.push(`Invalid URL format for ${name}: ${value}`);
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

      if (import.meta.env.DEV) {
        console.warn('Continuing with default configuration for development');
      }
    }

    return DEFAULT_CONFIG;
  }

  private setupEnvironmentHandlers(): void {
    if (import.meta.env.DEV) {
      this.setupEnvironmentWatchers();
    }
  }

  private setupEnvironmentWatchers(): void {
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

  get qrPaymentConfig() {
    return this.config.qrPayment;
  }

  get developmentConfig() {
    return this.config.development;
  }

  // Utility methods
  isProduction(): boolean {
    return import.meta.env.PROD;
  }

  isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  // Environment-specific settings
  getApiBaseUrl(): string {
    return this.config.api.baseUrl;
  }

  // Environment info
  getEnvironmentInfo() {
    return {
      nodeEnv: import.meta.env.MODE,
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      timestamp: new Date().toISOString(),
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    };
  }

  // Configuration updates
  updateConfig(updates: Partial<EnvironmentConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    this.notifyConfigChange();
  }

  private notifyConfigChange(): void {
    window.dispatchEvent(new CustomEvent('environmentConfigChanged', {
      detail: {
        config: this.config,
        timestamp: new Date().toISOString(),
      },
    }));
  }

  // Configuration export for debugging
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }
}

// Export singleton instance
export const environmentManager = new EnvironmentManager();
export default environmentManager;

// Configuration hooks for React components
export const useEnvironmentConfig = () => {
  return environmentManager.getConfig();
};
