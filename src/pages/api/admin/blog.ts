import type { APIRoute } from 'astro'
import { createPost, listPosts } from '../../../lib/admin/blog'
import { requireRole } from '../../../lib/admin/auth'

export const GET: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'editor'])
  if (guard instanceof Response) return guard
  const url = new URL(ctx.request.url)
  const result = await listPosts({
    locale: url.searchParams.get('locale') ?? undefined,
    status: (url.searchParams.get('status') as any) ?? undefined,
    search: url.searchParams.get('search') ?? undefined,
    page: Number(url.searchParams.get('page') ?? '1') || 1
  })
  return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async (ctx) => {
  const guard = await requireRole(ctx, ['admin', 'editor'])
  if (guard instanceof Response) return guard
  const body = await ctx.request.json()
  if (!body.title || !body.slug || !body.locale) {
    return new Response(JSON.stringify({ error: 'title, slug, locale required' }), { status: 400 })
  }
  const post = await createPost({
    title: body.title,
    slug: body.slug,
    locale: body.locale,
    ...(body.description !== undefined && { description: body.description ?? null } as any),
    body_md: body.body_md,
    body_html: body.body_html ?? null,
    category: body.category ?? 'Web Development',
    tags: body.tags ?? [],
    author: body.author ?? 'Tim Ekalliptus',
    image: body.image ?? null,
    image_alt: body.image_alt ?? null,
    featured: body.featured ?? false,
    seo_meta_title: body.seo_meta_title ?? null,
    seo_meta_description: body.seo_meta_description ?? null,
    seo_noindex: body.seo_noindex ?? false,
    status: body.status ?? 'draft',
    publish_date: body.publish_date ?? null
  })
  if (!post) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
  return new Response(JSON.stringify({ post }), { status: 201, headers: { 'Content-Type': 'application/json' } })
}
