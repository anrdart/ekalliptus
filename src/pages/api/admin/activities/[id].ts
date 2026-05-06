import type { APIRoute } from 'astro'
import { deleteActivity, updateActivity } from '../../../../lib/admin/activities'
import { requireAdmin } from '../../../../lib/admin/auth'

export const PATCH: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  const updated = await updateActivity(ctx.params.id as string, body)
  if (!updated) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
  return new Response(JSON.stringify({ activity: updated }), { status: 200 })
}

export const DELETE: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const ok = await deleteActivity(ctx.params.id as string)
  return new Response(JSON.stringify({ success: ok }), { status: ok ? 200 : 500 })
}
