import type { APIRoute } from 'astro'
import { paymentService } from '../../../../lib/payment/services/payment.service'

/**
 * GET /api/payment/by-order/[orderId]
 * Returns payment for a specific order (latest first)
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { orderId } = params

    if (!orderId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const payments = await paymentService.getPaymentByOrderId(orderId)

    return new Response(JSON.stringify({
      success: true,
      data: payments.map(payment => ({
        id: payment.id,
        orderId: payment.order_id,
        gateway: payment.gateway,
        amount: payment.amount,
        paymentType: payment.payment_type,
        status: payment.status,
        paymentUrl: payment.payment_url,
        qrString: payment.qr_string,
        expiresAt: payment.expires_at,
        paidAt: payment.paid_at,
        createdAt: payment.created_at
      }))
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
