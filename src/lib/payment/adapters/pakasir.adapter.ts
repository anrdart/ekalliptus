import { BaseAdapter } from './base.adapter'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GatewayConfig,
  PaymentStatusResponse,
  WebhookPayload
} from '../types'
import type { PaymentGateway, PaymentStatus } from '../../../types/database'

type PakasirStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'processing'

interface PakasirPaymentItem {
  project: string
  order_id: string
  amount: number
  fee: number
  total_payment: number
  payment_method: string
  payment_number: string | null
  payment_url: string | null
  redirect_url: string | null
  expired_at: string
}

interface PakasirCreateResponse {
  payment: PakasirPaymentItem
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

  constructor(config: GatewayConfig) {
    super(config)
  }

  private get apiUrl(): string {
    return 'https://app.pakasir.com'
  }

  private get apiKey(): string {
    return this.config.apiKey || ''
  }

  private get merchantCode(): string {
    return this.config.merchantCode || ''
  }

  protected generateTransactionId(_orderId: string): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const transactionId = this.generateTransactionId(request.orderId)
      const expiryDate = this.calculateExpiryDate(request.expiryHours || 24)

      const payload = {
        project: this.merchantCode,
        api_key: this.apiKey,
        order_id: transactionId,
        amount: this.formatAmount(request.amount),
        customer_name: request.customerName,
        customer_email: request.customerEmail || '',
        customer_phone: request.customerPhone,
        description: request.description,
        expiry_hours: request.expiryHours || 24,
        payment_type: request.paymentType
      }

      const response = await fetch(`${this.apiUrl}/api/transactioncreate/qris`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Pakasir API error: ${response.status} ${errorText}`)
      }

      const data: PakasirCreateResponse = await response.json()

      if (!data.payment) {
        throw new Error('Failed to create payment: ' + JSON.stringify(data))
      }

      const payment = data.payment
      const baseUrl = `${this.apiUrl}/pay/${this.merchantCode}/${payload.amount}?order_id=${payment.order_id}`
      const redirectUrl = request.returnUrl || '/order-success'
      const paymentUrl = `${baseUrl}&redirect=${encodeURIComponent(redirectUrl)}`

      return {
        success: true,
        paymentId: payment.order_id,
        transactionId: payment.order_id,
        paymentUrl,
        qrString: payment.payment_number || undefined,
        expiresAt: payment.expired_at || expiryDate.toISOString()
      }
    } catch (error) {
      console.error('Pakasir createPayment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async checkStatus(transactionId: string, amount?: number): Promise<PaymentStatusResponse> {
    try {
      const params = new URLSearchParams({
        order_id: transactionId,
        project: this.merchantCode,
        api_key: this.apiKey
      })
      if (amount !== undefined) {
        params.set('amount', String(amount))
      }

      const response = await fetch(
        `${this.apiUrl}/api/transactiondetail?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
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

  async verifyWebhook(payload: WebhookPayload, _signature: string): Promise<boolean> {
    try {
      if (!payload.order_id || !payload.amount || !payload.status) {
        console.error('Pakasir webhook missing required fields')
        return false
      }

      const txStatus = await this.checkStatus(payload.order_id, payload.amount)

      return txStatus.status === this.mapPakasirStatus(payload.status)
    } catch (error) {
      console.error('Pakasir verifyWebhook error:', error)
      return false
    }
  }

  extractTransactionId(payload: WebhookPayload): string {
    return payload.order_id || ''
  }

  extractStatus(payload: WebhookPayload): PaymentStatus {
    return this.mapPakasirStatus(payload.status)
  }

  private mapPakasirStatus(status?: string): PaymentStatus {
    const statusMap: Record<PakasirStatus, PaymentStatus> = {
      pending: 'pending',
      completed: 'paid',
      failed: 'failed',
      expired: 'expired',
      processing: 'processing'
    }

    return statusMap[status as PakasirStatus] || 'pending'
  }
}
