import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'

const CONSULT_TOKEN = 'ekalliptus-consult-2026'

function isAuthorized(request: Request): boolean {
  const token = request.headers.get('x-consult-token')
  return token === CONSULT_TOKEN
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const origin = request.headers.get('origin') || ''
    const host = request.headers.get('host') || ''

    if (!isAuthorized(request)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { session_id, message, visitor_name } = body

    if (!session_id || !message) {
      return new Response(JSON.stringify({
        error: 'session_id and message are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = getSupabase()

    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const visitorName = visitor_name || 'Pengunjung'

    const { data: consultation, error: consultError } = await supabase
      .from('consultations')
      .select('id')
      .eq('session_id', session_id)
      .single()

    if (consultError || !consultation) {
      const { data: newConsultation, error: insertError } = await supabase
        .from('consultations')
        .insert({
          session_id,
          visitor_name: visitorName,
          status: 'active',
          last_message: message.length > 200 ? message.slice(0, 200) + '...' : message,
          last_message_at: new Date().toISOString(),
          unread_count: 1,
        })
        .select()
        .single()

      if (insertError || !newConsultation) {
        return new Response(JSON.stringify({ error: 'Failed to create consultation' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { error: msgError } = await supabase
        .from('consultation_messages')
        .insert({
          consultation_id: newConsultation.id,
          sender_type: 'visitor',
          sender_name: visitorName,
          content: message.slice(0, 2000),
        })

      if (msgError) {
        console.error('Failed to insert message:', msgError.message)
      }
    } else {
      const { error: msgError } = await supabase
        .from('consultation_messages')
        .insert({
          consultation_id: consultation.id,
          sender_type: 'visitor',
          sender_name: visitorName,
          content: message.slice(0, 2000),
        })

      if (msgError) {
        console.error('Failed to insert message:', msgError.message)
      }

      const { error: updateError } = await supabase
        .from('consultations')
        .update({
          last_message: message.length > 200 ? message.slice(0, 200) + '...' : message,
          last_message_at: new Date().toISOString(),
          unread_count: 1,
          status: 'active',
        })
        .eq('id', consultation.id)

      if (updateError) {
        console.error('Failed to update consultation:', updateError.message)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Consult send API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
