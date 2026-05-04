import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'
import type { PaymentGateway } from '../../../types/database'

/**
 * GET /api/admin/gateways
 * Fetches all payment gateway configurations
 */
export const GET: APIRoute = async () => {
  try {
    const supabase = getSupabase(true)
    if (!supabase) {
      return new Response(JSON.stringify({
        error: 'Database connection failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch all gateway configurations
    const { data: gateways, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .order('priority', { ascending: true })

    if (error) {
      console.error('Gateways fetch error:', error)
      return new Response(JSON.stringify({
        error: 'Failed to fetch gateways'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      gateways: gateways || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
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

/**
 * POST /api/admin/gateways
 * Creates a new payment gateway configuration
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()

    const {
      name,
      display_name,
      is_active = true,
      priority = 0,
      config = {},
      fee_percent = 0,
      fee_flat = 0,
      supports_qr = false
    } = body

    // Validate required fields
    if (!name || !display_name) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: name, display_name'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate gateway name
    const validGateways: PaymentGateway[] = ['midtrans', 'pakasir', 'qiospay', 'sanpay', 'tripay']
    if (!validGateways.includes(name as PaymentGateway)) {
      return new Response(JSON.stringify({
        error: `Invalid gateway name. Must be one of: ${validGateways.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = getSupabase(true)
    if (!supabase) {
      return new Response(JSON.stringify({
        error: 'Database connection failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if gateway already exists
    const { data: existing } = await supabase
      .from('payment_gateways')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return new Response(JSON.stringify({
        error: 'Gateway with this name already exists'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create new gateway configuration
    const { data: gateway, error } = await supabase
      .from('payment_gateways')
      .insert({
        name,
        display_name,
        is_active,
        priority,
        config,
        fee_percent,
        fee_flat,
        supports_qr
      })
      .select()
      .single()

    if (error) {
      console.error('Gateway creation error:', error)
      return new Response(JSON.stringify({
        error: 'Failed to create gateway'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      gateway
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
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
