import { defineMiddleware } from 'astro:middleware'
import { env as cfEnv } from 'cloudflare:workers'
import { captureRuntimeEnv } from './lib/runtime-env'

export const onRequest = defineMiddleware(async (ctx, next) => {
  // Capture Cloudflare runtime env on EVERY request.
  // Public routes (webhook, order, etc.) need access to Supabase secrets.
  // Wrap in try/catch — Cloudflare bindings can be Proxies that throw on access.
  try {
    captureRuntimeEnv(cfEnv as unknown as Record<string, unknown>)
  } catch (err) {
    console.warn('[middleware] Failed to read runtime env:', err)
  }

  return next()
})
