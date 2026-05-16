import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SERVICE_LABELS: Record<string, string> = {
  website: 'Website Development',
  mobile: 'Mobile App Development',
  wordpress: 'WordPress Development',
  editing: 'UI/UX Design',
  web: 'Website Development',
  uiux: 'UI/UX Design'
}

function formatPrice(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<{ success: boolean; result?: T; error?: string; attempts: number }> {
  let lastError = ''
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn()
      return { success: true, result, attempts: attempt }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
      }
    }
  }
  return { success: false, error: lastError, attempts: maxAttempts }
}

async function getGoogleAccessToken(email: string, privateKey: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const claimSet = btoa(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }))

  const signInput = `${header}.${claimSet}`
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(signInput)
  )
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const jwt = `${header}.${claimSet}.${sig}`
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  if (!tokenRes.ok) throw new Error(`Token request failed: ${tokenRes.status}`)
  const { access_token } = await tokenRes.json()
  return access_token
}

async function appendToGoogleSheets(order: any): Promise<void> {
  const email = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')!
  const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY')!.replace(/\\n/g, '\n')
  const sheetId = Deno.env.get('GOOGLE_SHEET_ID')!

  const accessToken = await getGoogleAccessToken(email, privateKey)
  const timestamp = new Date(order.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  const price = order.price || (order.pricing as any)?.grand_total || 0
  const description = order.description || (order.scope as any)?.description || ''

  const values = [[
    order.id,
    order.customer_name,
    order.whatsapp,
    order.service_type,
    formatPrice(price),
    description,
    timestamp
  ]]

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:G:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Sheets API error ${res.status}: ${body}`)
  }
}

async function sendTelegramNotification(order: any): Promise<void> {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')!

  const price = order.price || (order.pricing as any)?.grand_total || 0
  const description = order.description || (order.scope as any)?.description || ''
  const serviceLabel = SERVICE_LABELS[order.service_type] || order.service_type

  const text = `🔔 *Order Baru\\!*

📋 Order ID: \`${order.id.slice(0, 8)}\`
👤 Nama: ${escapeMarkdown(order.customer_name)}
📱 WhatsApp: ${escapeMarkdown(order.whatsapp)}
🛠 Layanan: ${escapeMarkdown(serviceLabel)}
💰 Harga: ${escapeMarkdown(formatPrice(price))}

📝 ${escapeMarkdown(description)}`

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Telegram API error ${res.status}: ${body}`)
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const order = payload.record

    if (!order || !order.id) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const [sheetsResult, telegramResult] = await Promise.allSettled([
      withRetry(() => appendToGoogleSheets(order)),
      withRetry(() => sendTelegramNotification(order))
    ])

    const sheetsOutcome = sheetsResult.status === 'fulfilled' ? sheetsResult.value : { success: false, error: String(sheetsResult.reason), attempts: 0 }
    const telegramOutcome = telegramResult.status === 'fulfilled' ? telegramResult.value : { success: false, error: String(telegramResult.reason), attempts: 0 }

    const failures: { order_id: string; target: string; error_message: string; attempts: number }[] = []

    if (!sheetsOutcome.success) {
      failures.push({
        order_id: order.id,
        target: 'sheets',
        error_message: sheetsOutcome.error || 'Unknown error',
        attempts: sheetsOutcome.attempts
      })
    }

    if (!telegramOutcome.success) {
      failures.push({
        order_id: order.id,
        target: 'telegram',
        error_message: telegramOutcome.error || 'Unknown error',
        attempts: telegramOutcome.attempts
      })
    }

    if (failures.length > 0) {
      await supabase.from('order_sync_failures').insert(failures)
    }

    return new Response(JSON.stringify({
      sheets: sheetsOutcome.success ? 'ok' : 'failed',
      telegram: telegramOutcome.success ? 'ok' : 'failed'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
