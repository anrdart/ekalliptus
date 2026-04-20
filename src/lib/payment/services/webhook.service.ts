import { getSupabase } from '../../lib/supabase'
import { AdapterFactory, dbConfigToGatewayConfig } from '../adapters'
import type { WebhookPayload, DbGatewayConfig } from '../types'
import type { Payment, PaymentGateway as PaymentGatewayType, PaymentStatusNew, Order } from '../../types/database'

/**
 * Webhook Service
 * Handles payment gateway webhooks - validating signatures, updating payment status,
 * and triggering follow-up actions like order status updates and consultation creation.
 */
export class WebhookService {
  /**
   * Process webhook from payment gateway
   * Main entry point for webhook processing
   */
  async processWebhook(
    gateway: PaymentGatewayType,
    payload: WebhookPayload,
    signature: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean
    message: string
    payment?: Payment
  }> {
    const supabase = getSupabase()

    if (!supabase) {
      const error = 'Supabase client not initialized'
      await this.logWebhook({
        gateway,
        eventType: 'webhook_error',
        requestData: payload,
        responseData: null,
        status: 'error',
        errorMessage: error,
        ipAddress,
        userAgent
      })
      return { success: false, message: error }
    }

    try {
      // Get gateway configuration
      const gatewayConfig = await this.getGateway(gateway)
      if (!gatewayConfig) {
        const error = `Payment gateway ${gateway} not found or not configured`
        await this.logWebhook({
          gateway,
          eventType: 'webhook_error',
          requestData: payload,
          responseData: null,
          status: 'error',
          errorMessage: error,
          ipAddress,
          userAgent
        })
        return { success: false, message: error }
      }

      // Verify signature via adapter
      const gatewayConfigObj = dbConfigToGatewayConfig(gatewayConfig)
      const adapter = AdapterFactory.create(gateway, gatewayConfigObj)

      if (!adapter) {
        const error = `Failed to create adapter for gateway ${gateway}`
        await this.logWebhook({
          gateway,
          eventType: 'webhook_error',
          requestData: payload,
          responseData: null,
          status: 'error',
          errorMessage: error,
          ipAddress,
          userAgent
        })
        return { success: false, message: error }
      }

      const isValid = await adapter.verifyWebhook(payload, signature)
      if (!isValid) {
        const error = 'Invalid webhook signature'
        await this.logWebhook({
          gateway,
          eventType: 'signature_verification_failed',
          requestData: payload,
          responseData: null,
          status: 'failed',
          errorMessage: error,
          ipAddress,
          userAgent
        })
        return { success: false, message: error }
      }

      // Extract transaction ID from payload
      const transactionId = adapter.extractTransactionId(payload)
      if (!transactionId) {
        const error = 'No transaction ID in webhook payload'
        await this.logWebhook({
          gateway,
          eventType: 'missing_transaction_id',
          requestData: payload,
          responseData: null,
          status: 'failed',
          errorMessage: error,
          ipAddress,
          userAgent
        })
        return { success: false, message: error }
      }

      // Find payment by transaction_id
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('gateway_transaction_id', transactionId)
        .single()

      if (paymentError || !payment) {
        const error = `Payment not found for transaction ${transactionId}`
        await this.logWebhook({
          paymentId: null,
          gateway,
          eventType: 'payment_not_found',
          requestData: payload,
          responseData: null,
          status: 'failed',
          errorMessage: error,
          ipAddress,
          userAgent
        })
        return { success: false, message: error }
      }

      // Check for duplicates (already paid)
      if (payment.status === 'paid') {
        const message = 'Payment already processed'
        await this.logWebhook({
          paymentId: payment.id,
          gateway,
          eventType: 'duplicate_webhook',
          requestData: payload,
          responseData: { paymentStatus: payment.status },
          status: 'success',
          errorMessage: null,
          ipAddress,
          userAgent
        })
        return { success: true, message, payment }
      }

      // Extract status from payload
      const newStatus = adapter.extractStatus(payload) as PaymentStatusNew

      // Update payment status
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: newStatus,
          webhook_received_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            ...(payment.metadata as Record<string, any> || {}),
            webhook_payload: payload
          }
        })
        .eq('id', payment.id)
        .select()
        .single()

      if (updateError) {
        const error = `Failed to update payment: ${updateError.message}`
        await this.logWebhook({
          paymentId: payment.id,
          gateway,
          eventType: 'payment_update_failed',
          requestData: payload,
          responseData: null,
          status: 'error',
          errorMessage: error,
          ipAddress,
          userAgent
        })
        return { success: false, message: error }
      }

      // Log webhook event
      await this.logWebhook({
        paymentId: payment.id,
        gateway,
        eventType: 'payment_status_updated',
        requestData: payload,
        responseData: { newStatus, previousStatus: payment.status },
        status: 'success',
        errorMessage: null,
        ipAddress,
        userAgent
      })

      // Call handlePaymentSuccess if paid
      if (newStatus === 'paid') {
        await this.handlePaymentSuccess(payment.id)
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
        payment: updatedPayment as Payment
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error processing webhook'
      await this.logWebhook({
        gateway,
        eventType: 'webhook_error',
        requestData: payload,
        responseData: null,
        status: 'error',
        errorMessage: error,
        ipAddress,
        userAgent
      })
      return { success: false, message: error }
    }
  }

  /**
   * Handle payment success
   * Private method - updates order status and creates consultation if needed
   */
  private async handlePaymentSuccess(paymentId: string): Promise<void> {
    const supabase = getSupabase()

    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    try {
      // Get payment with order details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            id,
            payment_option,
            consultation_required,
            status
          )
        `)
        .eq('id', paymentId)
        .single()

      if (paymentError || !payment) {
        console.error('Payment not found:', paymentError)
        return
      }

      const order = payment.orders as any
      if (!order) {
        console.error('Order not found for payment:', paymentId)
        return
      }

      // Update order status based on payment_type
      let newOrderStatus: string
      const paymentType = payment.payment_type

      if (paymentType === 'full') {
        newOrderStatus = 'dp_paid'
      } else if (paymentType === 'dp') {
        newOrderStatus = 'dp_paid'
      } else if (paymentType === 'remaining') {
        newOrderStatus = 'onsite_paid'
      } else {
        console.error('Unknown payment type:', paymentType)
        return
      }

      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          status: newOrderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (orderUpdateError) {
        console.error('Failed to update order status:', orderUpdateError)
        return
      }

      // Create consultation if DP payment
      if (paymentType === 'dp' && order.consultation_required) {
        await this.createConsultation(order.id, paymentId)
      }
    } catch (err) {
      console.error('Error handling payment success:', err)
    }
  }

  /**
   * Create consultation for order
   * Private method - inserts consultation record with status 'scheduled'
   */
  private async createConsultation(orderId: string, paymentId: string): Promise<void> {
    const supabase = getSupabase()

    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    try {
      const { error } = await supabase
        .from('consultations')
        .insert({
          order_id: orderId,
          payment_id: paymentId,
          scheduled_date: null,
          scheduled_time: null,
          meeting_link: null,
          status: 'scheduled',
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to create consultation:', error)
      }
    } catch (err) {
      console.error('Error creating consultation:', err)
    }
  }

  /**
   * Log webhook event
   * Private method - inserts into payment_logs table
   */
  private async logWebhook(params: {
    paymentId?: string | null
    gateway: PaymentGatewayType
    eventType: string
    requestData: WebhookPayload
    responseData: Record<string, any> | null
    status: string
    errorMessage: string | null
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const supabase = getSupabase()

    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    try {
      await supabase
        .from('payment_logs')
        .insert({
          payment_id: params.paymentId || null,
          gateway: params.gateway,
          event_type: params.eventType,
          request_data: params.requestData as any,
          response_data: params.responseData as any,
          status: params.status,
          error_message: params.errorMessage,
          ip_address: params.ipAddress || null,
          user_agent: params.userAgent || null,
          created_at: new Date().toISOString()
        })
    } catch (err) {
      console.error('Failed to log webhook event:', err)
    }
  }

  /**
   * Get gateway configuration by name
   * Private helper method
   */
  private async getGateway(name: PaymentGatewayType): Promise<DbGatewayConfig | null> {
    const supabase = getSupabase()

    if (!supabase) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('payment_gateway_configs')
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
        config: data.config as DbGatewayConfig['config'],
        fee_percent: data.fee_percent,
        fee_flat: data.fee_flat,
        supports_qr: data.supports_qr
      }
    } catch (err) {
      console.error('Error fetching gateway:', err)
      return null
    }
  }
}

// Export singleton instance
export const webhookService = new WebhookService()
