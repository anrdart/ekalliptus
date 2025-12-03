/**
 * Supabase Payment API Service for ekalliptus project
 * Handles all order and payment-related database operations with Supabase
 * Project: ekalliptus (ID: muyzxygtlwsfegzyvgcm)
 * 
 * This service matches the actual Supabase schema defined in database.types.ts
 */

import { supabase } from '@/config/supabase';
import type { 
  Order, 
  OrderInsert, 
  PaymentTransaction, 
  PaymentTransactionInsert,
  ServiceType,
  OrderStatus 
} from '@/lib/database.types';
import { calculateAllAmounts } from '@/lib/order/calculator';
import { toServiceType } from './orderService';

export interface OrderFormPayload {
  customer_name: string;
  email?: string;
  whatsapp: string;
  company?: string;
  service_type: string;
  urgency?: 'normal' | 'express' | 'priority';
  scope: Record<string, unknown>;
  delivery_method?: 'pickup' | 'ship';
  schedule_date?: string;
  schedule_time?: string;
  shipping_cost?: number;
  voucher_code?: string;
  subtotal: number;
  discount?: number;
  fee?: number;
}

export interface CreateTransactionPayload {
  order_id: string;
  amount: number;
  type: 'dp' | 'full' | 'onsite' | 'refund';
  method: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

class SupabasePaymentApi {
  /**
   * Create a new order in the database
   * Maps form data to the actual Supabase orders table schema
   */
  async createOrUpdateOrder(payload: OrderFormPayload & { order_id?: string }): Promise<{
    success: boolean;
    data?: Order;
    error?: string;
  }> {
    try {
      // Map service name to service_type enum
      const serviceType = toServiceType(payload.service_type);
      
      // Calculate all amounts using the calculator
      const amounts = calculateAllAmounts({
        subtotal: payload.subtotal || 0,
        discount: payload.discount || 0,
        fee: payload.fee || 0,
        shippingCost: payload.shipping_cost || 0,
        serviceType,
      });

      // Prepare order data matching the actual schema
      const orderData: OrderInsert = {
        user_id: null, // Anonymous orders (nullable)
        customer_name: payload.customer_name,
        whatsapp: payload.whatsapp.replace(/\D/g, ''), // Clean phone number
        email: payload.email || null,
        company: payload.company || null,
        service_type: serviceType,
        urgency: payload.urgency || 'normal',
        scope: payload.scope,
        delivery_method: payload.delivery_method || 'pickup',
        schedule_date: payload.schedule_date || new Date().toISOString().split('T')[0],
        schedule_time: payload.schedule_time || '10:00',
        shipping_cost: amounts.shipping_cost,
        voucher_code: payload.voucher_code || null,
        subtotal: amounts.subtotal,
        discount: amounts.discount,
        dpp: amounts.dpp,
        ppn: amounts.ppn,
        fee: amounts.fee,
        grand_total: amounts.grand_total,
        deposit: amounts.deposit,
        remaining: amounts.remaining,
        status: amounts.status,
      };

      // Insert new order
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('Order creation error:', error);
        return { success: false, error: error.message };
      }

      console.log('Order created successfully:', data.id);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Order creation exception:', errorMessage);
      return { success: false, error: errorMessage };
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
        .from('orders')
        .select('*')
        .eq('id', orderId)
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
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{
    success: boolean;
    data?: Order;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
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
   * Create a payment transaction
   */
  async createTransaction(payload: CreateTransactionPayload): Promise<{
    success: boolean;
    data?: PaymentTransaction;
    error?: string;
  }> {
    try {
      const transactionData: PaymentTransactionInsert = {
        order_id: payload.order_id,
        amount: payload.amount,
        type: payload.type,
        method: payload.method,
        reference: payload.reference || null,
        status: 'pending',
        gateway_response: payload.metadata || null,
      };

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Transaction creation error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Transaction creation exception:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get transaction by order ID
   */
  async getTransactionByOrderId(orderId: string): Promise<{
    success: boolean;
    data?: PaymentTransaction;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
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
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string, 
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    completedAt?: string
  ): Promise<{
    success: boolean;
    data?: PaymentTransaction;
    error?: string;
  }> {
    try {
      const updateData: Record<string, unknown> = { status };
      if (completedAt) {
        updateData.completed_at = completedAt;
      }

      const { data, error } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('id', transactionId)
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
   * Legacy method for backward compatibility
   * Maps old payload format to new format
   */
  async createOrUpdateCustomer(_customerData: Record<string, unknown>): Promise<{
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
  }> {
    // Customer data is now stored directly in the orders table
    // This method is kept for backward compatibility but does nothing
    console.log('createOrUpdateCustomer: Customer data is stored in orders table');
    return { success: true, data: _customerData };
  }
}

// Export singleton instance
export const supabasePaymentApi = new SupabasePaymentApi();
export default supabasePaymentApi;
