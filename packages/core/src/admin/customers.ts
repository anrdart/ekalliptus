import { getSupabase } from '../supabase'
import type { Order, ServiceType } from '../types'

export interface CustomerSummary {
  id: string                    // url-safe encoded whatsapp
  whatsapp: string
  customer_name: string
  email: string | null
  company: string | null
  total_orders: number
  total_spent: number
  last_order_at: string | null
  primary_service: string | null
}

export interface CustomerDetail extends CustomerSummary {
  orders: Order[]
  consultations: any[]
  payments: any[]
}

export function encodeCustomerId(whatsapp: string): string | null {
  if (!whatsapp) return null
  return Buffer.from(whatsapp, 'utf8').toString('base64url')
}

export function decodeCustomerId(id: string): string | null {
  if (!id) return null
  try {
    return Buffer.from(id, 'base64url').toString('utf8')
  } catch {
    return null
  }
}

export interface ListCustomersParams {
  search?: string
  service?: string
  sort?: 'recent' | 'spend' | 'orders'
  page?: number
  pageSize?: number
}

export interface ListCustomersResult {
  customers: CustomerSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function listCustomers(params: ListCustomersParams = {}): Promise<ListCustomersResult> {
  const { search, service, sort = 'recent', page = 1, pageSize = 20 } = params
  const supabase = getSupabase(true)
  if (!supabase) {
    return { customers: [], total: 0, page, pageSize, totalPages: 0 }
  }

  let query = supabase.from('orders').select('*')
  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,email.ilike.%${search}%,whatsapp.ilike.%${search}%`)
  }
  if (service) {
    query = query.eq('service_type', service as ServiceType)
  }
  const { data: rows, error } = await query
  if (error || !rows) {
    return { customers: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const map = new Map<string, CustomerSummary>()
  for (const row of rows) {
    const key = row.whatsapp
    const existing = map.get(key)
    const grandTotal = Number((row.pricing as any)?.grand_total ?? 0)
    if (!existing) {
      map.set(key, {
        id: encodeCustomerId(key)!,
        whatsapp: key,
        customer_name: row.customer_name,
        email: row.email,
        company: row.company,
        total_orders: 1,
        total_spent: grandTotal,
        last_order_at: row.created_at,
        primary_service: row.service_type
      })
    } else {
      existing.total_orders += 1
      existing.total_spent += grandTotal
      if (!existing.last_order_at || row.created_at > existing.last_order_at) {
        existing.last_order_at = row.created_at
      }
    }
  }

  let customers = Array.from(map.values())
  if (sort === 'spend') customers.sort((a, b) => b.total_spent - a.total_spent)
  else if (sort === 'orders') customers.sort((a, b) => b.total_orders - a.total_orders)
  else customers.sort((a, b) => (b.last_order_at ?? '').localeCompare(a.last_order_at ?? ''))

  const total = customers.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const paged = customers.slice(start, start + pageSize)

  return { customers: paged, total, page, pageSize, totalPages }
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const whatsapp = decodeCustomerId(id)
  if (!whatsapp) return null
  const supabase = getSupabase(true)
  if (!supabase) return null

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('whatsapp', whatsapp)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) return null

  const orderIds = orders.map((o) => o.id)
  const [{ data: payments }, { data: consultations }] = await Promise.all([
    supabase.from('payments').select('*').in('order_id', orderIds),
    supabase.from('consultations').select('*').in('order_id', orderIds)
  ])

  const totalSpent = orders.reduce((sum, o) => sum + Number((o.pricing as any)?.grand_total ?? 0), 0)
  const latest = orders[0]

  return {
    id,
    whatsapp,
    customer_name: latest.customer_name,
    email: latest.email,
    company: latest.company,
    total_orders: orders.length,
    total_spent: totalSpent,
    last_order_at: latest.created_at,
    primary_service: latest.service_type,
    orders,
    payments: payments ?? [],
    consultations: consultations ?? []
  }
}
