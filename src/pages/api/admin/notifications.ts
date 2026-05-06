import type { APIRoute } from 'astro'
import { getNotificationCounts } from '../../../lib/admin/notifications'
import { requireAdmin } from '../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const since = new URL(ctx.request.url).searchParams.get('since')
  const counts = await getNotificationCounts(since)
  return new Response(JSON.stringify(counts), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
