/**
 * Supabase Payment API Service for ekalliptus project
 * Handles all payment-related database operations with Supabase
 * Project: ekalliptus (ID: bkpyidvbvsmlnuslaoic)
 * Organization: ngjlxtkupgwzmdzoqung
 */

import { supabase } from '@/config/supabase';
import { sanitizeNotificationData, logSecurityEvent, createAuditTrail } from '@/lib/paymentSecurity';
import type { Database } from '@/config/supabase';

type PaymentTransaction = Database['public']['Tables']['payment_transactions']['Row'];
type PaymentTransactionInsert = Database['public']['Tables']['payment_transactions']['Insert'];
type PaymentTransactionUpdate = Database['public']['Tables']['payment_transactions']['Update'];

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

type Service = Database['public']['Tables']['services']['Row'];

type WebhookLog = Database['public']['Tables']['webhook_logs']['Row'];

export interface CreatePaymentTransactionPayload {
  order_id: string;
  transaction_id?: string;
  gross_amount: number;
  payment_type: string;
  transaction_status?: string;
  transaction_time: string;
  customer_email?: string;
  customer_phone?: string;
  metadata?: Record<string, any>;
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
  [key: string]: any; // For flexible payment gateway notification data
}

export interface TransactionStatistics {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  refunded_transactions: number;
  total_amount: number;
  success_rate: number;
}

export interface TransactionFilters {
  orderId?: string;
  status?: string;
  paymentType?: string;
  startDate?: string;
  endDate?: string;
  customerEmail?: string;
  limit?: number;
  offset?: number;
}

class SupabasePaymentApi {
  private readonly table = 'payment_transactions';
  private readonly ordersTable = 'orders';
  private readonly customersTable = 'customers';
  private readonly servicesTable = 'services';
  private readonly webhookLogsTable = 'webhook_logs';

  /**
   * Log security event
   */
  private logEvent(event: string, details: Record<string, any>, context?: string): void {
    logSecurityEvent(event, details, context || 'supabase_payment_api');
  }

  /**
   * Create a new payment transaction
   */
  async createTransaction(payload: CreatePaymentTransactionPayload): Promise<{
    success: boolean;
    data?: PaymentTransaction;
    error?: string;
  }> {
    try {
      this.logEvent('create_transaction_attempt', { orderId: payload.order_id });

      // Sanitize sensitive data
      const sanitizedPayload = sanitizeNotificationData(payload);

      // Prepare insert data
      const transactionData: PaymentTransactionInsert = {
        order_id: payload.order_id,
        transaction_id: payload.transaction_id,
        gross_amount: payload.gross_amount,
        payment_type: payload.payment_type as any,
        transaction_status: (payload.transaction_status || 'pending') as any,
        transaction_time: payload.transaction_time,
        fraud_status: payload.fraud_status,
        signature_key: payload.signature_key,
        payment_code: payload.payment_code,
        approval_code: payload.approval_code,
        bank: payload.bank,
        va_number: payload.va_number,
        bill_key: payload.bill_key,
        biller_code: payload.biller_code,
        retailer_name: payload.retailer_name,
        permata_va_number: payload.permata_va_number,
        bca_va_number: payload.bca_va_number,
        bni_va_number: payload.bni_va_number,
        bri_va_number: payload.bri_va_number,
        cimb_va_number: payload.cimb_va_number,
        other_va_number: payload.other_va_number,
        echannel_bill_key: payload.echannel_bill_key,
        echannel_biller_code: payload.echannel_biller_code,
        shopeepay_reference: payload.shopeepay_reference,
        qr_string: payload.qr_string,
        acquirer: payload.acquirer,
        issuer: payload.issuer,
        card_type: payload.card_type,
        masked_card: payload.masked_card,
        three_ds_secure: payload.three_ds_secure,
        eci: payload.eci,
        saved_token_id: payload.saved_token_id,
        saved_token_id_expired_at: payload.saved_token_id_expired_at,
        point_redeem_amount: payload.point_redeem_amount,
        point_redeem_quantity: payload.point_redeem_quantity,
        points: payload.points,
        installment_term: payload.installment_term,
        bin: payload.bin,
        last_4digit: payload.last_4digit,
        expiry_date: payload.expiry_date,
        card_number: payload.card_number,
        cardholder_name: payload.cardholder_name,
        card_token: payload.card_token,
        card_token_expired_at: payload.card_token_expired_at,
        status_code: payload.status_code,
        status_message: payload.status_message,
        settlement_time: payload.settlement_time,
        expiry_time: payload.expiry_time,
        cancel_time: payload.cancel_time,
        refund_time: payload.refund_time,
        refund_amount: payload.refund_amount,
        custom_field1: payload.custom_field1 || payload.customer_email,
        custom_field2: payload.custom_field2,
        custom_field3: payload.custom_field3,
        metadata: payload.metadata || sanitizedPayload,
        retry_count: 0,
        processed: false,
      };

      const { data, error } = await supabase
        .from(this.table)
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        this.logEvent('create_transaction_error', { error: error.message, orderId: payload.order_id });
        return { success: false, error: error.message };
      }

      this.logEvent('create_transaction_success', { orderId: payload.order_id, transactionId: data.id });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logEvent('create_transaction_error', { error: errorMessage, orderId: payload.order_id });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get payment transaction by ID
   */
  async getTransaction(transactionId: string): Promise<{
    success: boolean;
    data?: PaymentTransaction;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: sanitizeNotificationData(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get payment transaction by order ID
   */
  async getTransactionByOrderId(orderId: string): Promise<{
    success: boolean;
    data?: PaymentTransaction;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: sanitizeNotificationData(data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update payment transaction
   */
  async updateTransaction(
    orderId: string,
    updates: PaymentTransactionUpdate
  ): Promise<{
    success: boolean;
    data?: PaymentTransaction;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        this.logEvent('update_transaction_error', { error: error.message, orderId });
        return { success: false, error: error.message };
      }

      this.logEvent('update_transaction_success', { orderId, updates: Object.keys(updates) });
      return { success: true, data: sanitizeNotificationData(data) };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logEvent('update_transaction_error', { error: errorMessage, orderId });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get transactions with filters
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<{
    success: boolean;
    data?: PaymentTransaction[];
    error?: string;
  }> {
    try {
      let query = supabase.from(this.table).select('*');

      // Apply filters
      if (filters.orderId) {
        query = query.eq('order_id', filters.orderId);
      }
      if (filters.status) {
        query = query.eq('transaction_status', filters.status);
      }
      if (filters.paymentType) {
        query = query.eq('payment_type', filters.paymentType);
      }
      if (filters.customerEmail) {
        query = query.eq('custom_field1', filters.customerEmail);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data?.map(item => sanitizeNotificationData(item)) || [] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create or update order
   */
  async createOrUpdateOrder(orderData: OrderInsert): Promise<{
    success: boolean;
    data?: Order;
    error?: string;
  }> {
    try {
      // Check if order exists
      const { data: existingOrder } = await supabase
        .from(this.ordersTable)
        .select('*')
        .eq('order_id', orderData.order_id)
        .single();

      if (existingOrder) {
        // Update existing order
        const { data, error } = await supabase
          .from(this.ordersTable)
          .update({
            ...orderData,
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderData.order_id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data };
      } else {
        // Create new order
        const { data, error } = await supabase
          .from(this.ordersTable)
          .insert(orderData)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<{
    success: boolean;
    data?: Order;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.ordersTable)
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create or update customer
   */
  async createOrUpdateCustomer(customerData: CustomerInsert): Promise<{
    success: boolean;
    data?: Customer;
    error?: string;
  }> {
    try {
      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from(this.customersTable)
        .select('*')
        .eq('email', customerData.email)
        .single();

      if (existingCustomer) {
        // Update existing customer
        const { data, error } = await supabase
          .from(this.customersTable)
          .update({
            ...customerData,
            updated_at: new Date().toISOString(),
          })
          .eq('email', customerData.email)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data };
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from(this.customersTable)
          .insert(customerData)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Log webhook event
   */
  async logWebhookEvent(
    orderId: string,
    eventType: string,
    payload: Record<string, any>
  ): Promise<{
    success: boolean;
    data?: WebhookLog;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.webhookLogsTable)
        .insert({
          order_id: orderId,
          event_type: eventType,
          payload,
          processed: false,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get transaction statistics
   */
  async getStatistics(filters: { startDate?: string; endDate?: string } = {}): Promise<{
    success: boolean;
    data?: TransactionStatistics;
    error?: string;
  }> {
    try {
      // Call the PostgreSQL function
      const { data, error } = await supabase
        .rpc('get_transaction_statistics', {
          start_date: filters.startDate,
          end_date: filters.endDate,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && data.length > 0) {
        return { success: true, data: data[0] };
      }

      return {
        success: true,
        data: {
          total_transactions: 0,
          successful_transactions: 0,
          failed_transactions: 0,
          pending_transactions: 0,
          refunded_transactions: 0,
          total_amount: 0,
          success_rate: 0,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get active services
   */
  async getServices(): Promise<{
    success: boolean;
    data?: Service[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.servicesTable)
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(orderId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .update({
          transaction_status: 'cancel',
          cancel_time: new Date().toISOString(),
          processed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      this.logEvent('cancel_transaction', { orderId });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Refund transaction
   */
  async refundTransaction(
    orderId: string,
    refundAmount?: number
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const updateData: any = {
        transaction_status: 'refund',
        refund_time: new Date().toISOString(),
        processed: true,
        updated_at: new Date().toISOString(),
      };

      if (refundAmount) {
        updateData.refund_amount = refundAmount;
      }

      const { data, error } = await supabase
        .from(this.table)
        .update(updateData)
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      this.logEvent('refund_transaction', { orderId, refundAmount });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Process payment notification from payment gateway
   */
  async processNotification(notificationData: any): Promise<{
    success: boolean;
    data?: PaymentTransaction;
    error?: string;
  }> {
    try {
      this.logEvent('process_notification', { orderId: notificationData.order_id });

      // Sanitize notification data
      const sanitizedData = sanitizeNotificationData(notificationData);

      // Update or insert transaction
      const result = await this.updateTransaction(notificationData.order_id, {
        ...sanitizedData,
        transaction_status: notificationData.transaction_status,
        updated_at: new Date().toISOString(),
        processed: true,
      } as any);

      if (result.success) {
        // Log webhook event
        await this.logWebhookEvent(
          notificationData.order_id,
          'notification_processed',
          sanitizedData
        );

        this.logEvent('process_notification_success', { orderId: notificationData.order_id });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logEvent('process_notification_error', { error: errorMessage, orderId: notificationData.order_id });
      return { success: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export const supabasePaymentApi = new SupabasePaymentApi();
export default supabasePaymentApi;
