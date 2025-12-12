/**
 * Performance Utilities Composable
 * Provides debounce, throttle, and scheduling utilities for performance optimization
 * Requirements: 7.4, 7.5
 */

/**
 * Creates a debounced version of a function that delays execution
 * until after the specified delay has elapsed since the last call.
 * 
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cancel method
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }

  debouncedFn.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debouncedFn
}

/**
 * Creates a throttled version of a function that only executes
 * at most once per specified time limit.
 * 
 * @param fn - The function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function with cancel method
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttledFn = (...args: Parameters<T>): void => {
    const now = Date.now()
    const remaining = limit - (now - lastCall)

    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastCall = now
      fn(...args)
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = null
        fn(...args)
      }, remaining)
    }
  }

  throttledFn.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastCall = 0
  }

  return throttledFn
}

/**
 * Schedules a callback to run during browser idle time.
 * Falls back to setTimeout if requestIdleCallback is not available.
 * 
 * @param callback - The callback to execute during idle time
 * @param options - Optional configuration with timeout
 * @returns Cancel function to abort the scheduled task
 */
export function scheduleIdleTask(
  callback: () => void,
  options?: { timeout?: number }
): () => void {
  // Check if requestIdleCallback is available (not in SSR or older browsers)
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, options)
    return () => window.cancelIdleCallback(id)
  }

  // Fallback to setTimeout with a small delay
  const timeoutId = setTimeout(callback, options?.timeout ?? 1)
  return () => clearTimeout(timeoutId)
}

/**
 * Vue composable for performance utilities
 * Provides reactive debounce, throttle, and idle scheduling
 */
export function usePerformance() {
  return {
    debounce,
    throttle,
    scheduleIdleTask
  }
}

export default usePerformance
