/**
 * Unified Payment Service Interface
 * Provides a clean API for accessing different payment methods
 */

export { default as GoPayDirectService } from '../gopayDirectService';
export { default as StaticQrisService } from '../staticQrisService';
export { generateQRISDataString, generateQRCode, type DynamicQROptions } from '../dynamicQrService';

/**
 * Common payment interfaces
 */
export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  merchantId?: string;
  merchantName?: string;
  description?: string;
  callbackUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  qrCode?: string;
  qrImageUrl?: string;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  isDemo?: boolean;
  note?: string;
}

/**
 * Payment method types
 */
export enum PaymentMethod {
  GOPAY_DIRECT = 'gopay_direct',
  STATIC_QRIS = 'static_qris',
  DYNAMIC_QR = 'dynamic_qr',
  BANK_TRANSFER = 'bank_transfer',
}

/**
 * Payment service factory
 * Creates the appropriate payment service based on configuration
 */
export class PaymentServiceFactory {
  private static instance: PaymentServiceFactory;
  private paymentMode: string;

  private constructor() {
    this.paymentMode = import.meta.env.VITE_PAYMENT_MODE || 'demo';
  }

  static getInstance(): PaymentServiceFactory {
    if (!PaymentServiceFactory.instance) {
      PaymentServiceFactory.instance = new PaymentServiceFactory();
    }
    return PaymentServiceFactory.instance;
  }

  /**
   * Get the configured payment method from environment
   */
  getConfiguredPaymentMethod(): PaymentMethod {
    const method = import.meta.env.VITE_DEFAULT_PAYMENT_METHOD;

    switch (method) {
      case 'gopay_direct':
        return PaymentMethod.GOPAY_DIRECT;
      case 'static_qris':
        return PaymentMethod.STATIC_QRIS;
      case 'dynamic_qr':
        return PaymentMethod.DYNAMIC_QR;
      case 'bank_transfer':
        return PaymentMethod.BANK_TRANSFER;
      default:
        return PaymentMethod.BANK_TRANSFER; // Safe default
    }
  }

  /**
   * Check if in demo mode
   */
  isDemoMode(): boolean {
    return this.paymentMode === 'demo';
  }

  /**
   * Get payment service for a specific method
   */
  getPaymentService(method: PaymentMethod): any {
    switch (method) {
      case PaymentMethod.GOPAY_DIRECT:
        return import('../gopayDirectService').then(m => m.default);
      case PaymentMethod.STATIC_QRIS:
        return import('../staticQrisService').then(m => m.default);
      default:
        return null;
    }
  }
}

/**
 * Helper function to create payment
 * Automatically selects the configured payment method
 */
export async function createPayment(params: PaymentRequest): Promise<PaymentResponse> {
  const factory = PaymentServiceFactory.getInstance();
  const method = factory.getConfiguredPaymentMethod();

  try {
    const ServiceClass = await factory.getPaymentService(method);
    if (!ServiceClass) {
      return {
        success: false,
        error: 'Payment method not supported',
      };
    }

    const service = new ServiceClass();
    return await service.createQrisPayment(params);
  } catch (error) {
    console.error('Payment creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}
