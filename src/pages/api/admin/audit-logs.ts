import type { APIRoute } from 'astro'
import { listAudit } from '../../../lib/admin/audit'
import { requireRole } from '../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin'])
  if (guard instanceof Response) return guard
  const url = new URL(ctx.request.url)
  const result = await listAudit({
    table: url.searchParams.get('table') ?? undefined,
    action: url.searchParams.get('action') ?? undefined,
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    page: Number(url.searchParams.get('page') ?? '1') || 1
  })
  return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
