import type { APIRoute } from 'astro'
import { webhookService } from '../../../lib/payment/services/webhook.service'

/**
 * POST /api/webhook/midtrans
 * Handles Midtrans payment webhooks
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Get signature from x-signature-key header
    const signature = request.headers.get('x-signature-key')

    if (!signature) {
      console.error('Missing x-signature-key header')
      // Return 200 OK to prevent retries
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing signature'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get request body
    const payload = await request.json()

    // Get IP and user agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('cf-connecting-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Process webhook
    const result = await webhookService.processWebhook(
      'midtrans',
      payload,
      signature,
      ipAddress,
      userAgent
    )

    // Always return 200 OK to prevent retries
    return new Response(JSON.stringify({
      success: result.success,
      message: result.message
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Return 200 OK to prevent retries even on error
    return new Response(JSON.stringify({
      success: false,
      error: 'Webhook processing failed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
