/**
 * GoPay Direct Payment Service
 * Uses GoPay Merchant API directly (no payment gateway)
 * Note: Requires special approval from Gojek for Merchant API access
 */

interface GoPayPaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  merchantId: string;
  callbackUrl?: string;
}

interface GoPayPaymentResponse {
  success: boolean;
  qrCode?: string;
  transactionId?: string;
  error?: string;
  isDemo?: boolean;
}

class GoPayDirectService {
  private merchantId: string;
  private apiEndpoint: string;
  private paymentMode: string;

  constructor() {
    this.merchantId = import.meta.env.VITE_GOPAY_MERCHANT_ID || '';
    this.apiEndpoint = import.meta.env.VITE_GOPAY_API_ENDPOINT || '';
    this.paymentMode = import.meta.env.VITE_PAYMENT_MODE || 'demo';
  }

  /**
   * Create QRIS payment using GoPay Direct API
   */
  async createQrisPayment(params: GoPayPaymentRequest): Promise<GoPayPaymentResponse> {
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

    // Check if API endpoint is configured
    if (!this.apiEndpoint) {
      console.warn('⚠️ GoPay API endpoint not configured. You need to apply for Merchant API access.');
      return {
        success: false,
        error: 'GoPay Merchant API access not configured. Please contact Gojek Business for API access.',
      };
    }

    try {
      console.log('💳 Creating QRIS payment via GoPay Direct API...');
      return await this.createRealGoPayPayment(params);
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Create demo QR code
   */
  private createDemoQris(params: GoPayPaymentRequest): GoPayPaymentResponse {
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
   * Create real payment via GoPay Direct API
   * Note: This requires special access from Gojek
   */
  private async createRealGoPayPayment(params: GoPayPaymentRequest): Promise<GoPayPaymentResponse> {
    // Note: Actual implementation depends on GoPay Merchant API
    // This is a placeholder since GoPay Merchant API is not publicly available

    const requestBody = {
      merchant_id: params.merchantId,
      order_id: params.orderId,
      amount: params.amount,
      currency: 'IDR',
      description: `Pembayaran ${params.orderId}`,
      callback_url: params.callbackUrl || '',
    };

    console.log('📤 GoPay Direct Request:', JSON.stringify(requestBody, null, 2));

    // TODO: Implement actual GoPay Merchant API call
    // Example (placeholder - actual API may differ):
    /*
    const axios = require('axios');

    const response = await axios.post(this.apiEndpoint + '/v1/qr', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await this.getAccessToken(),
      },
    });

    return {
      success: true,
      qrCode: response.data.qr_code,
      transactionId: response.data.transaction_id,
    };
    */

    // For now, return demo since API access is needed
    console.warn('⚠️ GoPay Direct API not implemented - requires Merchant API access');
    return this.createDemoQris(params);
  }

  /**
   * Get access token for GoPay API
   * Note: This would be implemented with actual OAuth flow
   */
  private async getAccessToken(): Promise<string> {
    // TODO: Implement OAuth 2.0 flow for GoPay Merchant API
    // This would involve:
    // 1. Client credentials grant
    // 2. Store token in memory/redis
    // 3. Refresh token when expired
    
    throw new Error('GoPay Direct API not implemented - requires Merchant API access');
  }

  /**
   * Check payment status
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

    // TODO: Implement status check via GoPay API
    return null;
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!(this.merchantId && this.apiEndpoint);
  }

  /**
   * Get payment mode
   */
  getPaymentMode(): string {
    return this.paymentMode;
  }
}

// Export singleton instance
export const goPayDirectService = new GoPayDirectService();

export default goPayDirectService;
