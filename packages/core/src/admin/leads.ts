import { getSupabase } from '../supabase'
import type { Lead, LeadInsert, LeadUpdate, LeadStage } from '../types'

export const LEAD_STAGE_ORDER: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: 'Baru',
  contacted: 'Dihubungi',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negosiasi',
  won: 'Won',
  lost: 'Lost'
}

export function isValidStageTransition(from: LeadStage, to: LeadStage): boolean {
  if (to === 'lost') return from !== 'won' && from !== 'lost'
  if (from === 'won' || from === 'lost') return false
  return true
}

export async function listLeadsByStage(): Promise<Record<LeadStage, Lead[]>> {
  const supabase = getSupabase(true)
  const empty = Object.fromEntries(LEAD_STAGE_ORDER.map((s) => [s, []])) as unknown as Record<LeadStage, Lead[]>
  if (!supabase) return empty

  const { data } = await supabase.from('leads').select('*').order('updated_at', { ascending: false })
  for (const lead of data ?? []) {
    empty[lead.stage].push(lead as Lead)
  }
  return empty
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const { data } = await supabase.from('leads').select('*').eq('id', id).single()
  return (data as Lead) ?? null
}

export async function createLead(payload: LeadInsert): Promise<Lead | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const { data } = await supabase.from('leads').insert(payload).select().single()
  return (data as Lead) ?? null
}

export async function updateLead(id: string, payload: LeadUpdate): Promise<Lead | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  if (payload.stage === 'won' || payload.stage === 'lost') {
    payload.closed_at = new Date().toISOString()
  }
  const { data } = await supabase.from('leads').update(payload).eq('id', id).select().single()
  return (data as Lead) ?? null
}

export async function deleteLead(id: string): Promise<boolean> {
  const supabase = getSupabase(true)
  if (!supabase) return false
  const { error } = await supabase.from('leads').delete().eq('id', id)
  return !error
}

export async function countLeadsByStage(): Promise<Record<LeadStage, number>> {
  const supabase = getSupabase(true)
  const empty = Object.fromEntries(LEAD_STAGE_ORDER.map((s) => [s, 0])) as unknown as Record<LeadStage, number>
  if (!supabase) return empty
  const { data } = await supabase.from('leads').select('stage')
  for (const row of data ?? []) empty[row.stage as LeadStage] += 1
  return empty
}

export async function totalEstimatedValueOpen(): Promise<number> {
  const supabase = getSupabase(true)
  if (!supabase) return 0
  const { data } = await supabase
    .from('leads')
    .select('estimated_value')
    .not('stage', 'in', '("won","lost")')
  return (data ?? []).reduce((sum, r) => sum + Number(r.estimated_value ?? 0), 0)
}
