import { describe, it, expect } from 'vitest'
import { isProtectedPath, isLoginPath } from '../middleware'

describe('admin middleware path matching', () => {
  it('protects /admin and /admin/* but not /admin/login', () => {
    expect(isProtectedPath('/admin')).toBe(true)
    expect(isProtectedPath('/admin/orders')).toBe(true)
    expect(isProtectedPath('/admin/customers/123')).toBe(true)
    expect(isProtectedPath('/admin/login')).toBe(false)
  })
  it('protects /api/admin/* but not /api/admin/login', () => {
    expect(isProtectedPath('/api/admin/dashboard')).toBe(true)
    expect(isProtectedPath('/api/admin/login')).toBe(false)
  })
  it('does not protect public routes', () => {
    expect(isProtectedPath('/')).toBe(false)
    expect(isProtectedPath('/blog/post-slug')).toBe(false)
    expect(isProtectedPath('/api/order')).toBe(false)
  })
  it('identifies the login page', () => {
    expect(isLoginPath('/admin/login')).toBe(true)
    expect(isLoginPath('/admin')).toBe(false)
  })
})
