import { PaymentPayload } from './types';
import { CONFIG } from './calc';

export interface PaymentGateway {
  createDepositInvoice(payload: PaymentPayload): Promise<{
    payment_url: string;
    payment_ref: string;
  }>;
}

class MockPaymentService implements PaymentGateway {
  async createDepositInvoice(payload: PaymentPayload): Promise<{
    payment_url: string;
    payment_ref: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const ref = `MOCK-${payload.orderId}-${Date.now()}`;
    const url = `${window.location.origin}/payment/mock/${ref}`;

    return {
      payment_url: url,
      payment_ref: ref
    };
  }
}

class XenditPaymentService implements PaymentGateway {
  async createDepositInvoice(payload: PaymentPayload): Promise<{
    payment_url: string;
    payment_ref: string;
  }> {
    throw new Error('Xendit integration not implemented. Please configure credentials.');
  }
}

class TripayPaymentService implements PaymentGateway {
  async createDepositInvoice(payload: PaymentPayload): Promise<{
    payment_url: string;
    payment_ref: string;
  }> {
    throw new Error('Tripay integration not implemented. Please configure credentials.');
  }
}

class ManualPaymentService implements PaymentGateway {
  async createDepositInvoice(payload: PaymentPayload): Promise<{
    payment_url: string;
    payment_ref: string;
  }> {
    const ref = `MANUAL-${payload.orderId}-${Date.now()}`;
    const url = `mailto:payment@example.com?subject=Pembayaran%20DP%20${payload.orderId}&body=Silakan%20transfer%20DP%20sebesar%20${payload.amount}`;

    return {
      payment_url: url,
      payment_ref: ref
    };
  }
}

export function getPaymentService(): PaymentGateway {
  switch (CONFIG.DEFAULT_GATEWAY) {
    case 'xendit':
      return new XenditPaymentService();
    case 'tripay':
      return new TripayPaymentService();
    case 'manual':
      return new ManualPaymentService();
    case 'mock':
    default:
      return new MockPaymentService();
  }
}

export const paymentService = getPaymentService();
