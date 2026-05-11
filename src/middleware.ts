import { defineMiddleware } from 'astro:middleware'
import { env as cfEnv } from 'cloudflare:workers'
import { getAdminSession } from './lib/admin/auth'
import { captureRuntimeEnv } from './lib/runtime-env'

const ROLE_RULES: Array<{ pattern: RegExp; allowed: string[] }> = [
  { pattern: /^\/admin\/blog/, allowed: ['owner', 'admin', 'editor'] },
  { pattern: /^\/admin\/vouchers/, allowed: ['owner', 'admin', 'finance'] },
  { pattern: /^\/admin\/audit-logs/, allowed: ['owner', 'admin'] },
  { pattern: /^\/admin\/payments/, allowed: ['owner', 'admin', 'finance'] },
  { pattern: /^\/admin\/reports/, allowed: ['owner', 'admin', 'finance'] },
  { pattern: /^\/admin\/settings/, allowed: ['owner', 'admin'] }
]

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
  // Capture Cloudflare runtime env on EVERY request (not just admin routes).
  // Public routes (webhook, order, etc.) also need access to Supabase secrets.
  // Wrap in try/catch — Cloudflare bindings can be Proxies that throw on access.
  try {
    captureRuntimeEnv(cfEnv as unknown as Record<string, unknown>)
  } catch (err) {
    console.warn('[middleware] Failed to read runtime env:', err)
  }

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

  for (const rule of ROLE_RULES) {
    if (rule.pattern.test(url.pathname)) {
      if (session.role !== 'owner' && !rule.allowed.includes(session.role)) {
        return new Response('Forbidden', { status: 403 })
      }
      break
    }
  }

  ctx.locals.adminSession = session
  return next()
})
