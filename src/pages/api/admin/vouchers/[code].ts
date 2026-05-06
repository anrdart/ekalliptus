import type { APIRoute } from 'astro'
import { deleteVoucher, getVoucher, updateVoucher } from '../../../../lib/admin/vouchers'
import { requireRole } from '../../../../lib/admin/auth'
import { writeAudit } from '../../../../lib/admin/audit'

export const PATCH: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'finance'])
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  const code = ctx.params.code as string
  const current = await getVoucher(code)
  const updated = await updateVoucher(code, body)
  if (!updated) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
  await writeAudit({
    user_id: guard.user.id,
    action: 'update',
    table_name: 'vouchers',
    record_id: updated.code,
    old_values: current,
    new_values: updated,
    ip_address: ctx.clientAddress,
    user_agent: ctx.request.headers.get('user-agent')
  })
  return new Response(JSON.stringify({ voucher: updated }), { status: 200 })
}

export const DELETE: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'finance'])
  if (guard instanceof Response) return guard
  const code = ctx.params.code as string
  const existing = await getVoucher(code)
  const ok = await deleteVoucher(code)
  if (ok && existing) {
    await writeAudit({
      user_id: guard.user.id,
      action: 'delete',
      table_name: 'vouchers',
      record_id: code,
      old_values: existing,
      ip_address: ctx.clientAddress,
      user_agent: ctx.request.headers.get('user-agent')
    })
  }
  return new Response(JSON.stringify({ success: ok }), { status: ok ? 200 : 500 })
}
