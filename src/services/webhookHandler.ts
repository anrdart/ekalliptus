/**
 * Payment Webhook Handler
 * Handles payment notifications from payment gateways
 */

import { supabase } from '@/config/supabase';
import type { Database } from '@/config/supabase';

type PaymentTransaction = Database['public']['Tables']['payment_transactions']['Row'];

export interface WebhookPayload {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  order_id: string;
  payment_type: string;
  gross_amount: string;
  payment_code?: string;
  approval_code?: string;
  bank?: string;
  va_number?: string;
  bill_key?: string;
  biller_code?: string;
  permata_va_number?: string;
  bca_va_number?: string;
  bni_va_number?: string;
  bri_va_number?: string;
  cimb_va_number?: string;
  other_va_number?: string;
  echannel_bill_key?: string;
  echannel_biller_code?: string;
  shopeepay_reference?: string;
  qr_string?: string;
  acquirer?: string;
  issuer?: string;
  card_type?: string;
  masked_card?: string;
  three_ds_secure?: string;
  eci?: string;
  saved_token_id?: string;
  saved_token_id_expired_at?: string;
  point_redeem_amount?: string;
  point_redeem_quantity?: string;
  points?: string;
  installment_term?: string;
  bin?: string;
  last_4digit?: string;
  expiry_date?: string;
  card_number?: string;
  cardholder_name?: string;
  card_token?: string;
  card_token_expired_at?: string;
  expiry_time?: string;
  cancel_time?: string;
  refund_time?: string;
  refund_amount?: string;
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
  fraud_status?: string;
  settlement_time?: string;
}

class WebhookHandler {
  private readonly serverKey = import.meta.env.VITE_PAYMENT_SERVER_KEY;

  /**
   * Verify webhook signature
   */
  private verifySignature(payload: WebhookPayload, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(payload.order_id + payload.status_code + payload.gross_amount + this.serverKey)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Process webhook notification
   */
  async processNotification(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Processing webhook:', payload);

      // Log webhook
      await this.logWebhook(payload);

      // Get existing transaction
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('order_id', payload.order_id)
        .single();

      if (error) {
        console.error('Transaction not found:', error);
        return { success: false, message: 'Transaction not found' };
      }

      // Update transaction with webhook data
      const updateData = {
        transaction_status: payload.transaction_status,
        status_code: payload.status_code,
        status_message: payload.status_message,
        payment_type: payload.payment_type,
        bank: payload.bank || null,
        va_number: payload.va_number || null,
        approval_code: payload.approval_code || null,
        qr_string: payload.qr_string || null,
        masked_card: payload.masked_card || null,
        card_type: payload.card_type || null,
        fraud_status: payload.fraud_status || null,
        expiry_time: payload.expiry_time || null,
        cancel_time: payload.cancel_time || null,
        settlement_time: payload.settlement_time || null,
        refund_time: payload.refund_time || null,
        refund_amount: payload.refund_amount || null,
        metadata: payload,
        updated_at: new Date().toISOString(),
        processed: payload.transaction_status === 'settlement',
      };

      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('order_id', payload.order_id);

      if (updateError) {
        console.error('Failed to update transaction:', updateError);
        return { success: false, message: 'Failed to update transaction' };
      }

      // Update order payment status
      await this.updateOrderStatus(payload.order_id, payload.transaction_status, payload.status_code);

      // Handle specific status
      await this.handleTransactionStatus(payload);

      console.log('Webhook processed successfully');
      return { success: true, message: 'Webhook processed successfully' };

    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Log webhook to database
   */
  private async logWebhook(payload: WebhookPayload): Promise<void> {
    try {
      await supabase.from('webhook_logs').insert({
        order_id: payload.order_id,
        event_type: payload.transaction_status,
        payload: payload as any,
        processed: true,
        processing_time_ms: 0,
        error_message: null,
      });
    } catch (error) {
      console.error('Failed to log webhook:', error);
    }
  }

  /**
   * Update order payment status
   */
  private async updateOrderStatus(orderId: string, transactionStatus: string, statusCode: string): Promise<void> {
    let paymentStatus = 'pending';

    switch (transactionStatus) {
      case 'capture':
        if (statusCode === '200') {
          paymentStatus = 'paid';
        }
        break;
      case 'settlement':
        paymentStatus = 'paid';
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
      case 'failure':
        paymentStatus = 'failed';
        break;
      case 'refund':
      case 'partial_refund':
        paymentStatus = 'refunded';
        break;
    }

    await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);
  }

  /**
   * Handle specific transaction status
   */
  private async handleTransactionStatus(payload: WebhookPayload): Promise<void> {
    switch (payload.transaction_status) {
      case 'capture':
      case 'settlement':
        await this.onPaymentSuccess(payload);
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
        await this.onPaymentFailed(payload);
        break;
      case 'refund':
      case 'partial_refund':
        await this.onPaymentRefunded(payload);
        break;
    }
  }

  /**
   * Handle successful payment
   */
  private async onPaymentSuccess(payload: WebhookPayload): Promise<void> {
    console.log('Payment successful:', payload.order_id);

    // Send confirmation email/notification
    // TODO: Implement notification logic

    // You can trigger real-time updates here
    // The frontend will automatically receive updates via subscription
  }

  /**
   * Handle failed payment
   */
  private async onPaymentFailed(payload: WebhookPayload): Promise<void> {
    console.log('Payment failed:', payload.order_id);

    // Send failure notification
    // TODO: Implement notification logic
  }

  /**
   * Handle refunded payment
   */
  private async onPaymentRefunded(payload: WebhookPayload): Promise<void> {
    console.log('Payment refunded:', payload.order_id);

    // Send refund notification
    // TODO: Implement notification logic
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(orderId: string): Promise<PaymentTransaction | null> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Error fetching payment history:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all webhook logs
   */
  async getWebhookLogs(limit: number = 100) {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching webhook logs:', error);
      return [];
    }

    return data;
  }
}

// Export singleton instance
export const webhookHandler = new WebhookHandler();
export default webhookHandler;
