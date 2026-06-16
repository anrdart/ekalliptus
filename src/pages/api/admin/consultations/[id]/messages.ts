import type { APIRoute } from 'astro'
import { getSupabase } from '../../../../../lib/supabase'
import { requireAdmin } from '../../../../../lib/admin/auth'
import { writeAudit } from '../../../../../lib/admin/audit'
import type { ConsultationMessageInsert } from '../../../../../types/database'

export const POST: APIRoute = async (ctx) => {
  const guard = await requireAdmin(ctx)
  if (guard instanceof Response) return guard

  const { params, request } = ctx
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({ error: 'Consultation ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { content, sender_name = 'Admin' } = await request.json()

    if (typeof content !== 'string' || !content.trim()) {
      return new Response(JSON.stringify({ error: 'Message content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = getSupabase(true)

    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database connection failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('id, session_id')
      .eq('id', id)
      .single()

    if (consultationError || !consultation) {
      return new Response(JSON.stringify({ error: 'Consultation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const message: ConsultationMessageInsert = {
      consultation_id: consultation.id,
      session_id: consultation.session_id,
      sender_type: 'admin',
      sender_name,
      content: content.trim().slice(0, 2000),
      is_read: true
    }

    const { data: insertedMessage, error: insertError } = await supabase
      .from('consultation_messages')
      .insert(message)
      .select()
      .single()

    if (insertError || !insertedMessage) {
      console.error('Admin reply insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to send message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await supabase
      .from('consultations')
      .update({
        last_message: message.content,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        status: 'scheduled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    await writeAudit({
      user_id: guard.user.id,
      action: 'create',
      table_name: 'consultation_messages',
      record_id: insertedMessage.id,
      new_values: insertedMessage,
      ip_address: ctx.clientAddress,
      user_agent: ctx.request.headers.get('user-agent')
    })

    return new Response(JSON.stringify({ message: insertedMessage }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Admin consultation reply error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
