import type { APIRoute } from 'astro'
import { ADMIN_COOKIE_NAME, parseSessionCookie } from '../../../lib/admin/auth'
import { getSupabase } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request }) => {
  const token = parseSessionCookie(request.headers.get('cookie'))
  if (token) {
    const supabase = getSupabase(true)
    if (supabase) {
      await supabase.auth.admin.signOut(token).catch(() => undefined)
    }
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`
    }
  })
}
