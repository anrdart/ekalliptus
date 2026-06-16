import type { APIRoute } from 'astro'
import { getSupabase } from '../../../../lib/supabase'
import { requireAdmin } from '../../../../lib/admin/auth'

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export const GET: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const supabase = getSupabase(true)
  if (!supabase) return new Response('Server not configured', { status: 500 })

  const url = new URL(ctx.request.url)
  const type = url.searchParams.get('type') ?? 'orders'
  const from = url.searchParams.get('from') ?? new Date(Date.now() - 30 * 86400_000).toISOString()
  const to = url.searchParams.get('to') ?? new Date().toISOString()

  if (type === 'orders') {
    const { data } = await supabase.from('orders').select('*').gte('created_at', from).lte('created_at', to)
    const rows = data ?? []
    const headers = ['id', 'created_at', 'customer_name', 'whatsapp', 'email', 'company', 'service_type', 'status', 'grand_total']
    const lines = [headers.join(',')]
    for (const r of rows) {
      lines.push([
        r.id, r.created_at, r.customer_name, r.whatsapp, r.email, r.company,
        r.service_type, r.status, (r.pricing as any)?.grand_total ?? 0
      ].map(csvEscape).join(','))
    }
    return new Response(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-${from.slice(0,10)}-to-${to.slice(0,10)}.csv"`
      }
    })
  }

  if (type === 'payments') {
    const { data } = await supabase.from('payments').select('*').gte('created_at', from).lte('created_at', to)
    const rows = data ?? []
    const headers = ['id', 'created_at', 'paid_at', 'order_id', 'gateway', 'payment_type', 'status', 'amount']
    const lines = [headers.join(',')]
    for (const r of rows) {
      lines.push([r.id, r.created_at, r.paid_at, r.order_id, r.gateway, r.payment_type, r.status, r.amount].map(csvEscape).join(','))
    }
    return new Response(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="payments-${from.slice(0,10)}-to-${to.slice(0,10)}.csv"`
      }
    })
  }

  return new Response('Unsupported type', { status: 400 })
}
