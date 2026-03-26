import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { message, history } = body

    if (!message) {
      return new Response(JSON.stringify({
        error: 'Message is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = getSupabase()

    if (supabase) {
      try {
        const { error } = await supabase
          .from('audit_logs')
          .insert({
            table_name: 'consultation',
            action: 'admin_handoff',
            new_values: {
              message,
              history: history || [],
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
            timestamp: new Date().toISOString()
          })
        })
      } catch {
        // notification is best effort
      }
    }

    return new Response(JSON.stringify({
      success: true
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
