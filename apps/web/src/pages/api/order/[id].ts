import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order ID is required'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection failed'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !order) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: order.id,
        customerName: order.customer_name,
        whatsapp: order.whatsapp,
        serviceType: order.service_type,
        description: (order as any).description || (order.scope as any)?.description || '',
        price: (order as any).price || (order.pricing as any)?.grand_total || 0,
        status: order.status,
        createdAt: order.created_at
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
