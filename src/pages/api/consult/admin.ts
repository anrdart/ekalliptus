import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { message, history, session_id, visitor_name } = body

    if (!message) {
      return new Response(JSON.stringify({
        error: 'Message is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = getSupabase()

    const sessionId = session_id || crypto.randomUUID()

    if (supabase) {
      try {
        const visitorName = visitor_name || 'Pengunjung'
        const lastMessage = message.length > 200 ? message.slice(0, 200) + '...' : message

        const { data: consultation, error: consultError } = await supabase
          .from('consultations')
          .upsert({
            session_id: sessionId,
            visitor_name: visitorName,
            status: 'active',
            last_message: lastMessage,
            last_message_at: new Date().toISOString(),
            unread_count: 1,
          }, { onConflict: 'session_id' })
          .select()
          .single()

        if (!consultError && consultation) {
          const messagesToInsert = []

          if (history && Array.isArray(history)) {
            for (const entry of history) {
              const senderType = entry.role === 'assistant' ? 'bot' : 'visitor'
              const content = typeof entry.content === 'string' ? entry.content : ''
              if (content) {
                messagesToInsert.push({
                  consultation_id: consultation.id,
                  sender_type: senderType,
                  sender_name: senderType === 'bot' ? 'eBot' : visitorName,
                  content: content.slice(0, 2000),
                })
              }
            }
          }

          if (message) {
            messagesToInsert.push({
              consultation_id: consultation.id,
              sender_type: 'visitor',
              sender_name: visitorName,
              content: message.slice(0, 2000),
            })
          }

          if (messagesToInsert.length > 0) {
            await supabase
              .from('consultation_messages')
              .insert(messagesToInsert)
          }
        }
      } catch (err) {
        console.error('Failed to create consultation:', err)
      }

      try {
        const { error } = await supabase
          .from('audit_logs')
          .insert({
            table_name: 'consultation',
            action: 'admin_handoff',
            new_values: {
              message,
              history: history || [],
              session_id: sessionId,
              timestamp: new Date().toISOString()
            } as any
          })

        if (error) {
          console.error('Failed to log admin handoff:', error.message)
        }
      } catch {
        // logging is best effort
      }
    }

    const supabaseUrl = import.meta.env.SUPABASE_URL || ''
    const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || ''

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/notify-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            type: 'consultation_handoff',
            message,
            session_id: sessionId,
            timestamp: new Date().toISOString()
          })
        })
      } catch {
        // notification is best effort
      }
    }

    return new Response(JSON.stringify({
      success: true,
      session_id: sessionId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Admin consult API error:', error)
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
