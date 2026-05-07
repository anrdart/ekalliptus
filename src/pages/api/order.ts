import type { APIRoute } from 'astro'
import { createOrder, validateVoucher, incrementVoucherUsage } from '../../lib/supabase'
import { SERVICE_TYPE_MAP, calculateOrder, SERVICE_PRICES } from '../../utils/pricing'
import { createLead } from '../../lib/admin/leads'

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
      gateway,
      voucher_code = null
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

    // Validate voucher before calculating if provided
    let voucherDiscount = 0
    let resolvedVoucherCode: string | null = null
    if (voucher_code) {
      const subtotalForVoucher = basePrice // pre-discount subtotal estimate
      const voucherResult = await validateVoucher(voucher_code, subtotalForVoucher)
      if (voucherResult.valid) {
        voucherDiscount = voucherResult.discount
        resolvedVoucherCode = (voucher_code as string).toUpperCase()
      } else {
        console.warn('[order] Voucher invalid:', voucherResult.error)
        // Proceed without voucher discount rather than blocking order
      }
    }

    const calculation = calculateOrder({
      serviceId: service_type,
      basePrice,
      urgency,
      paymentOption: payment_option === 'dp' ? 'deposit' : 'full'
    })

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const effectiveGrandTotal = Math.max(0, calculation.grandTotal - voucherDiscount)
    const effectiveDeposit = Math.max(0, calculation.deposit - (payment_option === 'dp' ? voucherDiscount : 0))
    const effectiveRemaining = Math.max(0, calculation.remaining - (payment_option !== 'dp' ? 0 : voucherDiscount))

    const orderData = {
      customer_name,
      email: email || null,
      whatsapp,
      company: company || null,
      service_type: serviceType,
      scope: scope || {},
      urgency,
      status: 'waiting_dp' as const,
      payment_option,
      voucher_code: resolvedVoucherCode,
      pricing: {
        subtotal: calculation.subtotal,
        discount: calculation.discount + voucherDiscount,
        dpp: calculation.dpp,
        ppn: calculation.ppn,
        fee: calculation.fee,
        shipping_cost: 0,
        grand_total: effectiveGrandTotal,
        deposit: effectiveDeposit,
        remaining: effectiveRemaining,
        ...(voucherDiscount > 0 ? { voucher_discount: voucherDiscount } : {})
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

    // Auto-create lead from order (non-blocking)
    try {
      await createLead({
        name: order!.customer_name,
        whatsapp: order!.whatsapp,
        email: order!.email,
        company: order!.company,
        service_interest: order!.service_type,
        stage: 'new',
        source: 'direct_order',
        order_id: order!.id,
        estimated_value: Number((order!.pricing as any)?.grand_total ?? 0),
        notes: `Auto-created from order ${order!.id.slice(0, 8)}`
      })
    } catch (err) {
      console.error('[order] Auto-create lead failed:', err)
    }

    // Increment voucher usage after successful order (non-blocking)
    if (resolvedVoucherCode) {
      await incrementVoucherUsage(resolvedVoucherCode).catch((err) =>
        console.error('[order] increment voucher failed:', err)
      )
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
