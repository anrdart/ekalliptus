import type { APIRoute } from 'astro'
import { breakdownByService, breakdownByLeadSource, breakdownByCustomer } from '../../../../lib/admin/analytics'
import { requireAdmin } from '../../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const url = new URL(ctx.request.url)
  const type = url.searchParams.get('type') ?? 'service'
  const from = url.searchParams.get('from') ?? new Date(Date.now() - 30 * 86400_000).toISOString()
  const to = url.searchParams.get('to') ?? new Date().toISOString()
  if (type === 'source') {
    const data = await breakdownByLeadSource(from, to)
    return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  if (type === 'customer') {
    const data = await breakdownByCustomer(from, to)
    return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  const data = await breakdownByService(from, to)
  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
