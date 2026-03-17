import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database, Order, OrderInsert, OrderAttachment, OrderAttachmentInsert, ServiceType, OrderStatus } from '~/types/database.types'

export const useSupabase = () => {
    const config = useRuntimeConfig()
    
    const supabaseClient = useState<SupabaseClient<Database> | null>('supabase-client', () => null)

    if (!supabaseClient.value) {
        const supabaseUrl = config.public.supabaseUrl as string
        const supabaseAnonKey = config.public.supabaseAnonKey as string

        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase credentials not configured')
        } else {
            supabaseClient.value = createClient<Database>(supabaseUrl, supabaseAnonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true
                }
            })
        }
    }

    return {
        supabase: supabaseClient.value
    }
}

// Re-export types for convenience
export type { Order, OrderInsert, OrderAttachment, OrderAttachmentInsert, ServiceType, OrderStatus }

// Order service functions
export const useOrderService = () => {
    const { supabase } = useSupabase()

    /**
     * Create a new order with optional attachments
     * Accepts either the new OrderInsert type or legacy format
     */
    const createOrder = async (orderData: OrderInsert | Record<string, any>, attachments?: OrderAttachmentInsert[]): Promise<{ data: Order | null; error: Error | null }> => {
        if (!supabase) {
            return { data: null, error: new Error('Supabase client not initialized') }
        }

        try {
            // Insert order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert(orderData as OrderInsert)
                .select()
                .single()

            if (orderError) {
                console.error('Supabase insert error:', orderError)
                return { data: null, error: new Error(orderError.message) }
            }

            // Insert attachments if provided
            if (attachments && attachments.length > 0 && order) {
                const attachmentsWithOrderId = attachments.map(att => ({
                    ...att,
                    order_id: order.id
                }))

                const { error: attachmentError } = await supabase
                    .from('order_attachments')
                    .insert(attachmentsWithOrderId)

                if (attachmentError) {
                    console.error('Attachment insert error:', attachmentError)
                    // Order was created, but attachments failed - log but don't fail
                }
            }

            return { data: order, error: null }
        } catch (err) {
            console.error('Order creation error:', err)
            return { data: null, error: err as Error }
        }
    }

    /**
     * Get all orders (for admin)
     */
    const getOrders = async (): Promise<{ data: Order[] | null; error: Error | null }> => {
        if (!supabase) {
            return { data: null, error: new Error('Supabase client not initialized') }
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                return { data: null, error: new Error(error.message) }
            }

            return { data, error: null }
        } catch (err) {
            return { data: null, error: err as Error }
        }
    }

    /**
     * Get order by ID with attachments
     */
    const getOrderById = async (id: string): Promise<{ data: (Order & { attachments?: OrderAttachment[] }) | null; error: Error | null }> => {
        if (!supabase) {
            return { data: null, error: new Error('Supabase client not initialized') }
        }

        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single()

            if (orderError) {
                return { data: null, error: new Error(orderError.message) }
            }

            // Get attachments
            const { data: attachments } = await supabase
                .from('order_attachments')
                .select('*')
                .eq('order_id', id)

            return { 
                data: { ...order, attachments: attachments || [] }, 
                error: null 
            }
        } catch (err) {
            return { data: null, error: err as Error }
        }
    }

    /**
     * Update order status
     */
    const updateOrderStatus = async (id: string, status: OrderStatus): Promise<{ data: Order | null; error: Error | null }> => {
        if (!supabase) {
            return { data: null, error: new Error('Supabase client not initialized') }
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id)
                .select()
                .single()

            if (error) {
                return { data: null, error: new Error(error.message) }
            }

            return { data, error: null }
        } catch (err) {
            return { data: null, error: err as Error }
        }
    }

    /**
     * Upload file to Supabase Storage
     */
    const uploadAttachment = async (file: File, orderId: string): Promise<{ data: { path: string; url: string } | null; error: Error | null }> => {
        if (!supabase) {
            return { data: null, error: new Error('Supabase client not initialized') }
        }

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${orderId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            const { data, error } = await supabase.storage
                .from('orders')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                return { data: null, error: new Error(error.message) }
            }

            const { data: urlData } = supabase.storage
                .from('orders')
                .getPublicUrl(data.path)

            return { 
                data: { 
                    path: data.path, 
                    url: urlData.publicUrl 
                }, 
                error: null 
            }
        } catch (err) {
            return { data: null, error: err as Error }
        }
    }

    return {
        createOrder,
        getOrders,
        getOrderById,
        updateOrderStatus,
        uploadAttachment
    }
}

// Voucher service functions
export const useVoucherService = () => {
    const { supabase } = useSupabase()

    /**
     * Validate voucher code
     */
    const validateVoucher = async (code: string, subtotal: number): Promise<{ 
        valid: boolean; 
        discount: number; 
        error: string | null 
    }> => {
        if (!supabase) {
            return { valid: false, discount: 0, error: 'Supabase client not initialized' }
        }

        try {
            const { data: voucher, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('code', code.toUpperCase())
                .eq('is_active', true)
                .single()

            if (error || !voucher) {
                return { valid: false, discount: 0, error: 'Voucher tidak ditemukan' }
            }

            // Check expiry
            if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
                return { valid: false, discount: 0, error: 'Voucher sudah kadaluarsa' }
            }

            // Check usage limit
            if (voucher.max_uses && voucher.used_count >= voucher.max_uses) {
                return { valid: false, discount: 0, error: 'Voucher sudah habis digunakan' }
            }

            // Check minimum spend
            if (voucher.min_spend && subtotal < voucher.min_spend) {
                return { valid: false, discount: 0, error: `Minimum pembelian Rp ${voucher.min_spend.toLocaleString('id-ID')}` }
            }

            // Calculate discount
            let discount = 0
            if (voucher.type === 'percent') {
                discount = Math.floor(subtotal * (Number(voucher.value) / 100))
            } else {
                discount = Number(voucher.value)
            }

            return { valid: true, discount, error: null }
        } catch (err) {
            return { valid: false, discount: 0, error: 'Gagal memvalidasi voucher' }
        }
    }

    return {
        validateVoucher
    }
}
