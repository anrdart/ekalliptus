import type { APIRoute } from 'astro'
import { getSupabase } from '../../lib/supabase'

/**
 * GET /api/admin/orders
 * Fetches orders with optional filtering and pagination
 * Query params:
 * - status: Filter by order status
 * - service: Filter by service type
 * - search: Search in customer name, email, or order ID
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return new Response(JSON.stringify({
        error: 'Database connection failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse query parameters
    const searchParams = url.searchParams
    const status = searchParams.get('status')
    const service = searchParams.get('service')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (service) {
      query = query.eq('service_type', service)
    }

    if (search) {
      // Search in customer name, email, or order ID
      query = query.or(`customer_name.ilike.%${search}%,email.ilike.%${search}%,id.ilike.%${search}%`)
    }

    // Apply pagination and ordering
    const { data: orders, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Orders fetch error:', error)
      return new Response(JSON.stringify({
        error: 'Failed to fetch orders'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    return new Response(JSON.stringify({
      orders: orders || [],
      pagination: {
        currentPage: page,
        totalPages,
        total: count || 0,
        limit
      }
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
