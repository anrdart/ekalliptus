import { describe, it, expect } from 'vitest'
import { ADMIN_COOKIE_NAME, parseSessionCookie } from '../lib/admin/auth'

describe('admin auth helpers', () => {
  it('exposes a stable cookie name', () => {
    expect(ADMIN_COOKIE_NAME).toBe('admin_session')
  })

  it('returns null when no cookie header is present', () => {
    expect(parseSessionCookie(null)).toBeNull()
    expect(parseSessionCookie('')).toBeNull()
  })

  it('extracts the admin session value from a cookie header', () => {
    const header = 'theme=dark; admin_session=abc123; lang=id'
    expect(parseSessionCookie(header)).toBe('abc123')
  })

  it('returns null when admin_session is absent', () => {
    expect(parseSessionCookie('theme=dark; lang=id')).toBeNull()
  })
})
