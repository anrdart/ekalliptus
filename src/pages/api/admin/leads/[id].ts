import type { APIRoute } from 'astro'
import { deleteLead, getLead, isValidStageTransition, updateLead } from '../../../../lib/admin/leads'
import { requireAdmin } from '../../../../lib/admin/auth'
import { writeAudit } from '../../../../lib/admin/audit'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const lead = await getLead(ctx.params.id as string)
  if (!lead) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  return new Response(JSON.stringify({ lead }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const PATCH: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  const id = ctx.params.id as string
  const current = await getLead(id)
  if (!current) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  if (body.stage) {
    if (!isValidStageTransition(current.stage, body.stage)) {
      return new Response(JSON.stringify({ error: 'Invalid stage transition' }), { status: 400 })
    }
  }
  const updated = await updateLead(id, body)
  if (!updated) return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 })
  await writeAudit({
    user_id: guard.user.id,
    action: 'update',
    table_name: 'leads',
    record_id: updated.id,
    old_values: current,
    new_values: updated,
    ip_address: ctx.clientAddress,
    user_agent: ctx.request.headers.get('user-agent')
  })
  return new Response(JSON.stringify({ lead: updated }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const DELETE: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const id = ctx.params.id as string
  const existing = await getLead(id)
  const ok = await deleteLead(id)
  if (ok && existing) {
    await writeAudit({
      user_id: guard.user.id,
      action: 'delete',
      table_name: 'leads',
      record_id: id,
      old_values: existing,
      ip_address: ctx.clientAddress,
      user_agent: ctx.request.headers.get('user-agent')
    })
  }
  return new Response(JSON.stringify({ success: ok }), { status: ok ? 200 : 500 })
}
