import { describe, it, expect } from 'vitest'
import { encodeCustomerId, decodeCustomerId } from '../lib/admin/customers'

describe('customer identity encoding', () => {
  it('round-trips a whatsapp number with +', () => {
    const id = encodeCustomerId('+6281234567890')
    expect(typeof id).toBe('string')
    expect(decodeCustomerId(id!)).toBe('+6281234567890')
  })
  it('returns null for empty input', () => {
    expect(encodeCustomerId('')).toBeNull()
    expect(decodeCustomerId('')).toBeNull()
  })
  it('encoding is URL-safe', () => {
    const id = encodeCustomerId('+62 812-3456-7890')
    expect(id).not.toContain(' ')
    expect(id).not.toContain('+')
  })
})
