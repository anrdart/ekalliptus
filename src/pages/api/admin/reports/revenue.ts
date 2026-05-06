import type { APIRoute } from 'astro'
import { revenueSeries } from '../../../../lib/admin/analytics'
import { requireAdmin } from '../../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const url = new URL(ctx.request.url)
  const from = url.searchParams.get('from') ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10)
  const to = url.searchParams.get('to') ?? new Date().toISOString().slice(0, 10)
  const granularity = (url.searchParams.get('granularity') as any) ?? 'day'
  const series = await revenueSeries({ from, to, granularity })
  return new Response(JSON.stringify({ series }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
