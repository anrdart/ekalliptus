import { defineMiddleware } from 'astro:middleware'
import { getAdminSession } from './lib/admin/auth'

export function isLoginPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname === '/api/admin/login'
}

export function isProtectedPath(pathname: string): boolean {
  if (isLoginPath(pathname)) return false
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  if (pathname.startsWith('/api/admin/')) return true
  return false
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const url = new URL(ctx.request.url)
  if (!isProtectedPath(url.pathname)) return next()
  if (import.meta.env.ADMIN_AUTH_DISABLED === 'true') return next()

  const session = await getAdminSession(ctx)
  if (!session) {
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    const next_url = encodeURIComponent(url.pathname + url.search)
    return ctx.redirect(`/admin/login?next=${next_url}`)
  }

  ctx.locals.adminSession = session
  return next()
})
