import { describe, it, expect } from 'vitest'
import { isValidStageTransition, LEAD_STAGE_ORDER } from '../lib/admin/leads'

describe('lead stage transitions', () => {
  it('always allows moving to lost', () => {
    expect(isValidStageTransition('new', 'lost')).toBe(true)
    expect(isValidStageTransition('proposal', 'lost')).toBe(true)
  })

  it('allows forward progression', () => {
    expect(isValidStageTransition('new', 'contacted')).toBe(true)
    expect(isValidStageTransition('contacted', 'qualified')).toBe(true)
  })

  it('allows skipping ahead one or more stages', () => {
    expect(isValidStageTransition('new', 'proposal')).toBe(true)
  })

  it('allows backward movement (rare but valid)', () => {
    expect(isValidStageTransition('proposal', 'qualified')).toBe(true)
  })

  it('rejects revival from won/lost', () => {
    expect(isValidStageTransition('won', 'proposal')).toBe(false)
    expect(isValidStageTransition('lost', 'new')).toBe(false)
  })

  it('exposes a stable order', () => {
    expect(LEAD_STAGE_ORDER).toContain('new')
    expect(LEAD_STAGE_ORDER[0]).toBe('new')
  })
})
