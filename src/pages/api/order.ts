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
      paymentOption: payment_option as 'full' | 'dp'
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
      subtotal: calculation.subtotal,
      discount: calculation.discount,
      dpp: calculation.dpp,
      ppn: calculation.ppn,
      fee: calculation.fee,
      grand_total: calculation.grandTotal,
      deposit: calculation.deposit,
      remaining: calculation.remaining,
      schedule_date: tomorrow.toISOString().split('T')[0],
      schedule_time: '10:00',
      delivery_method: 'pickup',
      payment_option: payment_option,
      consultation_required: payment_option === 'dp'
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

    // If gateway is specified, create payment transaction
    let paymentData = null
    if (gateway && order) {
      try {
        const { paymentService } = await import('../../lib/payment')
        const paymentRequest = {
          orderId: order.id,
          amount: calculation.deposit, // Pay deposit amount first
          paymentType: payment_option as 'full' | 'dp',
          customerName,
          customerEmail: email,
          customerPhone: whatsapp,
          description: `${serviceType} - ${payment_option.toUpperCase()} payment`,
          expiryHours: 24
        }

        const paymentResult = await paymentService.createPayment(
          order.id,
          gateway as any,
          paymentRequest
        )

        if (paymentResult.success) {
          paymentData = {
            paymentId: paymentResult.paymentId,
            transactionId: paymentResult.transactionId,
            paymentUrl: paymentResult.paymentUrl,
            qrString: paymentResult.qrString,
            expiresAt: paymentResult.expiresAt
          }
        }
      } catch (paymentError) {
        console.error('Payment creation error:', paymentError)
        // Continue without payment if it fails
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        order,
        payment: paymentData
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
