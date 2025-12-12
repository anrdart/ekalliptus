/**
 * Property-Based Tests for Performance Utilities
 * Tests correctness properties for debounce and throttle functions using fast-check
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { debounce, throttle, scheduleIdleTask } from '../usePerformance'

/**
 * **Feature: performance-optimization, Property 16: Debounce/Throttle Usage**
 * *For any* resize, scroll, or input event handler that performs expensive operations,
 * the handler SHALL use debounce or throttle
 * **Validates: Requirements 7.4**
 */
describe('Property 16: Debounce/Throttle Usage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('debounce function', () => {
    it('debounced function should not execute immediately', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 1000 }), // delay in ms
          (delay) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const debouncedFn = debounce(fn, delay)

            debouncedFn()
            
            // Should not have been called yet
            return callCount === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('debounced function should execute after delay', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 1000 }), // delay in ms
          (delay) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const debouncedFn = debounce(fn, delay)

            debouncedFn()
            vi.advanceTimersByTime(delay + 1)
            
            // Should have been called exactly once
            return callCount === 1
          }
        ),
        { numRuns: 100 }
      )
    })

    it('multiple rapid calls should result in single execution', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }), // delay in ms
          fc.integer({ min: 2, max: 20 }), // number of calls
          (delay, numCalls) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const debouncedFn = debounce(fn, delay)

            // Make multiple rapid calls
            for (let i = 0; i < numCalls; i++) {
              debouncedFn()
              vi.advanceTimersByTime(delay / 2) // Advance less than delay
            }
            
            // Advance past the final delay
            vi.advanceTimersByTime(delay + 1)
            
            // Should have been called exactly once
            return callCount === 1
          }
        ),
        { numRuns: 100 }
      )
    })

    it('debounce should preserve function arguments', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }), // delay
          fc.string(), // argument to pass
          (delay, arg) => {
            let receivedArg: string | undefined
            const fn = (value: string) => { receivedArg = value }
            const debouncedFn = debounce(fn, delay)

            debouncedFn(arg)
            vi.advanceTimersByTime(delay + 1)
            
            return receivedArg === arg
          }
        ),
        { numRuns: 100 }
      )
    })

    it('cancel should prevent execution', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }), // delay
          (delay) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const debouncedFn = debounce(fn, delay)

            debouncedFn()
            debouncedFn.cancel()
            vi.advanceTimersByTime(delay + 1)
            
            // Should not have been called
            return callCount === 0
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('throttle function', () => {
    it('throttled function should execute immediately on first call', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 1000 }), // limit in ms
          (limit) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const throttledFn = throttle(fn, limit)

            throttledFn()
            
            // Should have been called immediately
            return callCount === 1
          }
        ),
        { numRuns: 100 }
      )
    })

    it('throttled function should not execute again within limit', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 500 }), // limit in ms
          (limit) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const throttledFn = throttle(fn, limit)

            throttledFn() // First call - executes immediately
            throttledFn() // Second call - should be throttled
            
            // Should have been called only once
            return callCount === 1
          }
        ),
        { numRuns: 100 }
      )
    })

    it('throttled function should execute again after limit expires', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }), // limit in ms
          (limit) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const throttledFn = throttle(fn, limit)

            throttledFn() // First call
            vi.advanceTimersByTime(limit + 1)
            throttledFn() // Second call after limit
            
            // Should have been called twice
            return callCount === 2
          }
        ),
        { numRuns: 100 }
      )
    })

    it('throttle should preserve function arguments', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }), // limit
          fc.string(), // argument to pass
          (limit, arg) => {
            let receivedArg: string | undefined
            const fn = (value: string) => { receivedArg = value }
            const throttledFn = throttle(fn, limit)

            throttledFn(arg)
            
            return receivedArg === arg
          }
        ),
        { numRuns: 100 }
      )
    })

    it('trailing call should execute after limit', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 500 }), // limit in ms
          (limit) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const throttledFn = throttle(fn, limit)

            throttledFn() // First call - executes immediately
            throttledFn() // Second call - scheduled for later
            
            vi.advanceTimersByTime(limit + 1)
            
            // Should have been called twice (immediate + trailing)
            return callCount === 2
          }
        ),
        { numRuns: 100 }
      )
    })

    it('cancel should prevent pending execution', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 500 }), // limit
          (limit) => {
            let callCount = 0
            const fn = () => { callCount++ }
            const throttledFn = throttle(fn, limit)

            throttledFn() // First call - executes immediately
            throttledFn() // Second call - scheduled
            throttledFn.cancel()
            vi.advanceTimersByTime(limit + 1)
            
            // Should have been called only once (the immediate call)
            return callCount === 1
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('scheduleIdleTask function', () => {
    it('scheduleIdleTask should execute callback', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // timeout
          (timeout) => {
            let executed = false
            const callback = () => { executed = true }
            
            scheduleIdleTask(callback, { timeout })
            vi.advanceTimersByTime(timeout + 1)
            
            return executed === true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('cancel function should prevent execution', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }), // timeout
          (timeout) => {
            let executed = false
            const callback = () => { executed = true }
            
            const cancel = scheduleIdleTask(callback, { timeout })
            cancel()
            vi.advanceTimersByTime(timeout + 1)
            
            return executed === false
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
