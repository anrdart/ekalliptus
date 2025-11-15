/**
 * Static QRIS Service
 * Uses static QRIS QR code from GoPay Merchant Dashboard
 * Simplest solution - just display the QR image
 */

interface StaticQrisRequest {
  orderId: string;
  amount: number;
  customerName: string;
  merchantName: string;
}

interface StaticQrisResponse {
  success: boolean;
  qrCode?: string;
  qrImageUrl?: string;
  transactionId?: string;
  error?: string;
  isDemo?: boolean;
  note?: string;
}

class StaticQrisService {
  private merchantId: string;
  private qrImagePath: string;
  private paymentMode: string;

  constructor() {
    this.merchantId = import.meta.env.VITE_GOPAY_MERCHANT_ID || '';
    this.qrImagePath = import.meta.env.VITE_STATIC_QRIS_PATH || '/static-qris.png';
    this.paymentMode = import.meta.env.VITE_PAYMENT_MODE || 'demo';
  }

  /**
   * Get static QRIS QR code info
   */
  async createQrisPayment(params: StaticQrisRequest): Promise<StaticQrisResponse> {
    // Check if using demo mode
    if (this.paymentMode === 'demo') {
      console.log('🚀 Demo Mode: Using demo QR code generator');
      return this.createDemoQris(params);
    }

    // Check if merchant ID is configured
    if (!this.merchantId) {
      console.warn('⚠️ GoPay Merchant ID not configured');
      return this.createDemoQris(params);
    }

    console.log('💳 Creating Static QRIS payment...');
    
    return {
      success: true,
      qrImageUrl: this.qrImagePath,
      transactionId: `static-${params.orderId}`,
      isDemo: false,
      note: `Static QRIS from GoPay Merchant ID: ${this.merchantId}`,
    };
  }

  /**
   * Create demo QR code
   */
  private createDemoQris(params: StaticQrisRequest): StaticQrisResponse {
    const { generateQRISDataString } = require('./dynamicQrService');

    const qrData = generateQRISDataString({
      amount: params.amount,
      orderId: params.orderId,
      merchantName: params.merchantName,
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
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!this.merchantId;
  }

  /**
   * Get payment mode
   */
  getPaymentMode(): string {
    return this.paymentMode;
  }

  /**
   * Get payment info for display
   */
  getPaymentInfo(): any {
    return {
      mode: this.paymentMode,
      merchantId: this.merchantId,
      qrImagePath: this.qrImagePath,
      hasMerchantId: !!this.merchantId,
      isConfigured: this.paymentMode !== 'demo' && !!this.merchantId,
    };
  }
}

// Export singleton instance
export const staticQrisService = new StaticQrisService();

export default staticQrisService;
