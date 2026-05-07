// Runtime environment helper.
// Cloudflare Pages exposes secrets at request runtime via ctx.locals.runtime.env,
// not via import.meta.env (which only contains BUILD-time values inlined by Vite).
// Middleware captures runtime.env on every request; helpers read via readEnv().
//
// In dev (platformProxy enabled), runtime.env mirrors .env / .dev.vars.
// In production Cloudflare, secrets configured in the dashboard are exposed here.

let cachedRuntimeEnv: Record<string, string | undefined> | null = null

export function captureRuntimeEnv(env: Record<string, unknown> | undefined): void {
  if (!env) return
  // Shallow-copy and coerce values to strings for safety
  const next: Record<string, string | undefined> = {}
  for (const key of Object.keys(env)) {
    const value = env[key]
    if (typeof value === 'string') next[key] = value
  }
  cachedRuntimeEnv = next
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
