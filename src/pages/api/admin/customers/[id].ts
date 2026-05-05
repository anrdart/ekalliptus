import type { APIRoute } from 'astro'
import { getCustomerDetail } from '../../../../lib/admin/customers'
import { requireAdmin } from '../../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard

  const id = ctx.params.id as string
  const detail = await getCustomerDetail(id)
  if (!detail) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  }
  return new Response(JSON.stringify(detail), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
