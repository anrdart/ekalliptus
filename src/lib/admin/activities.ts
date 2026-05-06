import { getSupabase } from '../supabase'
import type { Activity, ActivityInsert, ActivityUpdate } from '../../types/database'

export type ActivityFilter = 'today' | 'overdue' | 'upcoming' | 'completed' | 'all'

export async function listActivities(filter: ActivityFilter = 'all'): Promise<Activity[]> {
  const supabase = getSupabase(true)
  if (!supabase) return []
  let q = supabase.from('activities').select('*').order('due_date', { ascending: true, nullsFirst: false })

  const now = new Date()
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

  if (filter === 'today') {
    q = q.eq('is_completed', false).gte('due_date', now.toISOString().slice(0, 10)).lte('due_date', todayEnd.toISOString())
  } else if (filter === 'overdue') {
    q = q.eq('is_completed', false).lt('due_date', now.toISOString())
  } else if (filter === 'upcoming') {
    q = q.eq('is_completed', false).gt('due_date', todayEnd.toISOString())
  } else if (filter === 'completed') {
    q = q.eq('is_completed', true)
  }
  const { data } = await q
  return (data ?? []) as Activity[]
}

export async function createActivity(payload: ActivityInsert): Promise<Activity | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  if (!payload.lead_id && !payload.order_id) return null
  const { data } = await supabase.from('activities').insert(payload).select().single()
  return (data as Activity) ?? null
}

export async function updateActivity(id: string, payload: ActivityUpdate): Promise<Activity | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  if (payload.is_completed && !payload.completed_at) {
    payload.completed_at = new Date().toISOString()
  }
  const { data } = await supabase.from('activities').update(payload).eq('id', id).select().single()
  return (data as Activity) ?? null
}

export async function deleteActivity(id: string): Promise<boolean> {
  const supabase = getSupabase(true)
  if (!supabase) return false
  const { error } = await supabase.from('activities').delete().eq('id', id)
  return !error
}

export async function countOverdueActivities(): Promise<number> {
  const supabase = getSupabase(true)
  if (!supabase) return 0
  const { count } = await supabase
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('is_completed', false)
    .lt('due_date', new Date().toISOString())
  return count ?? 0
}
