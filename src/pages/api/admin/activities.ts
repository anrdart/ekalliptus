import type { APIRoute } from 'astro'
import { createActivity, listActivities } from '../../../lib/admin/activities'
import { requireAdmin } from '../../../lib/admin/auth'
import { writeAudit } from '../../../lib/admin/audit'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const url = new URL(ctx.request.url)
  const filter = (url.searchParams.get('filter') as any) ?? 'all'
  const items = await listActivities(filter)
  return new Response(JSON.stringify({ items }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  if (!body.title) return new Response(JSON.stringify({ error: 'title required' }), { status: 400 })
  if (!body.lead_id && !body.order_id) return new Response(JSON.stringify({ error: 'lead_id or order_id required' }), { status: 400 })
  const created = await createActivity({
    type: body.type ?? 'note',
    title: body.title,
    description: body.description ?? null,
    lead_id: body.lead_id ?? null,
    order_id: body.order_id ?? null,
    due_date: body.due_date ?? null,
    priority: body.priority ?? 'medium',
    created_by: guard.displayName
  })
  if (!created) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
  await writeAudit({
    user_id: guard.user.id,
    action: 'create',
    table_name: 'activities',
    record_id: created.id,
    new_values: created,
    ip_address: ctx.clientAddress,
    user_agent: ctx.request.headers.get('user-agent')
  })
  return new Response(JSON.stringify({ activity: created }), { status: 201 })
}
