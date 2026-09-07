const requests = new Map<string, { count: number; expires: number }>()

export const apiJson = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
})

export async function readPublicJson(request: Request): Promise<Record<string, unknown> | Response> {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) return apiJson({ error: 'Forbidden' }, 403)
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return apiJson({ error: 'Expected application/json' }, 415)
  }
  const now = Date.now()
  for (const [key, entry] of requests) if (entry.expires <= now) requests.delete(key)
  // ponytail: isolate-local abuse protection; use Cloudflare rate limiting for distributed enforcement.
  const key = request.headers.get('cf-connecting-ip') || 'unknown'
  const entry = requests.get(key) ?? { count: 0, expires: now + 60_000 }
  if (requests.size >= 10_000 && !requests.has(key)) return apiJson({ error: 'Too many requests' }, 429)
  requests.set(key, entry)
  if (++entry.count > 30) return apiJson({ error: 'Too many requests' }, 429)
  const reader = request.body?.getReader()
  if (!reader) return apiJson({ error: 'Invalid JSON body' }, 400)
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 16_384) {
        await reader.cancel()
        return apiJson({ error: 'Request too large' }, 413)
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    const body = JSON.parse(new TextDecoder().decode(bytes))
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid object')
    return body
  } catch {
    return apiJson({ error: 'Invalid JSON body' }, 400)
  } finally {
    reader.releaseLock()
  }
}

export const validText = (value: unknown, min: number, max: number): value is string =>
  typeof value === 'string' && value.trim().length >= min && value.length <= max

export const validSession = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
