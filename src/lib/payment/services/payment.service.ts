import { getSupabase } from '../../supabase'
function generateUUID(): string {
  // globalThis.crypto is available in Cloudflare Workers/workerd, Node.js 19+, and browsers
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  // Fallback: manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
import { AdapterFactory, dbConfigToGatewayConfig } from '../adapters'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  DbGatewayConfig
} from '../types'
import type { Payment, PaymentGateway as PaymentGatewayType, PaymentStatus, PaymentType } from '../../../types/database'

/**
 * Payment Service
 * Handles payment operations using payment gateway adapters
 */
export class PaymentService {
  /**
   * Get all active payment gateways ordered by priority
   */
  async getActiveGateways(): Promise<DbGatewayConfig[]> {
    const supabase = getSupabase(true)

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch active gateways: ${error.message}`)
      }

      // Convert to DbGatewayConfig format
      return (data || []).map((config: any) => ({
        id: config.id,
        name: config.name as PaymentGatewayType,
        display_name: config.display_name,
        is_active: config.is_active,
        priority: config.priority,
        config: config.config as unknown as DbGatewayConfig['config'],
        fee_percent: config.fee_percent,
        fee_flat: config.fee_flat,
        supports_qr: config.supports_qr
      }))
    } catch (err) {
      console.error('Error fetching active gateways:', err)
      throw err
    }
  }

  /**
   * Get specific gateway configuration by name
   */
  async getGateway(name: PaymentGatewayType): Promise<DbGatewayConfig | null> {
    const supabase = getSupabase(true)

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('name', name)
        .single()

      if (error) {
        return null
      }

      return {
        id: data.id,
        name: data.name as PaymentGatewayType,
        display_name: data.display_name,
        is_active: data.is_active,
        priority: data.priority,
        config: data.config as unknown as DbGatewayConfig['config'],
        fee_percent: data.fee_percent,
        fee_flat: data.fee_flat,
        supports_qr: data.supports_qr
      }
    } catch (err) {
      console.error('Error fetching gateway:', err)
      return null
    }
  }

  /**
   * Calculate gateway fees
   */
  private calculateGatewayFees(amount: number, gateway: DbGatewayConfig): number {
    const percentageFee = Math.floor(amount * (gateway.fee_percent / 100))
    return percentageFee + gateway.fee_flat
  }

  /**
   * Create payment via gateway and save to database
   */
  async createPayment(
    orderId: string,
    gatewayName: PaymentGatewayType,
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse & { dbPayment?: Payment }> {
    const supabase = getSupabase(true)

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Get gateway configuration
    const gatewayConfig = await this.getGateway(gatewayName)
    if (!gatewayConfig) {
      throw new Error(`Payment gateway ${gatewayName} not found or not configured`)
    }

    if (!gatewayConfig.is_active) {
      throw new Error(`Payment gateway ${gatewayName} is not active`)
    }

    // Calculate gateway fees
    const gatewayFee = this.calculateGatewayFees(request.amount, gatewayConfig)
    const totalAmount = request.amount + gatewayFee

    // Create payment adapter
    const gatewayConfigObj = dbConfigToGatewayConfig(gatewayConfig)
    const adapter = AdapterFactory.create(gatewayName, gatewayConfigObj)

    if (!adapter) {
      throw new Error(`Failed to create adapter for gateway ${gatewayName}`)
    }

    // Create payment via gateway
    const paymentResponse: CreatePaymentResponse = await adapter.createPayment(request)

    if (!paymentResponse.success || !paymentResponse.paymentId) {
      return paymentResponse
    }

    const paymentData = {
      id: generateUUID(),
      order_id: orderId,
      gateway: gatewayName,
      gateway_transaction_id: paymentResponse.transactionId || null,
      amount: totalAmount,
      payment_type: request.paymentType as PaymentType,
      status: 'pending' as PaymentStatus,
      payment_url: paymentResponse.paymentUrl || null,
      qr_string: paymentResponse.qrString || null,
      expires_at: paymentResponse.expiresAt || null,
      paid_at: null,
      webhook_received_at: null,
      metadata: {
        gateway_fee: gatewayFee,
        original_amount: request.amount,
        customer: {
          name: request.customerName,
          email: request.customerEmail,
          phone: request.customerPhone
        },
        description: request.description
      }
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) {
        console.error('Failed to save payment:', error.message)
        return {
          success: false,
          error: `Failed to save payment record: ${error.message}`
        }
      }

      return {
        ...paymentResponse,
        dbPayment: data
      }
    } catch (err) {
      console.error('Error saving payment:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to save payment'
      }
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<Payment | null> {
    const supabase = getSupabase(true)

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (error) {
        return null
      }

      return data as Payment
    } catch (err) {
      console.error('Error fetching payment:', err)
      return null
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<Payment[]> {
    const supabase = getSupabase(true)

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch payments: ${error.message}`)
      }

      return (data || []) as Payment[]
    } catch (err) {
      console.error('Error fetching payments by order:', err)
      throw err
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    additionalData?: {
      paidAt?: string
      webhookReceivedAt?: string
      metadata?: Record<string, any>
    }
  ): Promise<Payment | null> {
    const supabase = getSupabase(true)

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (additionalData?.paidAt) {
        updateData.paid_at = additionalData.paidAt
      }

      if (additionalData?.webhookReceivedAt) {
        updateData.webhook_received_at = additionalData.webhookReceivedAt
      }

      if (additionalData?.metadata) {
        // Merge metadata with existing
        const { data: existing } = await supabase
          .from('payments')
          .select('metadata')
          .eq('id', paymentId)
          .single()

        if (existing) {
          updateData.metadata = {
            ...(existing.metadata as Record<string, any> || {}),
            ...additionalData.metadata
          }
        }
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update payment status: ${error.message}`)
      }

      return data as Payment
    } catch (err) {
      console.error('Error updating payment status:', err)
      throw err
    }
  }

  /**
   * Check payment status by polling gateway
   */
  async checkPaymentStatus(paymentId: string): Promise<{
    payment: Payment | null
    gatewayStatus?: string
    error?: string
  }> {
    const supabase = getSupabase(true)

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      // Get payment details
      const payment = await this.getPayment(paymentId)

      if (!payment) {
        return { payment: null, error: 'Payment not found' }
      }

      // If payment is already in final state, return it
      if (payment.status === 'paid' || payment.status === 'failed' || payment.status === 'expired' || payment.status === 'refunded') {
        return { payment }
      }

      // Get gateway configuration
      const gatewayConfig = await this.getGateway(payment.gateway)

      if (!gatewayConfig) {
        return { payment, error: 'Gateway configuration not found' }
      }

      // Create adapter and check status
      const gatewayConfigObj = dbConfigToGatewayConfig(gatewayConfig)
      const adapter = AdapterFactory.create(payment.gateway, gatewayConfigObj)

      if (!adapter) {
        return { payment, error: 'Failed to create gateway adapter' }
      }

      if (!payment.gateway_transaction_id) {
        return { payment, error: 'No gateway transaction ID found' }
      }

      const statusResponse = await adapter.checkStatus(payment.gateway_transaction_id)

      // Update payment status based on gateway response
      const newStatus = this.mapGatewayStatus(statusResponse.status)
      if (newStatus !== payment.status) {
        const updatedPayment = await this.updatePaymentStatus(paymentId, newStatus, {
          paidAt: statusResponse.paidAt
        })

        return {
          payment: updatedPayment,
          gatewayStatus: statusResponse.status
        }
      }

      return {
        payment,
        gatewayStatus: statusResponse.status
      }
    } catch (err) {
      console.error('Error checking payment status:', err)
      return {
        payment: null,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }

  /**
   * Map gateway status to payment status
   */
  private mapGatewayStatus(gatewayStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'pending': 'pending',
      'processing': 'pending',
      'paid': 'paid',
      'success': 'paid',
      'completed': 'paid',
      'failed': 'failed',
      'expired': 'expired',
      'refunded': 'refunded'
    }

    return statusMap[gatewayStatus.toLowerCase()] || 'pending'
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
