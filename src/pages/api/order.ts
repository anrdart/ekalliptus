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
      urgency = 'normal'
    } = body
    
    if (!service_type || !customer_name || !whatsapp) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields' 
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
      urgency
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
      delivery_method: 'online'
    }
    
    const { data, error } = await createOrder(orderData)
    
    if (error) {
      console.error('Order creation error:', error)
      return new Response(JSON.stringify({ 
        error: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      data 
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
