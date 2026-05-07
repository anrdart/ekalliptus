import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'
import { ADMIN_COOKIE_NAME } from '../../../lib/admin/auth'
import { captureRuntimeEnv, readSupabaseEnv } from '../../../lib/runtime-env'
import type { Database } from '../../../types/database'

export const POST: APIRoute = async (ctx) => {
  // Defensive: middleware should already have captured runtime env, but recapture
  // here in case this handler was hit via a path the middleware skipped or the
  // module cache was reset.
  const runtimeEnv = (ctx.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env
  if (runtimeEnv) captureRuntimeEnv(runtimeEnv)

  const { request, redirect } = ctx
  const form = await request.formData()
  const email = String(form.get('email') ?? '')
  const password = String(form.get('password') ?? '')
  const next = String(form.get('next') ?? '/admin') || '/admin'

  if (!email || !password) {
    return redirect('/admin/login?error=empty')
  }

  const { url: supabaseUrl, anonKey: supabaseAnonKey, serviceRoleKey: supabaseServiceKey } = readSupabaseEnv()

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('[admin/login] Supabase env vars missing:', {
      hasUrl: !!supabaseUrl,
      hasAnon: !!supabaseAnonKey,
      hasServiceRole: !!supabaseServiceKey,
      source: runtimeEnv ? 'cloudflare-runtime' : 'import.meta.env'
    })
    return redirect('/admin/login?error=server')
  }

  // Fresh request-scoped clients prevent auth-state pollution across requests.
  // signInWithPassword sets the user's JWT on its client; subsequent queries
  // on that same client run as the user (not as service_role), which makes RLS apply.
  const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data, error } = await authClient.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    console.error('[admin/login] signInWithPassword failed:', error?.message ?? 'no session returned')
    return redirect('/admin/login?error=invalid')
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('user_id', data.user.id)
    .single()

  if (!profile) {
    console.error('[admin/login] No profile row for user_id:', data.user.id, 'profileError:', profileError?.message)
    return redirect('/admin/login?error=no_profile')
  }

  const safeNext = next.startsWith('/admin') ? next : '/admin'
  const maxAge = data.session.expires_in ?? 3600

  return new Response(null, {
    status: 302,
    headers: {
      Location: safeNext,
      'Set-Cookie': `${ADMIN_COOKIE_NAME}=${data.session.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`
    }
  })
}
