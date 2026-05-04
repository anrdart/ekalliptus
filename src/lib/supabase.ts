import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database, Order, OrderInsert, OrderAttachment, OrderAttachmentInsert, ServiceType, OrderStatus } from '../types/database'

let supabaseClient: SupabaseClient<Database> | null = null
let supabaseAdminClient: SupabaseClient<Database> | null = null

export function getSupabase(useServiceRole = false): SupabaseClient<Database> | null {
  const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured')
    return null
  }

  if (useServiceRole) {
    if (!supabaseServiceRoleKey) {
      console.warn('Supabase service role key not configured')
      return null
    }

    if (!supabaseAdminClient) {
      supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    }

    return supabaseAdminClient
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  }

  return supabaseClient
}

export type { Order, OrderInsert, OrderAttachment, OrderAttachmentInsert, ServiceType, OrderStatus }

export async function createOrder(orderData: OrderInsert, attachments?: OrderAttachmentInsert[]): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = getSupabase()
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase client not initialized') }
  }

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Supabase insert error:', orderError)
      return { data: null, error: new Error(orderError.message) }
    }

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
      }
    }

    return { data: order, error: null }
  } catch (err) {
    console.error('Order creation error:', err)
    return { data: null, error: err as Error }
  }
}

export async function getOrderById(id: string): Promise<{ data: (Order & { attachments?: OrderAttachment[] }) | null; error: Error | null }> {
  const supabase = getSupabase()
  
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

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = getSupabase()
  
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

export async function uploadAttachment(file: File, orderId: string): Promise<{ data: { path: string; url: string } | null; error: Error | null }> {
  const supabase = getSupabase()
  
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

export async function validateVoucher(code: string, subtotal: number): Promise<{ 
  valid: boolean; 
  discount: number; 
  error: string | null 
}> {
  const supabase = getSupabase()
  
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

    if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
      return { valid: false, discount: 0, error: 'Voucher sudah kadaluarsa' }
    }

    if (voucher.max_uses && voucher.used_count >= voucher.max_uses) {
      return { valid: false, discount: 0, error: 'Voucher sudah habis digunakan' }
    }

    if (voucher.min_spend && subtotal < voucher.min_spend) {
      return { valid: false, discount: 0, error: `Minimum pembelian Rp ${voucher.min_spend.toLocaleString('id-ID')}` }
    }

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

// Blog-related types and helpers
export function normalizeBlogImage(img: string | null | undefined): string {
  if (!img || typeof img !== 'string') return '/blog/placeholder.svg'
  const trimmed = img.trim()
  if (!trimmed) return '/blog/placeholder.svg'
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed
  }
  return `/blog/${trimmed.replace(/^blog\//, '')}`
}

export interface BlogPost {
  id: string
  slug: string
  locale: string
  title: string
  description: string
  body_html: string
  publish_date: string
  update_date: string | null
  category: string
  tags: string[]
  author: string
  image: string | null
  image_alt: string | null
  featured: boolean
  seo_meta_title: string | null
  seo_meta_description: string | null
  seo_noindex: boolean | null
  status: string
  created_at: string
  updated_at: string
}

export type BlogPostFlat = BlogPost

export async function fetchPublishedPosts(locale?: string): Promise<BlogPost[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const builder = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
  if (locale) {
    builder.filter('locale', 'eq', locale)
  }
  const { data, error } = await builder.order('publish_date', { ascending: false })
  if (error) {
    console.error('fetchPublishedPosts error:', error)
    return []
  }

  const posts = (data || []) as unknown as BlogPost[]
  // Normalize data shape if necessary and ensure required fields exist
  return posts.map(p => ({
    id: p.slug,
    slug: p.slug,
    locale: p.locale,
    title: p.title,
    description: p.description,
    body_html: p.body_html,
    publish_date: p.publish_date,
    update_date: p.update_date,
    category: p.category,
    tags: p.tags ?? [],
    author: p.author,
    image: p.image ?? null,
    image_alt: p.image_alt ?? null,
    featured: p.featured ?? false,
    seo_meta_title: p.seo_meta_title ?? null,
    seo_meta_description: p.seo_meta_description ?? null,
    seo_noindex: p.seo_noindex ?? null,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }))
}

export async function fetchPostBySlug(slug: string, locale: string): Promise<BlogPost | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    console.error('fetchPostBySlug error:', error)
    return null
  }

  const p = data as BlogPost
  // Normalize to include id as slug for linking, per requirement
  return {
    id: p.slug,
    slug: p.slug,
    locale: p.locale,
    title: p.title,
    description: p.description,
    body_html: p.body_html,
    publish_date: p.publish_date,
    update_date: p.update_date,
    category: p.category,
    tags: p.tags ?? [],
    author: p.author,
    image: p.image ?? null,
    image_alt: p.image_alt ?? null,
    featured: p.featured ?? false,
    seo_meta_title: p.seo_meta_title ?? null,
    seo_meta_description: p.seo_meta_description ?? null,
    seo_noindex: p.seo_noindex ?? null,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

export async function fetchPostsByTag(tag: string, locale: string = 'id'): Promise<BlogPost[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('locale', locale)
    .contains('tags', [tag])
    .order('publish_date', { ascending: false })

  if (error) {
    console.error('fetchPostsByTag error:', error)
    return []
  }

  return (data || []).map((p: any) => ({
    id: p.slug,
    slug: p.slug,
    locale: p.locale,
    title: p.title,
    description: p.description,
    body_html: p.body_html,
    publish_date: p.publish_date,
    update_date: p.update_date,
    category: p.category,
    tags: p.tags ?? [],
    author: p.author,
    image: p.image ?? null,
    image_alt: p.image_alt ?? null,
    featured: p.featured ?? false,
    seo_meta_title: p.seo_meta_title ?? null,
    seo_meta_description: p.seo_meta_description ?? null,
    seo_noindex: p.seo_noindex ?? null,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }))
}
