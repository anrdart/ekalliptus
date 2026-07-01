// Runtime environment helper.
// Cloudflare Workers exposes secrets via `import { env } from "cloudflare:workers"`.
// Middleware captures env on every request; helpers read via readEnv().

let cachedRuntimeEnv: Record<string, string | undefined> | null = null

export function captureRuntimeEnv(env: Record<string, unknown> | undefined): void {
  if (!env) return
  // Cloudflare bindings can be Proxies that throw on enumeration. Wrap safely.
  try {
    const next: Record<string, string | undefined> = {}
    for (const key of Object.keys(env)) {
      try {
        const value = env[key]
        if (typeof value === 'string') next[key] = value
      } catch {
        // Skip keys that throw on access (e.g. KV bindings)
      }
    }
    cachedRuntimeEnv = next
  } catch (err) {
    console.warn('[runtime-env] Failed to capture env:', err)
  }
}

export function readEnv(key: string): string | undefined {
  // Prefer runtime-captured value (Cloudflare secrets), fallback to build-time
  if (cachedRuntimeEnv && cachedRuntimeEnv[key] !== undefined) {
    return cachedRuntimeEnv[key]
  }
  // import.meta.env returns the inlined build value if Vite knew the var at build time
  return (import.meta.env as Record<string, string | undefined>)[key]
}

export function readSupabaseEnv(): {
  url: string | undefined
  anonKey: string | undefined
  serviceRoleKey: string | undefined
} {
  return {
    url: readEnv('SUPABASE_URL') ?? readEnv('VITE_SUPABASE_URL'),
    anonKey: readEnv('SUPABASE_ANON_KEY') ?? readEnv('VITE_SUPABASE_ANON_KEY'),
    serviceRoleKey: readEnv('SUPABASE_SERVICE_ROLE_KEY')
  }
}
