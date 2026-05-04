import type {
  PaymentAdapter,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatusResponse,
  WebhookPayload,
  GatewayConfig
} from '../types'

export abstract class BaseAdapter implements PaymentAdapter {
  abstract name: PaymentAdapter['name']
  abstract displayName: string
  abstract supportsQr: boolean

  protected config: GatewayConfig

  constructor(config: GatewayConfig) {
    this.config = config
  }

  abstract createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>
  abstract checkStatus(transactionId: string, amount?: number): Promise<PaymentStatusResponse>
  abstract verifyWebhook(payload: WebhookPayload, signature: string): Promise<boolean>
  abstract extractTransactionId(payload: WebhookPayload): string
  abstract extractStatus(payload: WebhookPayload): ReturnType<PaymentAdapter['extractStatus']>

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
