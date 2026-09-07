// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('../lib/supabase', () => ({ getSupabase: vi.fn(() => null) }))
vi.mock('@ekalliptus/core', () => ({ createLead: vi.fn() }))
vi.mock('../lib/runtime-env', () => ({ readEnv: vi.fn(() => '') }))
import { POST as order } from '../pages/api/order'
import { POST as handoff } from '../pages/api/consult/admin'
import { POST as send } from '../pages/api/consult/send'
import { getSupabase } from '../lib/supabase'
const context = (body: unknown, session?: string) => ({
  request: new Request('https://ekalliptus.com/api/consult/admin', { method: 'POST', headers: { origin: 'https://ekalliptus.com', 'content-type': 'application/json', 'cf-connecting-ip': crypto.randomUUID() }, body: JSON.stringify(body) }),
  cookies: { get: () => session ? { value: session } : undefined, set: vi.fn() },
}) as any
beforeEach(() => vi.clearAllMocks())
it('rejects oversized order fields before accessing the DB', async () => {
  const response = await order(context({ customer_name: 'x'.repeat(121), description: 'A valid description', whatsapp: '081999900306', service_type: 'web' }))
  expect(response.status).toBe(400)
  expect(getSupabase).not.toHaveBeenCalled()
})
it('fails closed without privileged server configuration', async () => {
  const response = await order(context({ customer_name: 'Test', description: 'A valid description', whatsapp: '081999900306', service_type: 'web' }))
  expect(response.status).toBe(503)
  expect(getSupabase).toHaveBeenCalledWith(true)
})
it('does not claim handoff success without storage', async () => {
  const response = await handoff(context({ message: 'Hello' }))
  expect(response.status).toBe(503)
  expect(await response.json()).not.toHaveProperty('success', true)
})
it('rejects client-supplied victim session IDs without the server cookie', async () => {
  const response = await send(context({ session_id: crypto.randomUUID(), message: 'Hello' }))
  expect(response.status).toBe(403)
  expect(getSupabase).not.toHaveBeenCalled()
})
it('validates history entries before DB writes', async () => {
  const response = await handoff(context({ message: 'Hello', history: [null] }))
  expect(response.status).toBe(400)
  expect(getSupabase).not.toHaveBeenCalled()
})
