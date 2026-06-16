import type { APIRoute } from 'astro'
import { listCustomers } from '../../../lib/admin/customers'
import { requireAdmin } from '../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard

  const url = new URL(ctx.request.url)
  const result = await listCustomers({
    search: url.searchParams.get('search') ?? undefined,
    service: url.searchParams.get('service') ?? undefined,
    sort: (url.searchParams.get('sort') as any) ?? 'recent',
    page: Number(url.searchParams.get('page') ?? '1') || 1
  })

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
