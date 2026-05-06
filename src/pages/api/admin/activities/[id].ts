import type { APIRoute } from 'astro'
import { deleteActivity, updateActivity } from '../../../../lib/admin/activities'
import { requireAdmin } from '../../../../lib/admin/auth'
import { writeAudit } from '../../../../lib/admin/audit'
import { getSupabase } from '../../../../lib/supabase'
import type { Activity } from '../../../../types/database'

async function getActivity(id: string): Promise<Activity | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const { data } = await supabase.from('activities').select('*').eq('id', id).single()
  return (data as Activity) ?? null
}

export const PATCH: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  const id = ctx.params.id as string
  const current = await getActivity(id)
  const updated = await updateActivity(id, body)
  if (!updated) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
  await writeAudit({
    user_id: guard.user.id,
    action: 'update',
    table_name: 'activities',
    record_id: updated.id,
    old_values: current,
    new_values: updated,
    ip_address: ctx.clientAddress,
    user_agent: ctx.request.headers.get('user-agent')
  })
  return new Response(JSON.stringify({ activity: updated }), { status: 200 })
}

export const DELETE: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard
  const id = ctx.params.id as string
  const existing = await getActivity(id)
  const ok = await deleteActivity(id)
  if (ok && existing) {
    await writeAudit({
      user_id: guard.user.id,
      action: 'delete',
      table_name: 'activities',
      record_id: id,
      old_values: existing,
      ip_address: ctx.clientAddress,
      user_agent: ctx.request.headers.get('user-agent')
    })
  }
  return new Response(JSON.stringify({ success: ok }), { status: ok ? 200 : 500 })
}
