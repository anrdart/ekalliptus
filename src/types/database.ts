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
      blog_posts: {
        Row: {
          author: string | null
          body_html: string | null
          category: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image: string | null
          image_alt: string | null
          locale: string
          publish_date: string | null
          seo_meta_description: string | null
          seo_meta_title: string | null
          seo_noindex: boolean
          slug: string
          status: Database['public']['Enums']['blog_post_status']
          tags: string[]
          title: string
          update_date: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          body_html?: string | null
          category?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          image?: string | null
          image_alt?: string | null
          locale: string
          publish_date?: string | null
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          seo_noindex?: boolean
          slug: string
          status?: Database['public']['Enums']['blog_post_status']
          tags?: string[]
          title: string
          update_date?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          body_html?: string | null
          category?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          image?: string | null
          image_alt?: string | null
          locale?: string
          publish_date?: string | null
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          seo_noindex?: boolean
          slug?: string
          status?: Database['public']['Enums']['blog_post_status']
          tags?: string[]
          title?: string
          update_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          meeting_link: string | null
          notes: string | null
          order_id: string | null
          payment_id: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          session_id: string | null
          status: Database['public']['Enums']['consultation_status']
          unread_count: number
          updated_at: string
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          meeting_link?: string | null
          notes?: string | null
          order_id?: string | null
          payment_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          session_id?: string | null
          status?: Database['public']['Enums']['consultation_status']
          unread_count?: number
          updated_at?: string
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          meeting_link?: string | null
          notes?: string | null
          order_id?: string | null
          payment_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          session_id?: string | null
          status?: Database['public']['Enums']['consultation_status']
          unread_count?: number
          updated_at?: string
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean
          sender_name: string | null
          sender_type: 'visitor' | 'bot' | 'admin'
          session_id: string | null
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_name?: string | null
          sender_type: 'visitor' | 'bot' | 'admin'
          session_id?: string | null
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_name?: string | null
          sender_type?: 'visitor' | 'bot' | 'admin'
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
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
      orders: {
        Row: {
          company: string | null
          consultation_required: boolean
          created_at: string
          customer_name: string
          delivery_method: Database['public']['Enums']['delivery_method']
          email: string | null
          id: string
          payment_option: string | null
          pricing: Json
          schedule_date: string
          schedule_time: string
          scope: Json
          service_type: Database['public']['Enums']['service_type']
          status: Database['public']['Enums']['order_status']
          urgency: Database['public']['Enums']['urgency_level']
          user_id: string | null
          voucher_code: string | null
          whatsapp: string
        }
        Insert: {
          company?: string | null
          consultation_required?: boolean
          created_at?: string
          customer_name: string
          delivery_method?: Database['public']['Enums']['delivery_method']
          email?: string | null
          id?: string
          payment_option?: string | null
          pricing: Json
          schedule_date: string
          schedule_time: string
          scope: Json
          service_type: Database['public']['Enums']['service_type']
          status?: Database['public']['Enums']['order_status']
          urgency?: Database['public']['Enums']['urgency_level']
          user_id?: string | null
          voucher_code?: string | null
          whatsapp: string
        }
        Update: {
          company?: string | null
          consultation_required?: boolean
          created_at?: string
          customer_name?: string
          delivery_method?: Database['public']['Enums']['delivery_method']
          email?: string | null
          id?: string
          payment_option?: string | null
          pricing?: Json
          schedule_date?: string
          schedule_time?: string
          scope?: Json
          service_type?: Database['public']['Enums']['service_type']
          status?: Database['public']['Enums']['order_status']
          urgency?: Database['public']['Enums']['urgency_level']
          user_id?: string | null
          voucher_code?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          fee_flat: number
          fee_percent: number
          id: string
          is_active: boolean
          name: Database['public']['Enums']['payment_gateway']
          priority: number
          supports_qr: boolean
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          display_name: string
          fee_flat?: number
          fee_percent?: number
          id?: string
          is_active?: boolean
          name: Database['public']['Enums']['payment_gateway']
          priority?: number
          supports_qr?: boolean
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          fee_flat?: number
          fee_percent?: number
          id?: string
          is_active?: boolean
          name?: Database['public']['Enums']['payment_gateway']
          priority?: number
          supports_qr?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          gateway: Database['public']['Enums']['payment_gateway']
          gateway_transaction_id: string | null
          id: string
          metadata: Json
          order_id: string
          paid_at: string | null
          payment_type: Database['public']['Enums']['payment_type']
          payment_url: string | null
          qr_string: string | null
          status: Database['public']['Enums']['payment_status']
          updated_at: string
          webhook_received_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          gateway: Database['public']['Enums']['payment_gateway']
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json
          order_id: string
          paid_at?: string | null
          payment_type: Database['public']['Enums']['payment_type']
          payment_url?: string | null
          qr_string?: string | null
          status?: Database['public']['Enums']['payment_status']
          updated_at?: string
          webhook_received_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          gateway?: Database['public']['Enums']['payment_gateway']
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json
          order_id?: string
          paid_at?: string | null
          payment_type?: Database['public']['Enums']['payment_type']
          payment_url?: string | null
          qr_string?: string | null
          status?: Database['public']['Enums']['payment_status']
          updated_at?: string
          webhook_received_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
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
      [_ in never]: never
    }
    Enums: {
      blog_post_status: 'draft' | 'published' | 'archived'
      consultation_status: 'scheduled' | 'completed' | 'cancelled'
      delivery_method: 'pickup' | 'delivery'
      order_status: 'waiting_dp' | 'dp_paid' | 'waiting_onsite_payment' | 'onsite_paid' | 'cancelled'
      payment_gateway: 'midtrans' | 'pakasir' | 'qiospay' | 'sanpay' | 'tripay'
      payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'refunded'
      payment_type: 'full' | 'dp' | 'remaining'
      service_type: 'website' | 'wordpress' | 'mobile' | 'editing' | 'service_device'
      urgency_level: 'normal' | 'express' | 'priority'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Order = Tables<'orders'>
export type OrderInsert = TablesInsert<'orders'>
export type OrderUpdate = TablesUpdate<'orders'>

export type OrderAttachment = Tables<'order_attachments'>
export type OrderAttachmentInsert = TablesInsert<'order_attachments'>

export type Payment = Tables<'payments'>
export type PaymentInsert = TablesInsert<'payments'>
export type PaymentUpdate = TablesUpdate<'payments'>

export type PaymentGatewayConfig = Tables<'payment_gateways'>
export type PaymentGatewayConfigInsert = TablesInsert<'payment_gateways'>
export type PaymentGatewayConfigUpdate = TablesUpdate<'payment_gateways'>

export type Consultation = Tables<'consultations'>
export type ConsultationInsert = TablesInsert<'consultations'>
export type ConsultationUpdate = TablesUpdate<'consultations'>

export type ConsultationMessage = Tables<'consultation_messages'>
export type ConsultationMessageInsert = TablesInsert<'consultation_messages'>
export type ConsultationMessageUpdate = TablesUpdate<'consultation_messages'>

export type BlogPost = Tables<'blog_posts'>
export type BlogPostInsert = TablesInsert<'blog_posts'>
export type BlogPostUpdate = TablesUpdate<'blog_posts'>

export type Voucher = Tables<'vouchers'>
export type VoucherInsert = TablesInsert<'vouchers'>

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>

export type AuditLog = Tables<'audit_logs'>
export type AuditLogInsert = TablesInsert<'audit_logs'>

export type ServiceType = Database['public']['Enums']['service_type']
export type OrderStatus = Database['public']['Enums']['order_status']
export type Urgency = Database['public']['Enums']['urgency_level']
export type PaymentGateway = Database['public']['Enums']['payment_gateway']
export type PaymentStatus = Database['public']['Enums']['payment_status']
export type PaymentType = Database['public']['Enums']['payment_type']
export type ConsultationStatus = Database['public']['Enums']['consultation_status']
export type DeliveryMethod = Database['public']['Enums']['delivery_method']
export type BlogPostStatus = Database['public']['Enums']['blog_post_status']
export type UserRole = 'owner' | 'admin' | 'finance' | 'cs' | 'tech' | 'editor'
export type VoucherType = 'percent' | 'nominal'
