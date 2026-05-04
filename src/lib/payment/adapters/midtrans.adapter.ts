import { BaseAdapter } from './base.adapter'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GatewayConfig,
  PaymentStatusResponse,
  WebhookPayload
} from '../types'
import type { PaymentGateway, PaymentStatus } from '../../../types/database'

// Midtrans status enum
type MidtransStatus =
  | 'pending'
  | 'settlement'
  | 'capture'
  | 'authorize'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'refund'
  | 'partial_refund'

export class MidtransAdapter extends BaseAdapter {
  name: PaymentGateway = 'midtrans'
  displayName = 'Midtrans'
  supportsQr = true

  constructor(config: GatewayConfig) {
    super(config)
  }

  private get apiUrl(): string {
    return this.config.isProduction
      ? 'https://app.midtrans.com/snap/v1'
      : 'https://app.sandbox.midtrans.com/snap/v1'
  }

  private get coreApiUrl(): string {
    return this.config.isProduction
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2'
  }

  private get serverKey(): string {
    return this.config.serverKey || ''
  }

  private get clientKey(): string {
    return this.config.clientKey || ''
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const transactionId = this.generateTransactionId(request.orderId)
      const expiryDate = this.calculateExpiryDate(request.expiryHours || 24)

      // Midtrans Snap API request payload
      const payload = {
        transaction_details: {
          order_id: transactionId,
          gross_amount: this.formatAmount(request.amount)
        },
        customer_details: {
          first_name: request.customerName.split(' ')[0],
          last_name: request.customerName.split(' ').slice(1).join(' ') || '',
          email: request.customerEmail || `${request.customerName.replace(/\s+/g, '.').toLowerCase()}@example.com`,
          phone: request.customerPhone
        },
        item_details: [
          {
            id: request.orderId,
            name: request.description,
            price: this.formatAmount(request.amount),
            quantity: 1
          }
        ],
        expiry: {
          unit: 'hours',
          duration: request.expiryHours || 24
        },
        enabled_payments: ['qris'],
        custom_field1: request.orderId,
        custom_field2: request.paymentType
      }

      // Call Midtrans Snap API
      const response = await fetch(`${this.apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.serverKey}:`).toString('base64')}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Midtrans API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      return {
        success: true,
        paymentId: data.token,
        transactionId,
        paymentUrl: data.redirect_url,
        qrString: data.qr_string || undefined,
        expiresAt: expiryDate.toISOString()
      }
    } catch (error) {
      console.error('Midtrans createPayment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async checkStatus(transactionId: string, _amount?: number): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(
        `${this.coreApiUrl}/${transactionId}/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${this.serverKey}:`).toString('base64')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Midtrans API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        status: this.mapMidtransStatus(data.transaction_status || data.status),
        amount: data.gross_amount || 0,
        paidAt: data.settlement_time || data.paid_at || undefined,
        expiryAt: data.expiry_time || undefined
      }
    } catch (error) {
      console.error('Midtrans checkStatus error:', error)
      throw error
    }
  }

  async verifyWebhook(payload: WebhookPayload, signature: string): Promise<boolean> {
    try {
      const orderId = payload.order_id
      const statusCode = payload.status_code
      const grossAmount = payload.gross_amount

      // Create signature string
      const signatureString = `${orderId}${statusCode}${grossAmount}${this.serverKey}`

      // Calculate SHA512 hash
      const crypto = await import('crypto')
      const calculatedSignature = crypto
        .createHash('sha512')
        .update(signatureString)
        .digest('hex')

      return calculatedSignature === signature
    } catch (error) {
      console.error('Midtrans verifyWebhook error:', error)
      return false
    }
  }

  extractTransactionId(payload: WebhookPayload): string {
    return payload.order_id || ''
  }

  extractStatus(payload: WebhookPayload): PaymentStatus {
    return this.mapMidtransStatus(payload.transaction_status || payload.status)
  }

  private mapMidtransStatus(status?: string): PaymentStatus {
    const statusMap: Record<MidtransStatus, PaymentStatus> = {
      pending: 'pending',
      settlement: 'paid',
      capture: 'paid',
      authorize: 'paid',
      deny: 'failed',
      cancel: 'failed',
      expire: 'expired',
      refund: 'refunded',
      partial_refund: 'refunded'
    }

    return statusMap[status as MidtransStatus] || 'pending'
  }
}
