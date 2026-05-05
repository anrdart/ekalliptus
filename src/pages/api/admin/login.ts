import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'
import { ADMIN_COOKIE_NAME } from '../../../lib/admin/auth'

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData()
  const email = String(form.get('email') ?? '')
  const password = String(form.get('password') ?? '')
  const next = String(form.get('next') ?? '/admin') || '/admin'

  if (!email || !password) {
    return redirect('/admin/login?error=invalid')
  }

  const supabase = getSupabase(true)
  if (!supabase) {
    return redirect('/admin/login?error=server')
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    return redirect('/admin/login?error=invalid')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', data.user.id)
    .single()

  if (!profile) {
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
