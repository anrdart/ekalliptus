import type { APIRoute } from 'astro'
import { paymentService } from '../../../lib/payment/services/payment.service'

/**
 * GET /api/payment/[id]
 * Returns payment details by ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const payment = await paymentService.getPayment(id)

    if (!payment) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
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
      }
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
