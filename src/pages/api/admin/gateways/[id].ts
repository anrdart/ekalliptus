import type { APIRoute } from 'astro'
import { getSupabase } from '../../../../lib/supabase'

/**
 * GET /api/admin/gateways/[id]
 * Fetches a specific payment gateway configuration
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({
        error: 'Gateway ID is required'
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

    const { data: gateway, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !gateway) {
      return new Response(JSON.stringify({
        error: 'Gateway not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      gateway
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
 * PATCH /api/admin/gateways/[id]
 * Updates a payment gateway configuration
 */
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return new Response(JSON.stringify({
        error: 'Gateway ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const {
      display_name,
      is_active,
      priority,
      config,
      fee_percent,
      fee_flat,
      supports_qr
    } = body

    const supabase = getSupabase(true)
    if (!supabase) {
      return new Response(JSON.stringify({
        error: 'Database connection failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}
    if (display_name !== undefined) updateData.display_name = display_name
    if (is_active !== undefined) updateData.is_active = is_active
    if (priority !== undefined) updateData.priority = priority
    if (config !== undefined) updateData.config = config
    if (fee_percent !== undefined) updateData.fee_percent = fee_percent
    if (fee_flat !== undefined) updateData.fee_flat = fee_flat
    if (supports_qr !== undefined) updateData.supports_qr = supports_qr

    // Update gateway configuration
    const { data: gateway, error } = await supabase
      .from('payment_gateways')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !gateway) {
      console.error('Gateway update error:', error)
      return new Response(JSON.stringify({
        error: 'Failed to update gateway'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      gateway
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
 * DELETE /api/admin/gateways/[id]
 * Deletes a payment gateway configuration
 */
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({
        error: 'Gateway ID is required'
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

    // Check if gateway exists
    const { data: existing } = await supabase
      .from('payment_gateways')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return new Response(JSON.stringify({
        error: 'Gateway not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Delete gateway configuration
    const { error } = await supabase
      .from('payment_gateways')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Gateway deletion error:', error)
      return new Response(JSON.stringify({
        error: 'Failed to delete gateway'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Gateway deleted successfully'
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
