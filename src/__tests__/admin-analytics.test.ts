import { describe, it, expect } from 'vitest'
import { buildDateBuckets, type Granularity } from '../lib/admin/analytics'

describe('analytics buildDateBuckets', () => {
  it('builds N daily buckets ending today', () => {
    const buckets = buildDateBuckets('2026-05-01', '2026-05-05', 'day')
    expect(buckets.length).toBe(5)
    expect(buckets[0]).toBe('2026-05-01')
    expect(buckets[4]).toBe('2026-05-05')
  })

  it('builds weekly buckets', () => {
    const buckets = buildDateBuckets('2026-04-01', '2026-04-30', 'week')
    expect(buckets.length).toBeGreaterThan(0)
    expect(buckets.every((b) => /^\d{4}-W\d{2}$/.test(b))).toBe(true)
  })

  it('builds monthly buckets', () => {
    const buckets = buildDateBuckets('2026-01-01', '2026-04-30', 'month')
    expect(buckets).toEqual(['2026-01', '2026-02', '2026-03', '2026-04'])
  })
})
