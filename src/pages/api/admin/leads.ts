import type { APIRoute } from 'astro'
import { createLead, listLeadsByStage } from '../../../lib/admin/leads'
import { requireAdmin } from '../../../lib/admin/auth'
import { writeAudit } from '../../../lib/admin/audit'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const board = await listLeadsByStage()
  return new Response(JSON.stringify({ board }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  if (!body.name || typeof body.name !== 'string') {
    return new Response(JSON.stringify({ error: 'name is required' }), { status: 400 })
  }
  const lead = await createLead({
    name: body.name,
    whatsapp: body.whatsapp ?? null,
    email: body.email ?? null,
    company: body.company ?? null,
    service_interest: body.service_interest ?? null,
    stage: body.stage ?? 'new',
    source: body.source ?? 'manual',
    notes: body.notes ?? null,
    estimated_value: body.estimated_value ?? null
  })
  if (!lead) return new Response(JSON.stringify({ error: 'Failed to create' }), { status: 500 })
  await writeAudit({
    user_id: guard.user.id,
    action: 'create',
    table_name: 'leads',
    record_id: lead.id,
    new_values: lead,
    ip_address: ctx.clientAddress,
    user_agent: ctx.request.headers.get('user-agent')
  })
  return new Response(JSON.stringify({ lead }), { status: 201, headers: { 'Content-Type': 'application/json' } })
}
