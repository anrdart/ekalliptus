import type { APIRoute } from 'astro'
import { createVoucher, listVouchers } from '../../../lib/admin/vouchers'
import { requireRole } from '../../../lib/admin/auth'
import { writeAudit } from '../../../lib/admin/audit'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'finance'])
  if (guard instanceof Response) return guard
  const vouchers = await listVouchers()
  return new Response(JSON.stringify({ vouchers }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'finance'])
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  if (!body.code || !body.type || body.value === undefined) {
    return new Response(JSON.stringify({ error: 'code, type, value required' }), { status: 400 })
  }
  const voucher = await createVoucher({
    code: body.code,
    type: body.type,
    value: Number(body.value),
    min_spend: body.min_spend ?? null,
    max_uses: body.max_uses ?? null,
    valid_until: body.valid_until ?? null,
    is_active: body.is_active ?? true
  })
  if (!voucher) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
  await writeAudit({
    user_id: guard.user.id,
    action: 'create',
    table_name: 'vouchers',
    record_id: voucher.code,
    new_values: voucher,
    ip_address: ctx.clientAddress,
    user_agent: ctx.request.headers.get('user-agent')
  })
  return new Response(JSON.stringify({ voucher }), { status: 201 })
}
