import { marked } from 'marked'
import { getSupabase } from '../supabase'
import type { BlogPost, BlogPostInsert, BlogPostUpdate } from '../../types/database'

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export interface ListPostsParams {
  locale?: string
  status?: 'draft' | 'published' | 'archived'
  search?: string
  page?: number
  pageSize?: number
}

export async function listPosts(params: ListPostsParams = {}): Promise<{ posts: BlogPost[]; total: number; totalPages: number; page: number }> {
  const { locale, status, search, page = 1, pageSize = 20 } = params
  const supabase = getSupabase(true)
  if (!supabase) return { posts: [], total: 0, totalPages: 0, page }
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  let q = supabase.from('blog_posts').select('*', { count: 'exact' }).order('updated_at', { ascending: false }).range(from, to)
  if (locale) q = q.eq('locale', locale)
  if (status) q = q.eq('status', status)
  if (search) q = q.ilike('title', `%${search}%`)
  const { data, count } = await q
  const total = count ?? 0
  return {
    posts: (data ?? []) as BlogPost[],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page
  }
}

export async function getPost(id: string): Promise<BlogPost | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  return (data as BlogPost) ?? null
}

export async function createPost(payload: BlogPostInsert & { body_md?: string }): Promise<BlogPost | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const body_html = payload.body_html ? payload.body_html : (payload.body_md ? await marked.parse(payload.body_md) : null)
  const { body_md, ...rest } = payload
  const { data } = await supabase.from('blog_posts').insert({ ...rest, body_html }).select().single()
  return (data as BlogPost) ?? null
}

export async function updatePost(id: string, payload: BlogPostUpdate & { body_md?: string }): Promise<BlogPost | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const update = { ...payload }
  if (payload.body_html) {
    update.body_html = payload.body_html
  } else if (payload.body_md) {
    update.body_html = await marked.parse(payload.body_md)
  }
  delete (update as any).body_md
  const { data } = await supabase.from('blog_posts').update(update).eq('id', id).select().single()
  return (data as BlogPost) ?? null
}

export async function deletePost(id: string): Promise<boolean> {
  const supabase = getSupabase(true)
  if (!supabase) return false
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  return !error
}
