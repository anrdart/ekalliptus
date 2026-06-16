import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'
import { requireAdmin } from '../../../lib/admin/auth'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard

  const supabase = getSupabase(true)
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 })
  }

  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); sevenDaysAgo.setHours(0,0,0,0)

  const [paidToday, monthlyOrders, pendingPayments, paidPayments, recentOrders, weeklyPayments] = await Promise.all([
    supabase.from('payments').select('amount').eq('status', 'paid').gte('paid_at', todayStart.toISOString()),
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
    supabase.from('payments').select('id', { count: 'exact', head: true }).in('status', ['pending', 'processing']),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'paid').gte('created_at', monthStart.toISOString()),
    supabase.from('orders').select('id, customer_name, service_type, pricing, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('amount, paid_at').eq('status', 'paid').gte('paid_at', sevenDaysAgo.toISOString())
  ])

  const todayRevenue = (paidToday.data ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0)
  const orderCount = monthlyOrders.count ?? 0
  const pending = pendingPayments.count ?? 0
  const paidCount = paidPayments.count ?? 0
  const conversionRate = orderCount > 0 ? `${((paidCount / orderCount) * 100).toFixed(1)}%` : '0%'

  // Build 7-day series
  const buckets = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo); d.setDate(d.getDate() + i)
    buckets.set(d.toISOString().slice(0, 10), 0)
  }
  for (const p of weeklyPayments.data ?? []) {
    const day = String(p.paid_at).slice(0, 10)
    buckets.set(day, (buckets.get(day) ?? 0) + Number(p.amount ?? 0))
  }

  const series = Array.from(buckets.entries()).map(([day, value]) => ({ day, value }))

  // Top services aggregated this month
  const { data: monthOrders } = await supabase
    .from('orders')
    .select('service_type, pricing')
    .gte('created_at', monthStart.toISOString())

  const svcMap = new Map<string, { orders: number; revenue: number }>()
  for (const o of monthOrders ?? []) {
    const cur = svcMap.get(o.service_type) ?? { orders: 0, revenue: 0 }
    cur.orders += 1
    cur.revenue += Number((o.pricing as any)?.grand_total ?? 0)
    svcMap.set(o.service_type, cur)
  }
  const topServices = Array.from(svcMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return new Response(JSON.stringify({
    stats: {
      todayRevenue: formatCurrency(todayRevenue),
      monthlyOrders: String(orderCount),
      pendingPayments: String(pending),
      conversionRate
    },
    series,
    recentOrders: recentOrders.data ?? [],
    topServices
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
