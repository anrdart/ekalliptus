import { getSupabase } from '../supabase'

export interface NotificationCounts {
  newOrders: number
  pendingPayments: number
  newConsultations: number
  overdueActivities: number
  total: number
}

export async function getNotificationCounts(sinceISO: string | null): Promise<NotificationCounts> {
  const supabase = getSupabase(true)
  if (!supabase) {
    return { newOrders: 0, pendingPayments: 0, newConsultations: 0, overdueActivities: 0, total: 0 }
  }
  const since = sinceISO ?? new Date(Date.now() - 24 * 3600_000).toISOString()
  const nowISO = new Date().toISOString()

  const [orders, payments, cons, acts] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('payments').select('id', { count: 'exact', head: true }).in('status', ['pending', 'processing']),
    supabase.from('consultations').select('id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('activities').select('id', { count: 'exact', head: true }).eq('is_completed', false).lt('due_date', nowISO)
  ])

  const newOrders = orders.count ?? 0
  const pendingPayments = payments.count ?? 0
  const newConsultations = cons.count ?? 0
  const overdueActivities = acts.count ?? 0
  return {
    newOrders,
    pendingPayments,
    newConsultations,
    overdueActivities,
    total: newOrders + pendingPayments + newConsultations + overdueActivities
  }
}
