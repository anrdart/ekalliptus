import type { APIRoute } from 'astro'
import { readEnv } from '../../lib/runtime-env'
import { requestZaiCompletion } from '../../lib/zai'

// Read at request time via readEnv() (Cloudflare runtime env first, then the
// build-inlined import.meta.env fallback). Lets these be set as `wrangler
// secret`s without baking them into the bundle.
const ZAI_MODEL_DEFAULT = 'glm-4.5-air'
const CONSULT_SECRET_DEFAULT = 'ekalliptus-consult-2026'

const FALLBACK_RESPONSES = [
  'Terima kasih atas pertanyaan Anda! Untuk informasi lebih detail, silakan hubungi kami melalui WhatsApp di +62 819-9990-0306 atau kunjungi halaman order kami di ekalliptus.com/order.',
  'Pertanyaan yang bagus! Tim Ekalliptus siap membantu. Anda bisa langsung order melalui website kami atau hubungi via WhatsApp untuk konsultasi lebih lanjut.',
  'Mohon maaf, saat ini saya sedang dalam mode terbatas. Untuk respon yang lebih cepat dan detail, silakan ketik "chat admin" atau hubungi WhatsApp kami di +62 819-9990-0306.'
]

function pickFallback(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

function detectHandoff(messages: Array<{role: string; content: string}>): boolean {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  if (!lastUser) return false
  const text = lastUser.content.toLowerCase().trim()
  const phrases = [
    'chat admin', 'bicara admin', 'hubungkan admin', 'bicara dengan admin',
    'saya mau bicara admin', 'mau chat admin', 'bicara langsung',
    'talk to admin', 'connect admin', 'chat dengan admin',
    'mau ngobrol admin', 'pengen ketemu admin', 'bicara sama admin',
    'mau tanya admin', 'adminnya mana', 'panggil admin'
  ]
  return phrases.some(p => text.includes(p))
}

function sanitizeMessage(content: unknown): string {
  const str = typeof content === 'string' ? content : JSON.stringify(content)
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<img\b[^>]*onerror[^>]*>/gi, '')
    .replace(/<\s*img\b[^>]*\bsrc\s*=\s*["']?\s*data\s*:/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/<\?php.*?\?>/gis, '')
    .trim()
    .substring(0, 1000)
}

function sanitizeMessages(messages: unknown[]): Array<{role: string; content: string}> {
  const validRoles = new Set(['user', 'assistant', 'system'])
  return messages
    .slice(-10)
    .filter((m: any) => m && typeof m === 'object' && validRoles.has(m.role) && typeof m.content === 'string')
    .map((m: any) => ({
      role: m.role,
      content: sanitizeMessage(m.content)
    }))
    .filter(m => m.content.length > 0)
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 })
    return false
  }
  entry.count++
  return entry.count > 15
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const ZAI_API_KEY = readEnv('ZAI_API_KEY') || ''
    const ZAI_MODEL = readEnv('ZAI_MODEL') || ZAI_MODEL_DEFAULT
    const CONSULT_SECRET = readEnv('CONSULT_SECRET') || CONSULT_SECRET_DEFAULT

    const origin = request.headers.get('origin') || ''
    const referer = request.headers.get('referer') || ''
    const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'
    const token = request.headers.get('x-consult-token') || ''

    if (!origin.includes('ekalliptus.com') && !referer.includes('ekalliptus.com') && !origin.includes('localhost') && !referer.includes('localhost')) {
      return new Response(JSON.stringify({
        error: 'Forbidden'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (token !== CONSULT_SECRET) {
      return new Response(JSON.stringify({
        error: 'Forbidden'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({
        error: 'Too many requests'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({
        error: 'Messages array is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const sanitized = sanitizeMessages(messages)
    if (sanitized.length === 0) {
      return new Response(JSON.stringify({
        error: 'Invalid messages'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (detectHandoff(sanitized)) {
      return new Response(JSON.stringify({
        reply: 'Baik, saya akan menghubungkan Anda dengan admin Ekalliptus. Mohon tunggu sebentar...',
        handoff: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!ZAI_API_KEY) {
      return new Response(JSON.stringify({
        reply: pickFallback(),
        handoff: false
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const aiReply = await requestZaiCompletion(sanitized, ZAI_API_KEY, ZAI_MODEL)
    return new Response(JSON.stringify({
      reply: aiReply || pickFallback(),
      handoff: false
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      reply: pickFallback(),
      handoff: false
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
