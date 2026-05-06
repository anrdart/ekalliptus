import type { APIRoute } from 'astro'
import { deleteLead, getLead, isValidStageTransition, updateLead } from '../../../../lib/admin/leads'
import { requireAdmin } from '../../../../lib/admin/auth'

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
  if (body.stage) {
    const current = await getLead(id)
    if (!current) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    if (!isValidStageTransition(current.stage, body.stage)) {
      return new Response(JSON.stringify({ error: 'Invalid stage transition' }), { status: 400 })
    }
  }
  const updated = await updateLead(id, body)
  if (!updated) return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 })
  return new Response(JSON.stringify({ lead: updated }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const DELETE: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const ok = await deleteLead(ctx.params.id as string)
  return new Response(JSON.stringify({ success: ok }), { status: ok ? 200 : 500 })
}
