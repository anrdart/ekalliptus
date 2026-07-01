import { getSupabase } from '../supabase'
import type { Voucher, VoucherInsert } from '../types'

export async function listVouchers(): Promise<Voucher[]> {
  const supabase = getSupabase(true)
  if (!supabase) return []
  const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Voucher[]
}

export async function createVoucher(payload: VoucherInsert): Promise<Voucher | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const { data } = await supabase.from('vouchers').insert({ ...payload, code: payload.code.toUpperCase() }).select().single()
  return (data as Voucher) ?? null
}

export async function updateVoucher(code: string, payload: Partial<VoucherInsert>): Promise<Voucher | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const { data } = await supabase.from('vouchers').update(payload).eq('code', code.toUpperCase()).select().single()
  return (data as Voucher) ?? null
}

export async function deleteVoucher(code: string): Promise<boolean> {
  const supabase = getSupabase(true)
  if (!supabase) return false
  const { error } = await supabase.from('vouchers').delete().eq('code', code.toUpperCase())
  return !error
}

export async function getVoucher(code: string): Promise<Voucher | null> {
  const supabase = getSupabase(true)
  if (!supabase) return null
  const { data } = await supabase.from('vouchers').select('*').eq('code', code.toUpperCase()).single()
  return (data as Voucher) ?? null
}
