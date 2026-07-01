import { getSupabase } from '../supabase'

export interface AuditEntry {
  user_id?: string | null
  action: string
  table_name: string
  record_id?: string | null
  old_values?: any
  new_values?: any
  ip_address?: string | null
  user_agent?: string | null
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  const supabase = getSupabase(true)
  if (!supabase) return
  await supabase.from('audit_logs').insert({
    action: entry.action,
    table_name: entry.table_name,
    record_id: entry.record_id ?? null,
    old_values: entry.old_values ?? null,
    new_values: entry.new_values ?? null,
    user_id: entry.user_id ?? null,
    ip_address: (entry.ip_address as any) ?? '0.0.0.0',
    user_agent: entry.user_agent ?? null
  })
}

export interface ListAuditParams {
  table?: string
  action?: string
  from?: string
  to?: string
  page?: number
}

export async function listAudit(params: ListAuditParams = {}): Promise<{ rows: any[]; total: number; totalPages: number; page: number }> {
  const supabase = getSupabase(true)
  if (!supabase) return { rows: [], total: 0, totalPages: 0, page: 1 }
  const page = params.page ?? 1
  const pageSize = 30
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  let q = supabase.from('audit_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)
  if (params.table) q = q.eq('table_name', params.table)
  if (params.action) q = q.eq('action', params.action)
  if (params.from) q = q.gte('created_at', params.from)
  if (params.to) q = q.lte('created_at', params.to)
  const { data, count } = await q
  return { rows: data ?? [], total: count ?? 0, totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)), page }
}
