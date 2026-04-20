import type {
  PaymentAdapter,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatusResponse,
  WebhookPayload
} from '../types'

export abstract class BaseAdapter implements PaymentAdapter {
  abstract name: string
  abstract displayName: string
  abstract supportsQr: boolean

  protected config: Record<string, any>

  constructor(config: Record<string, any>) {
    this.config = config
  }

  abstract createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>
  abstract checkStatus(transactionId: string): Promise<PaymentStatusResponse>
  abstract verifyWebhook(payload: WebhookPayload, signature: string): Promise<boolean>
  abstract extractTransactionId(payload: WebhookPayload): string
  abstract extractStatus(payload: WebhookPayload): any

  // Common utility methods
  protected generateTransactionId(orderId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${orderId}-${timestamp}-${random}`.toUpperCase()
  }

  protected calculateExpiryDate(hours: number = 24): Date {
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + hours)
    return expiry
  }

  protected formatAmount(amount: number): number {
    return Math.round(amount)
  }
}
