import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'
import type { ConsultationMessage } from '../../../types/database'

export const GET: APIRoute = async () => {
  try {
    const supabase = getSupabase(true)

    if (!supabase) {
      return new Response(JSON.stringify({ consultations: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data: consultations, error } = await supabase
      .from('consultations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(50)

    if (error) {
      if (error.code === '42703' || error.code === '42P01') {
        console.warn('Consultation chat migration has not been applied yet:', error.message)
        return new Response(JSON.stringify({
          consultations: [],
          needsMigration: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      console.error('Consultations fetch error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch consultations' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const ids = (consultations || []).map((item) => item.id)
    const { data: messages, error: messagesError } = ids.length > 0
      ? await supabase
          .from('consultation_messages')
          .select('*')
          .in('consultation_id', ids)
          .order('created_at', { ascending: true })
      : { data: [], error: null }

    if (messagesError) {
      console.error('Consultation messages fetch error:', messagesError)
    }

    const messagesByConsultation = new Map<string, ConsultationMessage[]>()
    for (const message of messages || []) {
      const existing = messagesByConsultation.get(message.consultation_id) || []
      existing.push(message)
      messagesByConsultation.set(message.consultation_id, existing)
    }

    return new Response(JSON.stringify({
      consultations: (consultations || []).map((consultation) => ({
        ...consultation,
        messages: messagesByConsultation.get(consultation.id) || []
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Consultations API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
