import { createClient } from '@supabase/supabase-js';

// Supabase configuration for ekalliptus project
export const SUPABASE_CONFIG = {
  // URLs - Always read from environment variables
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,

  // Auth configuration
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },

  // Database configuration
  db: {
    schema: 'public',
  },

  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Create Supabase client instance
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: SUPABASE_CONFIG.auth,
  db: SUPABASE_CONFIG.db,
  realtime: SUPABASE_CONFIG.realtime,
});

// Database schema types
export interface Database {
  public: {
    Tables: {
      payment_transactions: {
        Row: {
          id: string;
          order_id: string;
          transaction_id: string | null;
          gross_amount: number;
          payment_type: string;
          transaction_status: string;
          transaction_time: string;
          fraud_status: string | null;
          signature_key: string | null;
          payment_code: string | null;
          approval_code: string | null;
          bank: string | null;
          va_number: string | null;
          bill_key: string | null;
          biller_code: string | null;
          retailer_name: string | null;
          permata_va_number: string | null;
          bca_va_number: string | null;
          bni_va_number: string | null;
          bri_va_number: string | null;
          cimb_va_number: string | null;
          other_va_number: string | null;
          echannel_bill_key: string | null;
          echannel_biller_code: string | null;
          shopeepay_reference: string | null;
          qr_string: string | null;
          acquirer: string | null;
          issuer: string | null;
          card_type: string | null;
          masked_card: string | null;
          three_ds_secure: string | null;
          eci: string | null;
          saved_token_id: string | null;
          saved_token_id_expired_at: string | null;
          point_redeem_amount: string | null;
          point_redeem_quantity: string | null;
          points: string | null;
          installment_term: string | null;
          bin: string | null;
          last_4digit: string | null;
          expiry_date: string | null;
          card_number: string | null;
          cardholder_name: string | null;
          card_token: string | null;
          card_token_expired_at: string | null;
          status_code: string | null;
          status_message: string | null;
          settlement_time: string | null;
          expiry_time: string | null;
          cancel_time: string | null;
          refund_time: string | null;
          refund_amount: string | null;
          custom_field1: string | null;
          custom_field2: string | null;
          custom_field3: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
          retry_count: number;
          last_retry_at: string | null;
          processed: boolean;
        };
        Insert: Omit<Database['public']['Tables']['payment_transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payment_transactions']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_id: string;
          customer_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          service_id: string | null;
          service_name: string;
          service_price: number;
          quantity: number;
          subtotal: number;
          fees: number;
          total: number;
          currency: string;
          payment_status: string;
          payment_transaction_id: string | null;
          attachment_meta: Record<string, any> | null;
          submission_summary: Record<string, any> | null;
          custom_field1: string | null;
          custom_field2: string | null;
          custom_field3: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string | null;
          phone: string | null;
          billing_address: Record<string, any> | null;
          shipping_address: Record<string, any> | null;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          service_id: string;
          name: string;
          description: string | null;
          base_price: number;
          currency: string;
          active: boolean;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      webhook_logs: {
        Row: {
          id: string;
          order_id: string;
          event_type: string;
          payload: Record<string, any>;
          processed: boolean;
          processing_time_ms: number | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['webhook_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['webhook_logs']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      transaction_status: 'pending' | 'capture' | 'settlement' | 'deny' | 'cancel' | 'expire' | 'refund' | 'partial_refund';
      payment_type: 'credit_card' | 'bank_transfer' | 'gopay' | 'shopeepay' | 'ovo' | 'dana' | 'linkaja' | 'akulaku' | 'bcaklikpay' | 'cimbclicks' | 'danamon' | 'bii' | 'permatava' | 'briva' | 'mandiriva' | 'other';
    };
  };
};

// Helper function to get table
export const getTable = <T extends keyof Database['public']['Tables']>(
  tableName: T
): Database['public']['Tables'][T]['Row'][] => {
  return [] as unknown as Database['public']['Tables'][T]['Row'][];
};

// Helper function for admin operations (server-side only)
export const getAdminClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client can only be used on the server side');
  }
  // In a real implementation, this would use the service role key
  // For security, the service role key should only be used in secure server environments
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(SUPABASE_CONFIG.url, serviceRoleKey);
};

export default supabase;
