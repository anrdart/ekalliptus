/**
 * Supabase Database Types
 * Auto-generated from Supabase schema for ekalliptus project
 * Project ID: muyzxygtlwsfegzyvgcm
 * 
 * To regenerate: Use Supabase MCP or CLI to generate types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_attachments: {
        Row: {
          bucket: string
          content_type: string | null
          created_at: string
          filename: string
          id: string
          order_id: string
          path: string
          size: number
        }
        Insert: {
          bucket?: string
          content_type?: string | null
          created_at?: string
          filename: string
          id?: string
          order_id: string
          path: string
          size: number
        }
        Update: {
          bucket?: string
          content_type?: string | null
          created_at?: string
          filename?: string
          id?: string
          order_id?: string
          path?: string
          size?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_attachments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          line_total: number
          name: string
          order_id: string
          qty: number
          unit_price: number
        }
        Insert: {
          id?: string
          line_total: number
          name: string
          order_id: string
          qty: number
          unit_price: number
        }
        Update: {
          id?: string
          line_total?: number
          name?: string
          order_id?: string
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_stats_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          result: Json
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at: string
          result: Json
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          result?: Json
        }
        Relationships: []
      }
      orders: {
        Row: {
          company: string | null
          created_at: string
          customer_name: string
          delivery_method: string
          deposit: number
          discount: number
          dpp: number
          email: string | null
          fee: number
          grand_total: number
          id: string
          payment_ref: string | null
          payment_url: string | null
          ppn: number
          remaining: number
          schedule_date: string
          schedule_time: string
          scope: Json
          service_type: string
          shipping_cost: number
          status: string
          subtotal: number
          urgency: string
          user_id: string | null
          voucher_code: string | null
          whatsapp: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          customer_name: string
          delivery_method: string
          deposit: number
          discount?: number
          dpp: number
          email?: string | null
          fee?: number
          grand_total: number
          id?: string
          payment_ref?: string | null
          payment_url?: string | null
          ppn: number
          remaining: number
          schedule_date: string
          schedule_time: string
          scope: Json
          service_type: string
          shipping_cost?: number
          status?: string
          subtotal: number
          urgency?: string
          user_id?: string | null
          voucher_code?: string | null
          whatsapp: string
        }
        Update: {
          company?: string | null
          created_at?: string
          customer_name?: string
          delivery_method?: string
          deposit?: number
          discount?: number
          dpp?: number
          email?: string | null
          fee?: number
          grand_total?: number
          id?: string
          payment_ref?: string | null
          payment_url?: string | null
          ppn?: number
          remaining?: number
          schedule_date?: string
          schedule_time?: string
          scope?: Json
          service_type?: string
          shipping_cost?: number
          status?: string
          subtotal?: number
          urgency?: string
          user_id?: string | null
          voucher_code?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          gateway_response: Json | null
          id: string
          method: string
          order_id: string
          reference: string | null
          status: string
          type: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          gateway_response?: Json | null
          id?: string
          method: string
          order_id: string
          reference?: string | null
          status?: string
          type: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          gateway_response?: Json | null
          id?: string
          method?: string
          order_id?: string
          reference?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string
          email: string
          role: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name: string
          email: string
          role?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string
          email?: string
          role?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          code: string
          created_at: string
          is_active: boolean
          max_uses: number | null
          min_spend: number | null
          type: string
          used_count: number
          valid_until: string | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          is_active?: boolean
          max_uses?: number | null
          min_spend?: number | null
          type: string
          used_count?: number
          valid_until?: string | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          is_active?: boolean
          max_uses?: number | null
          min_spend?: number | null
          type?: string
          used_count?: number
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_update_order_status: {
        Args: {
          p_new_status: string
          p_order_ids: string[]
          p_updated_by?: string
        }
        Returns: {
          error_message: string
          result_order_id: string
          success: boolean
        }[]
      }
      cleanup_expired_cache: { Args: Record<string, never>; Returns: undefined }
      create_order_with_attachments: {
        Args: {
          p_attachments?: Json
          p_company: string
          p_customer_name: string
          p_delivery_method: string
          p_deposit: number
          p_discount: number
          p_dpp: number
          p_email: string
          p_fee: number
          p_grand_total: number
          p_ppn: number
          p_remaining: number
          p_schedule_date: string
          p_schedule_time: string
          p_scope: Json
          p_service_type: string
          p_shipping_cost: number
          p_status?: string
          p_subtotal: number
          p_urgency: string
          p_user_id: string
          p_voucher_code: string
          p_whatsapp: string
        }
        Returns: string
      }
      get_transaction_statistics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          failed_transactions: number
          pending_transactions: number
          refunded_transactions: number
          success_rate: number
          successful_transactions: number
          total_amount: number
          total_transactions: number
        }[]
      }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      log_sensitive_data_access: {
        Args: { operation: string; record_id: string; table_name: string }
        Returns: undefined
      }
      log_webhook_event: {
        Args: { p_event_type: string; p_order_id: string; p_payload: Json }
        Returns: string
      }
      sanitize_payment_data: { Args: { payment_data: Json }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> = 
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = 
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = 
  DefaultSchema["Tables"][T]["Update"]

// Convenience type aliases
export type Order = Tables<"orders">
export type OrderInsert = TablesInsert<"orders">
export type OrderUpdate = TablesUpdate<"orders">

export type OrderItem = Tables<"order_items">
export type OrderItemInsert = TablesInsert<"order_items">

export type OrderAttachment = Tables<"order_attachments">
export type OrderAttachmentInsert = TablesInsert<"order_attachments">

export type Voucher = Tables<"vouchers">
export type VoucherInsert = TablesInsert<"vouchers">

export type Profile = Tables<"profiles">
export type ProfileInsert = TablesInsert<"profiles">

export type PaymentTransaction = Tables<"payment_transactions">
export type PaymentTransactionInsert = TablesInsert<"payment_transactions">

export type AuditLog = Tables<"audit_logs">

// Service type enum
export type ServiceType = 'website' | 'wordpress' | 'mobile' | 'editing' | 'service_device'

// Urgency enum
export type Urgency = 'normal' | 'express' | 'priority'

// Order status enum
export type OrderStatus = 'waiting_dp' | 'dp_paid' | 'waiting_onsite_payment' | 'onsite_paid' | 'cancelled'

// Delivery method enum
export type DeliveryMethod = 'pickup' | 'ship'

// Voucher type enum
export type VoucherType = 'percent' | 'nominal'

// Payment transaction type enum
export type PaymentType = 'dp' | 'full' | 'onsite' | 'refund'

// Payment status enum
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

// Profile role enum
export type ProfileRole = 'owner' | 'admin' | 'finance' | 'cs' | 'tech' | 'editor'
