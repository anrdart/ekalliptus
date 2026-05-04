import type { APIRoute } from 'astro'
import { webhookService } from '../../../lib/payment/services/webhook.service'

export const POST: APIRoute = async ({ request }) => {
  try {
    const signature = request.headers.get('x-signature') || ''

    const payload = await request.json()

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('cf-connecting-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const result = await webhookService.processWebhook(
      'pakasir',
      payload,
      signature,
      ipAddress,
      userAgent
    )

    return new Response(JSON.stringify({
      success: result.success,
      message: result.message
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Webhook processing failed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
