import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount)

const emptyStats = {
  todayRevenue: formatCurrency(0),
  monthlyOrders: '0',
  pendingPayments: '0',
  conversionRate: '0%'
}

export const GET: APIRoute = async () => {
  try {
    const supabase = getSupabase(true)

    if (!supabase) {
      return new Response(JSON.stringify({ stats: emptyStats }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      paidTodayResult,
      monthlyOrdersResult,
      pendingPaymentsResult,
      paidPaymentsResult
    ] = await Promise.all([
      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .gte('paid_at', todayStart.toISOString()),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString()),
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'processing']),
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'paid')
        .gte('created_at', monthStart.toISOString())
    ])

    const todayRevenue = (paidTodayResult.data || []).reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    )
    const monthlyOrders = monthlyOrdersResult.count || 0
    const pendingPayments = pendingPaymentsResult.count || 0
    const paidPayments = paidPaymentsResult.count || 0
    const conversionRate = monthlyOrders > 0
      ? `${((paidPayments / monthlyOrders) * 100).toFixed(1)}%`
      : '0%'

    return new Response(JSON.stringify({
      stats: {
        todayRevenue: formatCurrency(todayRevenue),
        monthlyOrders: String(monthlyOrders),
        pendingPayments: String(pendingPayments),
        conversionRate
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return new Response(JSON.stringify({ stats: emptyStats }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
