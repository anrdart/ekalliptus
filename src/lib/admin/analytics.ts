import { getSupabase } from '../supabase'

export type Granularity = 'day' | 'week' | 'month'

export interface DataPoint {
  bucket: string
  value: number
  count?: number
}

function bucketFor(dateISO: string, gran: Granularity): string {
  const d = new Date(dateISO)
  if (gran === 'day') return d.toISOString().slice(0, 10)
  if (gran === 'month') return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  // week: ISO week
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function buildDateBuckets(fromISO: string, toISO: string, gran: Granularity): string[] {
  const from = new Date(fromISO)
  const to = new Date(toISO)
  const out: string[] = []
  const seen = new Set<string>()
  const cursor = new Date(from)
  while (cursor <= to) {
    const b = bucketFor(cursor.toISOString(), gran)
    if (!seen.has(b)) {
      out.push(b)
      seen.add(b)
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return out
}

export interface RevenueParams {
  from: string
  to: string
  granularity: Granularity
}

export async function revenueSeries(params: RevenueParams): Promise<DataPoint[]> {
  const supabase = getSupabase(true)
  if (!supabase) return []
  const { data } = await supabase
    .from('payments')
    .select('amount, paid_at')
    .eq('status', 'paid')
    .gte('paid_at', params.from)
    .lte('paid_at', params.to)

  const buckets = buildDateBuckets(params.from, params.to, params.granularity)
  const map = new Map<string, number>(buckets.map((b) => [b, 0]))
  for (const p of data ?? []) {
    if (!p.paid_at) continue
    const key = bucketFor(p.paid_at, params.granularity)
    map.set(key, (map.get(key) ?? 0) + Number(p.amount))
  }
  return buckets.map((b) => ({ bucket: b, value: map.get(b) ?? 0 }))
}

export interface FunnelStage {
  name: string
  count: number
}

export async function funnelStats(fromISO: string, toISO: string): Promise<FunnelStage[]> {
  const supabase = getSupabase(true)
  if (!supabase) return []

  const [leads, orders, paid] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'paid').gte('paid_at', fromISO).lte('paid_at', toISO)
  ])

  return [
    { name: 'Leads', count: leads.count ?? 0 },
    { name: 'Orders', count: orders.count ?? 0 },
    { name: 'Paid', count: paid.count ?? 0 }
  ]
}

export async function breakdownByService(fromISO: string, toISO: string): Promise<Array<{ name: string; orders: number; revenue: number }>> {
  const supabase = getSupabase(true)
  if (!supabase) return []
  const { data } = await supabase
    .from('orders')
    .select('service_type, pricing')
    .gte('created_at', fromISO)
    .lte('created_at', toISO)

  const m = new Map<string, { orders: number; revenue: number }>()
  for (const o of data ?? []) {
    const cur = m.get(o.service_type) ?? { orders: 0, revenue: 0 }
    cur.orders += 1
    cur.revenue += Number((o.pricing as any)?.grand_total ?? 0)
    m.set(o.service_type, cur)
  }
  return Array.from(m.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue)
}

export async function breakdownByLeadSource(fromISO: string, toISO: string): Promise<Array<{ source: string; count: number }>> {
  const supabase = getSupabase(true)
  if (!supabase) return []
  const { data } = await supabase
    .from('leads')
    .select('source')
    .gte('created_at', fromISO)
    .lte('created_at', toISO)

  const m = new Map<string, number>()
  for (const r of data ?? []) m.set(r.source, (m.get(r.source) ?? 0) + 1)
  return Array.from(m.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count)
}

export interface CustomerBreakdownRow {
  name: string
  whatsapp: string
  customer_id: string  // url-safe encoded for linking
  orders: number
  revenue: number
}

export async function breakdownByCustomer(fromISO: string, toISO: string, limit = 10): Promise<CustomerBreakdownRow[]> {
  const supabase = getSupabase(true)
  if (!supabase) return []

  const { data } = await supabase
    .from('orders')
    .select('customer_name, whatsapp, pricing')
    .gte('created_at', fromISO)
    .lte('created_at', toISO)

  const m = new Map<string, { name: string; orders: number; revenue: number }>()
  for (const o of data ?? []) {
    const key = o.whatsapp
    const cur = m.get(key) ?? { name: o.customer_name, orders: 0, revenue: 0 }
    cur.orders += 1
    cur.revenue += Number((o.pricing as any)?.grand_total ?? 0)
    m.set(key, cur)
  }
  // Encode the customer_id using base64url like in customers.ts
  return Array.from(m.entries())
    .map(([whatsapp, v]) => ({
      name: v.name,
      whatsapp,
      customer_id: Buffer.from(whatsapp, 'utf8').toString('base64url'),
      orders: v.orders,
      revenue: v.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}
