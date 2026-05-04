import type { APIRoute } from 'astro'
import { createOrder } from '../../lib/supabase'
import { SERVICE_TYPE_MAP, calculateOrder, SERVICE_PRICES } from '../../utils/pricing'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()

    const {
      service_type,
      customer_name,
      email,
      whatsapp,
      company,
      scope,
      urgency = 'normal',
      payment_option = 'full',
      gateway
    } = body

    if (!service_type || !customer_name || !whatsapp) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: service_type, customer_name, whatsapp'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate payment option
    if (!['full', 'dp'].includes(payment_option)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid payment option. Must be "full" or "dp"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const serviceType = SERVICE_TYPE_MAP[service_type] || 'website'
    const basePrice = SERVICE_PRICES[service_type] || 0

    const calculation = calculateOrder({
      serviceId: service_type,
      basePrice,
      urgency,
      paymentOption: payment_option === 'dp' ? 'deposit' : 'full'
    })

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const orderData = {
      customer_name,
      email: email || null,
      whatsapp,
      company: company || null,
      service_type: serviceType,
      scope: scope || {},
      urgency,
      pricing: {
        subtotal: calculation.subtotal,
        discount: calculation.discount,
        dpp: calculation.dpp,
        ppn: calculation.ppn,
        fee: calculation.fee,
        shipping_cost: 0,
        grand_total: calculation.grandTotal,
        deposit: calculation.deposit,
        remaining: calculation.remaining
      },
      schedule_date: tomorrow.toISOString().split('T')[0],
      schedule_time: '10:00',
      delivery_method: 'pickup' as const
    }

    const { data: order, error } = await createOrder(orderData)

    if (error) {
      console.error('Order creation error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let gatewayName = gateway
    console.log('[Order API] Looking for payment gateway. Explicit gateway:', gateway || '(none)')
    if (!gatewayName) {
      try {
        const { paymentService } = await import('../../lib/payment')
        const activeGateways = await paymentService.getActiveGateways()
        console.log('[Order API] Active gateways found:', activeGateways?.length || 0, activeGateways?.map(g => g.name))
        if (activeGateways && activeGateways.length > 0) {
          gatewayName = activeGateways[0].name
        }
      } catch (err) {
        console.error('[Order API] Failed to fetch active gateways:', err instanceof Error ? err.message : err)
      }
    }
    console.log('[Order API] Resolved gateway:', gatewayName || '(none)')

    // If gateway is specified, create payment transaction
    let paymentData = null
    let paymentError = undefined
    if (gatewayName && order) {
      try {
        const { paymentService } = await import('../../lib/payment')
        const origin = request.headers.get('origin') || new URL(request.url).origin
        const paymentRequest = {
          orderId: order.id,
          amount: calculation.deposit,
          paymentType: payment_option as 'full' | 'dp',
          customerName: customer_name,
          customerEmail: email,
          customerPhone: whatsapp,
          description: `${serviceType} - ${payment_option.toUpperCase()} payment`,
          expiryHours: 24,
          returnUrl: `${origin}/order-success`
        }

        console.log('[Order API] Creating payment via', gatewayName, 'for order', order.id, 'amount:', calculation.deposit)
        const paymentResult = await paymentService.createPayment(
          order.id,
          gatewayName as any,
          paymentRequest
        )

        console.log('[Order API] Payment result - success:', paymentResult.success, 'paymentUrl:', paymentResult.paymentUrl)
        if (paymentResult.success) {
          paymentData = {
            paymentId: paymentResult.paymentId,
            transactionId: paymentResult.transactionId,
            paymentUrl: paymentResult.paymentUrl,
            qrString: paymentResult.qrString,
            expiresAt: paymentResult.expiresAt
          }
        } else {
          console.error('[Order API] Payment gateway returned failure:', paymentResult.error)
          paymentError = paymentResult.error
        }
      } catch (paymentErrorCatch) {
        const errorMsg = paymentErrorCatch instanceof Error ? paymentErrorCatch.message : 'Unknown payment error'
        console.error('[Order API] Payment creation error:', errorMsg)
        paymentError = errorMsg
      }
    } else {
      console.warn('[Order API] Skipping payment creation. gatewayName:', gatewayName, 'order:', !!order)
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        order,
        payment: paymentData,
        ...(paymentError ? { paymentError } : {})
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
