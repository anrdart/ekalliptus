import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'
import type { ConsultationMessageInsert } from '../../../types/database'
import { createLead } from '@ekalliptus/core'
import { readEnv } from '../../../lib/runtime-env'

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

    const supabase = getSupabase(true)

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
            status: 'scheduled',
            last_message: lastMessage,
            last_message_at: new Date().toISOString(),
            unread_count: 1,
          }, { onConflict: 'session_id' })
          .select()
          .single()

        if (!consultError && consultation) {
          // Auto-create lead from consultation handoff (non-blocking, with dedup by whatsapp)
          try {
            const whatsapp = body.whatsapp || null
            let shouldCreate = true
            if (whatsapp) {
              const { data: existing } = await supabase!
                .from('leads')
                .select('id, stage')
                .eq('whatsapp', whatsapp)
                .not('stage', 'in', '("won","lost")')
                .limit(1)
              if (existing && existing.length > 0) shouldCreate = false
            }
            if (shouldCreate) {
              await createLead({
                name: visitorName !== 'Pengunjung' ? visitorName : 'Visitor',
                whatsapp: whatsapp,
                email: body.email || null,
                service_interest: null,
                stage: 'contacted',
                source: 'consultation',
                consultation_id: consultation.id,
                notes: 'Auto-created from consultation handoff'
              })
            }
          } catch (err) {
            console.error('[consult/admin] Auto-create lead failed:', err)
          }

          const messagesToInsert: ConsultationMessageInsert[] = []

          if (history && Array.isArray(history)) {
            for (const entry of history) {
              const senderType = entry.role === 'assistant' ? 'bot' : 'visitor'
              const content = typeof entry.content === 'string' ? entry.content : ''
              if (content) {
                messagesToInsert.push({
                  consultation_id: consultation.id,
                  session_id: sessionId,
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
              session_id: sessionId,
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
            table_name: 'consultations',
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

    const supabaseUrl = readEnv('SUPABASE_URL') || ''
    const supabaseAnonKey = readEnv('SUPABASE_ANON_KEY') || ''

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const parsed = new URL(supabaseUrl)
        if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')) {
          await fetch(`${parsed.origin}/functions/v1/notify-admin`, {
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
        }
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
