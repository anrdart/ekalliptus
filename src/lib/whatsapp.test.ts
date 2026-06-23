import { describe, it, expect } from 'vitest'
import { WA_BUSINESS_NUMBER, WA_DISPLAY_PHONE, waLink } from './constants'
import { normalizeWhatsapp, isValidWhatsapp } from '../utils/whatsapp'

describe('whatsapp constants', () => {
  it('exposes a single business number', () => {
    expect(WA_BUSINESS_NUMBER).toBe('6281999900306')
    expect(WA_DISPLAY_PHONE).toBe('+62 819-9990-0306')
  })

  it('builds a wa.me link with optional text', () => {
    expect(waLink()).toBe('https://wa.me/6281999900306')
    expect(waLink('Halo')).toBe('https://wa.me/6281999900306?text=Halo')
    expect(waLink('Halo & selamat')).toBe('https://wa.me/6281999900306?text=Halo%20%26%20selamat')
  })
})

describe('normalizeWhatsapp', () => {
  it('converts leading 0 to 62', () => {
    // national form is 081999900306 (11 digits) → 6281999900306
    expect(normalizeWhatsapp('081999900306')).toBe('6281999900306')
  })
  it('keeps an already-international number', () => {
    expect(normalizeWhatsapp('6281999900306')).toBe('6281999900306')
  })
  it('strips non-digits', () => {
    expect(normalizeWhatsapp('+62 819-9990-0306')).toBe('6281999900306')
  })
})

describe('isValidWhatsapp', () => {
  it('accepts valid normalized numbers', () => {
    expect(isValidWhatsapp('6281999900306')).toBe(true)
    expect(isValidWhatsapp('081999900306')).toBe(true)
  })
  it('rejects too-short / empty', () => {
    expect(isValidWhatsapp('123')).toBe(false)
    expect(isValidWhatsapp('')).toBe(false)
  })
})
