import type { APIContext } from 'astro'
import type { User } from '@supabase/supabase-js'
import { getSupabase } from '../supabase'
import type { UserRole } from '../../types/database'

export const ADMIN_COOKIE_NAME = 'admin_session'

export function parseSessionCookie(header: string | null): string | null {
  if (!header) return null
  const parts = header.split(/;\s*/)
  for (const part of parts) {
    const [name, ...rest] = part.split('=')
    if (name === ADMIN_COOKIE_NAME) return rest.join('=') || null
  }
  return null
}

export interface AdminSession {
  user: User
  role: UserRole
  displayName: string
}

export async function getAdminSession(ctx: APIContext): Promise<AdminSession | null> {
  const token = parseSessionCookie(ctx.request.headers.get('cookie'))
  if (!token) return null

  const supabase = getSupabase(true)
  if (!supabase) return null

  const { data: userData, error } = await supabase.auth.getUser(token)
  if (error || !userData.user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('user_id', userData.user.id)
    .single()

  if (!profile) return null

  return {
    user: userData.user,
    role: (profile.role as UserRole) ?? 'admin',
    displayName: profile.display_name
  }
}

export function hasRole(session: AdminSession, allowed: UserRole[]): boolean {
  if (session.role === 'owner') return true
  return allowed.includes(session.role)
}

export async function requireAdmin(ctx: APIContext): Promise<AdminSession | Response> {
  const session = await getAdminSession(ctx)
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  return session
}

export async function requireRole(ctx: APIContext, roles: UserRole[]): Promise<AdminSession | Response> {
  const result = await requireAdmin(ctx)
  if (result instanceof Response) return result
  if (!hasRole(result, roles)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  return result
}
