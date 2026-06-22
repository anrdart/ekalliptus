import type { APIRoute } from 'astro'
import { createOrder } from '../../lib/supabase'
import { SERVICE_TYPE_MAP, SERVICE_PRICES } from '../../utils/pricing'
import { createLead } from '../../lib/admin/leads'

const VALID_SERVICES = ['web', 'mobile', 'maintenance']

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { service_type, customer_name, whatsapp, description } = body

    if (!service_type || !customer_name || !whatsapp || !description) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: service_type, customer_name, whatsapp, description'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    if (!VALID_SERVICES.includes(service_type)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid service_type'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const serviceType = SERVICE_TYPE_MAP[service_type] || 'website'
    const price = SERVICE_PRICES[service_type] || 0

    const orderData = {
      customer_name,
      whatsapp,
      service_type: serviceType,
      description,
      price,
      scope: { description },
      pricing: { grand_total: price },
      status: 'new' as const,
      schedule_date: new Date().toISOString().split('T')[0],
      schedule_time: '10:00',
      delivery_method: 'pickup' as const
    }

    const { data: order, error } = await createOrder(orderData)

    if (error) {
      console.error('Order creation error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    try {
      await createLead({
        name: customer_name,
        whatsapp,
        service_interest: serviceType,
        stage: 'new',
        source: 'direct_order',
        order_id: order!.id,
        estimated_value: price,
        notes: `Auto-created from order ${order!.id.slice(0, 8)}`
      })
    } catch (err) {
      console.error('[order] Auto-create lead failed:', err)
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        orderId: order!.id,
        customerName: customer_name,
        whatsapp,
        serviceType: service_type,
        price
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
