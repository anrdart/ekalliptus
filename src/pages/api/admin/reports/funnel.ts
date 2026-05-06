import type { APIRoute } from 'astro'
import { funnelStats } from '../../../../lib/admin/analytics'
import { requireAdmin } from '../../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const url = new URL(ctx.request.url)
  const from = url.searchParams.get('from') ?? new Date(Date.now() - 30 * 86400_000).toISOString()
  const to = url.searchParams.get('to') ?? new Date().toISOString()
  const stages = await funnelStats(from, to)
  return new Response(JSON.stringify({ stages }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
