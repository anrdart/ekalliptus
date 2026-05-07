import type { APIRoute } from 'astro'
import { requireAdmin } from '../../../../lib/admin/auth'
import { writeAudit } from '../../../../lib/admin/audit'
import { getSupabase } from '../../../../lib/supabase'
import type { OrderStatus } from '../../../../types/database'

const VALID_STATUSES: OrderStatus[] = ['waiting_dp', 'dp_paid', 'waiting_onsite_payment', 'onsite_paid', 'cancelled']

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const supabase = getSupabase(true)
  if (!supabase) return new Response(JSON.stringify({ error: 'Server' }), { status: 500 })
  const id = ctx.params.id as string
  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!order) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  return new Response(JSON.stringify({ order }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const PATCH: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard

  const id = ctx.params.id as string
  const body = await ctx.request.json()
  const newStatus = body.status as OrderStatus | undefined

  if (newStatus && !VALID_STATUSES.includes(newStatus)) {
    return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const supabase = getSupabase(true)
  if (!supabase) return new Response(JSON.stringify({ error: 'Server' }), { status: 500 })

  const { data: existing } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!existing) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  const update: Record<string, any> = {}
  if (newStatus !== undefined) update.status = newStatus
  // Note: orders table has no notes column — only status updates are supported
  if (Object.keys(update).length === 0) {
    return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) {
    return new Response(JSON.stringify({ error: error?.message ?? 'Update failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  await writeAudit({
    user_id: guard.user.id,
    action: 'update',
    table_name: 'orders',
    record_id: updated.id,
    old_values: existing,
    new_values: updated,
    ip_address: ctx.clientAddress,
    user_agent: ctx.request.headers.get('user-agent')
  })

  return new Response(JSON.stringify({ order: updated }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
