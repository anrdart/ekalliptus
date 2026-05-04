import type { APIRoute } from 'astro'
import { getSupabase, type Order } from '../../../lib/supabase'

/**
 * GET /api/order/[id]
 * Returns order details by order ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !order) {
      console.error('Order fetch error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Order not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const typedOrder = order as Order
    const pricing = typedOrder.pricing as Record<string, number> | null

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: typedOrder.id,
        customerName: typedOrder.customer_name,
        email: typedOrder.email,
        whatsapp: typedOrder.whatsapp,
        company: typedOrder.company,
        serviceType: typedOrder.service_type,
        scope: typedOrder.scope,
        urgency: typedOrder.urgency,
        pricing: pricing || {},
        scheduleDate: typedOrder.schedule_date,
        scheduleTime: typedOrder.schedule_time,
        deliveryMethod: typedOrder.delivery_method,
        status: typedOrder.status,
        createdAt: typedOrder.created_at
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
