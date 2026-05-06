import type { APIRoute } from 'astro'
import { deletePost, getPost, updatePost } from '../../../../lib/admin/blog'
import { requireRole } from '../../../../lib/admin/auth'
import { writeAudit } from '../../../../lib/admin/audit'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'editor'])
  if (guard instanceof Response) return guard
  const post = await getPost(ctx.params.id as string)
  if (!post) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  return new Response(JSON.stringify({ post }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const PATCH: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'editor'])
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  const id = ctx.params.id as string
  const current = await getPost(id)
  const updated = await updatePost(id, body)
  if (!updated) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
  await writeAudit({
    user_id: guard.user.id,
    action: 'update',
    table_name: 'blog_posts',
    record_id: updated.id,
    old_values: current,
    new_values: updated,
    ip_address: ctx.clientAddress,
    user_agent: ctx.request.headers.get('user-agent')
  })
  return new Response(JSON.stringify({ post: updated }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const DELETE: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'editor'])
  if (guard instanceof Response) return guard
  const id = ctx.params.id as string
  const existing = await getPost(id)
  const ok = await deletePost(id)
  if (ok && existing) {
    await writeAudit({
      user_id: guard.user.id,
      action: 'delete',
      table_name: 'blog_posts',
      record_id: id,
      old_values: existing,
      ip_address: ctx.clientAddress,
      user_agent: ctx.request.headers.get('user-agent')
    })
  }
  return new Response(JSON.stringify({ success: ok }), { status: ok ? 200 : 500 })
}
