import type { APIRoute } from 'astro'
import { paymentService } from '../../../../lib/payment/services/payment.service'

/**
 * GET /api/payment/by-order/[orderId]
 * Returns payment for a specific order (latest first).
 * Public endpoint used by /order-success/[id] — sensitive fields are redacted.
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const orderId = String(params.orderId ?? '')

    if (!orderId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Reject non-UUID order IDs to prevent probing
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid order ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const payments = await paymentService.getPaymentByOrderId(orderId)

    return new Response(JSON.stringify({
      success: true,
      data: payments.map(payment => {
        const isPending = payment.status === 'pending' || payment.status === 'processing'
        return {
          id: payment.id,
          orderId: payment.order_id,
          gateway: payment.gateway,
          amount: payment.amount,
          paymentType: payment.payment_type,
          status: payment.status,
          expiresAt: payment.expires_at,
          paidAt: payment.paid_at,
          createdAt: payment.created_at,
          // Only expose payment URL and QR string while payment is still pending/processing
          ...(isPending ? {
            paymentUrl: payment.payment_url,
            qrString: payment.qr_string
          } : {})
        }
      })
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
