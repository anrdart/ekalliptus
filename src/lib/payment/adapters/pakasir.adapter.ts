import { BaseAdapter } from './base.adapter'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatusResponse,
  WebhookPayload
} from '../types'
import type { PaymentGateway } from '../../../types/database'

// Pakasir status enum
type PakasirStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'processing'

// Pakasir API response types
interface PakasirCreateResponse {
  status: boolean
  message: string
  data?: {
    order_id: string
    qr_string: string
    amount: number
    expiry_date: string
    payment_url?: string
  }
}

interface PakasirStatusResponse {
  status: boolean
  message: string
  data?: {
    order_id: string
    status: PakasirStatus
    amount: number
    paid_at?: string
    expiry_date?: string
  }
}

export class PakasirAdapter extends BaseAdapter {
  name: PaymentGateway = 'pakasir'
  displayName = 'Pakasir'
  supportsQr = true

  constructor(config: Record<string, any>) {
    super(config)
  }

  private get apiUrl(): string {
    return this.config.isProduction
      ? 'https://api.pakasir.com'
      : 'https://sandbox.pakasir.com'
  }

  private get apiKey(): string {
    return this.config.apiKey || ''
  }

  private get merchantCode(): string {
    return this.config.merchantCode || ''
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const transactionId = this.generateTransactionId(request.orderId)
      const expiryDate = this.calculateExpiryDate(request.expiryHours || 24)

      // Pakasir API request payload
      const payload = {
        merchant_code: this.merchantCode,
        order_id: transactionId,
        amount: this.formatAmount(request.amount),
        customer_name: request.customerName,
        customer_email: request.customerEmail || '',
        customer_phone: request.customerPhone,
        description: request.description,
        expiry_hours: request.expiryHours || 24,
        // Custom fields for tracking
        custom_order_id: request.orderId,
        payment_type: request.paymentType
      }

      // Call Pakasir API
      const response = await fetch(`${this.apiUrl}/api/transactioncreate/qris`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Pakasir API error: ${response.status} ${errorText}`)
      }

      const data: PakasirCreateResponse = await response.json()

      if (!data.status || !data.data) {
        throw new Error(data.message || 'Failed to create payment')
      }

      return {
        success: true,
        paymentId: data.data.order_id,
        transactionId: data.data.order_id,
        paymentUrl: data.data.payment_url,
        qrString: data.data.qr_string,
        expiresAt: data.data.expiry_date || expiryDate.toISOString()
      }
    } catch (error) {
      console.error('Pakasir createPayment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async checkStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/transactiondetail?order_id=${transactionId}&merchant_code=${this.merchantCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Pakasir API error: ${response.status}`)
      }

      const data: PakasirStatusResponse = await response.json()

      if (!data.status || !data.data) {
        throw new Error(data.message || 'Failed to check status')
      }

      return {
        status: this.mapPakasirStatus(data.data.status),
        amount: data.data.amount,
        paidAt: data.data.paid_at || undefined,
        expiryAt: data.data.expiry_date || undefined
      }
    } catch (error) {
      console.error('Pakasir checkStatus error:', error)
      throw error
    }
  }

  async verifyWebhook(payload: WebhookPayload, signature: string): Promise<boolean> {
    try {
      // Basic validation for Pakasir webhook
      // Check required fields
      if (!payload.order_id || !payload.amount || !payload.status) {
        console.error('Pakasir webhook missing required fields')
        return false
      }

      // Verify signature if provided (Pakasir may use HMAC signature)
      if (signature && this.config.webhookSecret) {
        const crypto = await import('crypto')

        // Create signature string based on Pakasir webhook format
        // Adjust this based on actual Pakasir signature format
        const signatureString = `${payload.order_id}${payload.amount}${payload.status}${this.config.webhookSecret}`
        const calculatedSignature = crypto
          .createHmac('sha256', this.config.webhookSecret)
          .update(signatureString)
          .digest('hex')

        return calculatedSignature === signature
      }

      // If no signature verification, do basic validation
      return (
        typeof payload.order_id === 'string' &&
        typeof payload.amount === 'number' &&
        typeof payload.status === 'string'
      )
    } catch (error) {
      console.error('Pakasir verifyWebhook error:', error)
      return false
    }
  }

  extractTransactionId(payload: WebhookPayload): string {
    return payload.order_id || ''
  }

  extractStatus(payload: WebhookPayload): string {
    return this.mapPakasirStatus(payload.status)
  }

  private mapPakasirStatus(status: PakasirStatus): string {
    const statusMap: Record<PakasirStatus, string> = {
      pending: 'pending',
      completed: 'paid',
      failed: 'failed',
      expired: 'expired',
      processing: 'processing'
    }

    return statusMap[status] || 'pending'
  }
}
