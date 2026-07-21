import { defineMiddleware } from 'astro:middleware'
import { env as cfEnv } from 'cloudflare:workers'
import { captureRuntimeEnv } from './lib/runtime-env'
import { routePolicy } from './lib/locale-routing'

export const onRequest = defineMiddleware(async (ctx, next) => {
  // Capture Cloudflare runtime env on EVERY request.
  // Public routes (webhook, order, etc.) need access to Supabase secrets.
  // Wrap in try/catch — Cloudflare bindings can be Proxies that throw on access.
  try {
    captureRuntimeEnv(cfEnv as unknown as Record<string, unknown>)
  } catch (err) {
    console.warn('[middleware] Failed to read runtime env:', err)
  }

  if (ctx.locals.localeRewrite) return next()

  const policy = routePolicy(ctx.url.pathname)
  if (policy.action === 'bypass') return next()
  if (policy.action === 'redirect') return ctx.redirect(`${policy.location}${ctx.url.search}`, 302)

  ctx.locals.locale = policy.locale
  ctx.locals.publicPathname = policy.publicPathname
  ctx.locals.indexable = policy.indexable
  ctx.locals.localeRewrite = true

  if (policy.action === 'not-found') {
    const response = await ctx.rewrite('/404')
    response.headers.set('Cache-Control', 'no-store')
    return new Response(response.body, { status: 404, headers: response.headers })
  }

  const response = await ctx.rewrite(`${policy.renderPathname}${ctx.url.search}`)
  if (!policy.indexable) response.headers.set('Cache-Control', 'no-store')
  return response
})
