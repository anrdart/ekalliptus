/** Shared client/server WhatsApp helpers. No DOM dependencies. */

/** Strip non-digits and coerce to 62-prefixed international form. */
export function normalizeWhatsapp(input: string): string {
  let cleaned = (input || '').replace(/\D/g, '')
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1)
  if (!cleaned.startsWith('62')) cleaned = '62' + cleaned
  return cleaned
}

/** Loose validation: 9–15 digits after normalization. */
export function isValidWhatsapp(input: string): boolean {
  const normalized = normalizeWhatsapp(input)
  const digits = normalized.replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 15
}
