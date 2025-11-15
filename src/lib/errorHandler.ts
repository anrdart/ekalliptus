/**
 * Standardized Error Handling
 * Provides consistent error types, messages, and logging
 */

/**
 * Application error types
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  API = 'API_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  UPLOAD = 'UPLOAD_ERROR',
  AUTH = 'AUTH_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Application error class
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  details?: any;
  isOperational: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    details?: any,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  error: string;
  type: ErrorType;
  details?: any;
}

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Generic response type
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Error logger
 */
export class ErrorLogger {
  private static isDevelopment = import.meta.env.DEV;
  private static enableLogging = import.meta.env.VITE_ENABLE_API_LOGGING !== 'false';

  /**
   * Log error to console (and potentially external service)
   */
  static log(error: Error | AppError, context?: string): void {
    if (!this.enableLogging) return;

    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      message: error.message,
      type: error instanceof AppError ? error.type : ErrorType.UNKNOWN,
      stack: this.isDevelopment ? error.stack : undefined,
      details: error instanceof AppError ? error.details : undefined,
    };

    if (this.isDevelopment) {
      console.error('🔴 Error:', errorInfo);
    } else {
      console.error('Error:', errorInfo.message);
      // In production, send to monitoring service (Sentry, LogRocket, etc.)
      this.sendToMonitoringService(errorInfo);
    }
  }

  /**
   * Send error to external monitoring service
   */
  private static sendToMonitoringService(errorInfo: any): void {
    // TODO: Implement integration with monitoring service
    // Example: Sentry.captureException(errorInfo);
  }
}

/**
 * Error handler utilities
 */
export class ErrorHandler {
  /**
   * Handle error and return standardized error response
   */
  static handle(error: unknown, context?: string): ErrorResponse {
    if (error instanceof AppError) {
      ErrorLogger.log(error, context);
      return {
        success: false,
        error: error.message,
        type: error.type,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      ErrorLogger.log(error, context);
      return {
        success: false,
        error: error.message,
        type: ErrorType.UNKNOWN,
      };
    }

    // Handle non-Error objects
    const errorMessage = typeof error === 'string' ? error : 'An unknown error occurred';
    const genericError = new Error(errorMessage);
    ErrorLogger.log(genericError, context);

    return {
      success: false,
      error: errorMessage,
      type: ErrorType.UNKNOWN,
    };
  }

  /**
   * Create success response
   */
  static success<T>(data: T, message?: string): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * Wrap async function with error handling
   */
  static async wrap<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<ApiResponse<T>> {
    try {
      const result = await fn();
      return this.success(result);
    } catch (error) {
      return this.handle(error, context);
    }
  }
}

/**
 * Validation error helpers
 */
export function createValidationError(field: string, message: string): AppError {
  return new AppError(
    message,
    ErrorType.VALIDATION,
    400,
    { field }
  );
}

/**
 * Network error helpers
 */
export function createNetworkError(message = 'Network request failed'): AppError {
  return new AppError(
    message,
    ErrorType.NETWORK,
    0
  );
}

/**
 * API error helpers
 */
export function createApiError(
  message: string,
  statusCode = 500,
  details?: any
): AppError {
  return new AppError(
    message,
    ErrorType.API,
    statusCode,
    details
  );
}

/**
 * Payment error helpers
 */
export function createPaymentError(message: string, details?: any): AppError {
  return new AppError(
    message,
    ErrorType.PAYMENT,
    402,
    details
  );
}

/**
 * Upload error helpers
 */
export function createUploadError(message: string, details?: any): AppError {
  return new AppError(
    message,
    ErrorType.UPLOAD,
    413,
    details
  );
}

/**
 * Auth error helpers
 */
export function createAuthError(message = 'Authentication failed'): AppError {
  return new AppError(
    message,
    ErrorType.AUTH,
    401
  );
}

/**
 * Not found error helpers
 */
export function createNotFoundError(resource: string): AppError {
  return new AppError(
    `${resource} not found`,
    ErrorType.NOT_FOUND,
    404,
    { resource }
  );
}

/**
 * Permission error helpers
 */
export function createPermissionError(action: string): AppError {
  return new AppError(
    `Permission denied: ${action}`,
    ErrorType.PERMISSION,
    403,
    { action }
  );
}
