import type { APIRoute } from 'astro'
import { getSupabase, type Order } from '../../../lib/supabase'
import { paymentService } from '../../../lib/payment/services/payment.service'
import type { PaymentGateway, PaymentType } from '../../../types/database'

/**
 * POST /api/payment/create
 * Creates a new payment transaction
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()

    const {
      orderId,
      gateway,
      amount,
      paymentType
    } = body

    // Validate required fields
    if (!orderId || !gateway || !amount || !paymentType) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: orderId, gateway, amount, paymentType'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate gateway
    const validGateways: PaymentGateway[] = ['midtrans', 'pakasir', 'qiospay', 'sanpay', 'tripay']
    if (!validGateways.includes(gateway as PaymentGateway)) {
      return new Response(JSON.stringify({
        error: `Invalid gateway. Must be one of: ${validGateways.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate payment type
    const validPaymentTypes: PaymentType[] = ['full', 'dp', 'remaining']
    if (!validPaymentTypes.includes(paymentType as PaymentType)) {
      return new Response(JSON.stringify({
        error: `Invalid paymentType. Must be one of: ${validPaymentTypes.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return new Response(JSON.stringify({
        error: 'Amount must be a positive number'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get order details from Supabase
    const supabase = getSupabase()
    if (!supabase) {
      return new Response(JSON.stringify({
        error: 'Database connection failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order fetch error:', orderError)
      return new Response(JSON.stringify({
        error: 'Order not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate payment amount matches order
    const typedOrder = order as Order
    const pricing = typedOrder.pricing as Record<string, number> | null
    let expectedAmount = 0

    if (paymentType === 'full') {
      expectedAmount = pricing?.grand_total ?? 0
    } else if (paymentType === 'dp') {
      expectedAmount = pricing?.deposit ?? 0
    } else if (paymentType === 'remaining') {
      expectedAmount = pricing?.remaining ?? 0
    }

    // Allow small difference for gateway fee variations
    if (Math.abs(amount - expectedAmount) > 1000) {
      return new Response(JSON.stringify({
        error: `Amount mismatch. Expected ${expectedAmount} for ${paymentType} payment`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Call payment service
    try {
      const payment = await paymentService.createPayment(
        orderId,
        gateway as PaymentGateway,
        {
          orderId,
          amount,
          paymentType: paymentType as PaymentType,
          customerName: typedOrder.customer_name,
          customerEmail: typedOrder.email,
          customerPhone: typedOrder.whatsapp,
          description: `Payment for order ${orderId} (${paymentType})`,
          expiryHours: 24
        }
      )

      return new Response(JSON.stringify({
        success: true,
        data: {
          paymentId: payment.paymentId,
          transactionId: payment.transactionId,
          paymentUrl: payment.paymentUrl,
          qrString: payment.qrString,
          expiresAt: payment.expiresAt
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (paymentError) {
      console.error('Payment creation error:', paymentError)
      return new Response(JSON.stringify({
        error: paymentError instanceof Error ? paymentError.message : 'Failed to create payment'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
