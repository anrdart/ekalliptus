import type { APIRoute } from 'astro'
import { deletePost, getPost, updatePost } from '../../../../lib/admin/blog'
import { requireRole } from '../../../../lib/admin/auth'

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
  const updated = await updatePost(ctx.params.id as string, body)
  if (!updated) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
  return new Response(JSON.stringify({ post: updated }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const DELETE: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'editor'])
  if (guard instanceof Response) return guard
  const ok = await deletePost(ctx.params.id as string)
  return new Response(JSON.stringify({ success: ok }), { status: ok ? 200 : 500 })
}
