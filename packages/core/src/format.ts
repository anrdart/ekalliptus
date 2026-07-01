/**
 * Shared formatting helpers.
 *
 * Consolidates the IDR currency + date formatters that were duplicated inline
 * across 10+ admin pages and components (orders, customers, payments, pipeline,
 * reports, RevenueChart, dashboard API, …). Single source of truth for
 * id-ID locale formatting so the look stays consistent everywhere.
 */

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Full IDR currency, e.g. "Rp 1.500.000". */
export function formatIDR(amount: number | null | undefined): string {
  return idrFormatter.format(Number(amount ?? 0))
}

/**
 * Compact IDR, e.g. "Rp 1,5jt" / "Rp 12rb" / "Rp 500".
 * Mirrors the previous inline `fmtShort` used in RevenueChart so chart axes
 * and KPI tiles read identically.
 */
export function formatIDRShort(amount: number | null | undefined): string {
  const n = Number(amount ?? 0)
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `Rp ${trimZero(n / 1_000_000_000)}M`
  if (abs >= 1_000_000) return `Rp ${trimZero(n / 1_000_000)}jt`
  if (abs >= 1_000) return `Rp ${trimZero(n / 1_000)}rb`
  return `Rp ${Math.round(n)}`
}

function trimZero(value: number): string {
  // One decimal, but drop a trailing ".0" (1.0 → "1", 1.5 → "1,5").
  const s = value.toFixed(1).replace(/\.0$/, '')
  return s.replace('.', ',')
}

/** Number with thousands separators, e.g. "12.345". */
export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat('id-ID').format(Number(value ?? 0))
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function toDate(input: string | number | Date | null | undefined): Date | null {
  if (input == null) return null
  const d = input instanceof Date ? input : new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Date only, e.g. "16 Jun 2026". Empty string for invalid input. */
export function formatDate(input: string | number | Date | null | undefined): string {
  const d = toDate(input)
  return d ? dateFormatter.format(d) : ''
}

/** Date + time, e.g. "16 Jun 2026 14.30". */
export function formatDateTime(input: string | number | Date | null | undefined): string {
  const d = toDate(input)
  return d ? dateTimeFormatter.format(d) : ''
}

/**
 * Relative time in Indonesian, e.g. "baru saja", "5 menit lalu", "2 hari lalu".
 * Falls back to an absolute date beyond ~30 days.
 */
export function formatRelative(input: string | number | Date | null | undefined): string {
  const d = toDate(input)
  if (!d) return ''
  const diffMs = d.getTime() - Date.now()
  const past = diffMs <= 0
  const sec = Math.round(Math.abs(diffMs) / 1000)
  if (sec < 45) return 'baru saja'
  const min = Math.round(sec / 60)
  if (min < 60) return past ? `${min} menit lalu` : `dalam ${min} menit`
  const hour = Math.round(min / 60)
  if (hour < 24) return past ? `${hour} jam lalu` : `dalam ${hour} jam`
  const day = Math.round(hour / 24)
  if (day <= 30) return past ? `${day} hari lalu` : `dalam ${day} hari`
  return formatDate(d)
}
