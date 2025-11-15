/**
 * Midtrans Payment Service
 * Handles QRIS payments through Midtrans API
 * Supports both demo and production modes
 */

interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  merchantId?: string;
}

interface PaymentResponse {
  success: boolean;
  qrCode?: string;
  transactionId?: string;
  error?: string;
  paymentUrl?: string;
  isDemo?: boolean;
}

class MidtransPaymentService {
  private serverKey: string;
  private clientKey: string;
  private isProduction: boolean;
  private paymentMode: string;

  constructor() {
    this.serverKey = import.meta.env.VITE_MIDTRANS_SERVER_KEY || '';
    this.clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
    this.isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
    this.paymentMode = import.meta.env.VITE_PAYMENT_MODE || 'demo';
  }

  /**
   * Create QRIS payment
   * @param params Payment parameters
   * @returns Payment response with QR code
   */
  async createQrisPayment(params: PaymentRequest): Promise<PaymentResponse> {
    // Check if in demo mode
    if (this.paymentMode === 'demo') {
      console.log('🚀 Demo Mode: Using demo QR code generator');
      return this.createDemoQris(params);
    }

    // Check if Midtrans keys are configured
    if (!this.serverKey || !this.clientKey) {
      console.warn('⚠️ Midtrans keys not configured, falling back to demo mode');
      return this.createDemoQris(params);
    }

    try {
      console.log('💳 Creating real QRIS payment via Midtrans...');
      return await this.createRealQris(params);
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Create demo QR code (current implementation)
   */
  private createDemoQris(params: PaymentRequest): PaymentResponse {
    // Import dynamically to avoid errors when not in use
    const { generateQRISDataString } = require('./dynamicQrService');

    const qrData = generateQRISDataString({
      amount: params.amount,
      orderId: params.orderId,
      merchantName: 'Ekalliptus Digital',
      description: `Pembayaran ${params.orderId}`,
    });

    return {
      success: true,
      qrCode: qrData,
      transactionId: `demo-${params.orderId}`,
      isDemo: true,
    };
  }

  /**
   * Create real QRIS payment through Midtrans
   */
  private async createRealQris(params: PaymentRequest): Promise<PaymentResponse> {
    // Note: This is a placeholder implementation
    // In production, you would use the midtrans-client SDK

    const midtransRequest = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      payment_type: 'qris',
      qris: {
        merchant_id: params.merchantId || import.meta.env.VITE_GOPAY_MERCHANT_ID,
      },
      customer_details: {
        first_name: params.customerName,
      },
    };

    console.log('📤 Midtrans Request:', JSON.stringify(midtransRequest, null, 2));

    // TODO: Implement actual Midtrans API call
    // Example implementation:
    /*
    const axios = require('axios');

    const response = await axios.post(
      this.isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
      midtransRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64'),
        },
      }
    );

    return {
      success: true,
      qrCode: response.data.qr_code,
      transactionId: response.data.transaction_id,
      paymentUrl: response.data.redirect_url,
    };
    */

    // For now, return demo since we don't have actual keys
    return this.createDemoQris(params);
  }

  /**
   * Check payment status
   * @param transactionId Transaction ID
   * @returns Payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<any> {
    if (this.paymentMode === 'demo') {
      return {
        status_code: '200',
        transaction_status: 'capture',
        fraud_status: 'accept',
        order_id: transactionId.replace('demo-', ''),
        payment_type: 'qris',
      };
    }

    // TODO: Implement actual status check via Midtrans API
    // Example:
    /*
    const axios = require('axios');
    const response = await axios.get(
      `${this.getBaseUrl()}/v2/${transactionId}/status`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64'),
        },
      }
    );
    return response.data;
    */

    return null;
  }

  /**
   * Get Midtrans base URL
   */
  private getBaseUrl(): string {
    return this.isProduction
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com';
  }

  /**
   * Check if payment service is configured
   */
  isConfigured(): boolean {
    return !!(this.serverKey && this.clientKey);
  }

  /**
   * Get payment mode
   */
  getPaymentMode(): string {
    return this.paymentMode;
  }
}

// Export singleton instance
export const midtransService = new MidtransPaymentService();

export default midtransService;
