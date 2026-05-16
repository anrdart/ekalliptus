import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'
import { requireAdmin } from '../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard

  const supabase = getSupabase(true)
  if (!supabase) return new Response(JSON.stringify({ orders: [], total: 0 }), { status: 200 })

  const url = new URL(ctx.request.url)
  const search = url.searchParams.get('search') ?? ''
  const service = url.searchParams.get('service') ?? ''
  const status = url.searchParams.get('status') ?? ''
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)
  if (search) query = query.or(`customer_name.ilike.%${search}%,whatsapp.ilike.%${search}%`)
  if (service) query = query.eq('service_type', service as any)
  if (status) query = query.eq('status', status as any)

  const { data, count } = await query
  return new Response(JSON.stringify({
    orders: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize))
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
