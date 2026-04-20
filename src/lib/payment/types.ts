import type { PaymentGateway, PaymentType, PaymentStatus } from '../../types/database'

// Gateway configuration interface
export interface GatewayConfig {
  apiKey: string
  merchantCode?: string
  clientId?: string
  clientKey?: string
  serverKey?: string
  webhookSecret?: string
  isProduction?: boolean
}

// Payment request interface
export interface CreatePaymentRequest {
  orderId: string
  amount: number
  paymentType: PaymentType | 'full' | 'dp' | 'remaining'
  customerName: string
  customerEmail: string | null
  customerPhone: string
  description: string
  expiryHours?: number
}

// Payment response interface
export interface CreatePaymentResponse {
  success: boolean
  paymentId?: string
  transactionId?: string
  paymentUrl?: string
  qrString?: string
  expiresAt?: string
  error?: string
}

// Payment status response
export interface PaymentStatusResponse {
  status: PaymentStatus | 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'refunded'
  amount: number
  paidAt?: string
  expiryAt?: string
}

// Webhook payload interface
export interface WebhookPayload {
  [key: string]: any
}

// Gateway adapter interface
export interface PaymentAdapter {
  name: PaymentGateway
  displayName: string
  supportsQr: boolean

  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>
  checkStatus(transactionId: string): Promise<PaymentStatusResponse>
  verifyWebhook(payload: WebhookPayload, signature: string): Promise<boolean>
  extractTransactionId(payload: WebhookPayload): string
  extractStatus(payload: WebhookPayload): PaymentStatus | string
}

// Gateway configuration from database
export interface DbGatewayConfig {
  id: string
  name: PaymentGateway
  display_name: string
  is_active: boolean
  priority: number
  config: GatewayConfig
  fee_percent: number
  fee_flat: number
  supports_qr: boolean
}
