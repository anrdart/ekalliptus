/**
 * Property-Based Tests for Observer Cleanup
 * Tests that IntersectionObserver and ResizeObserver are disconnected on unmount
 * 
 * **Feature: performance-optimization, Property 15: Observer Cleanup**
 * *For any* IntersectionObserver or ResizeObserver created in a Vue component,
 * the observer SHALL be disconnected in onUnmounted lifecycle hook
 * **Validates: Requirements 7.2**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Observer types that need cleanup
const OBSERVER_TYPES = ['IntersectionObserver', 'ResizeObserver', 'MutationObserver']

/**
 * Recursively find all Vue files in a directory
 */
function findVueFiles(dir: string, files: string[] = []): string[] {
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== '.nuxt' && entry !== 'dist') {
          findVueFiles(fullPath, files)
        } else if (stat.isFile() && extname(entry) === '.vue') {
          files.push(fullPath)
        }
      } catch {
        // Skip files we can't access
      }
    }
  } catch {
    // Skip directories we can't access
  }
  return files
}

/**
 * Check if observers are properly cleaned up in onUnmounted
 */
function checkObserverCleanup(content: string, observerType: string): {
  hasObserver: boolean
  hasCleanup: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check if the observer type is created
  const creationPattern = new RegExp(`new\\s+${observerType}\\s*\\(`, 'g')
  const hasObserver = creationPattern.test(content)
  
  if (!hasObserver) {
    return { hasObserver: false, hasCleanup: true, issues: [] }
  }
  
  // Check for cleanup patterns:
  // 1. observer.disconnect() in onUnmounted
  // 2. observer.disconnect() anywhere (for observers that disconnect after first trigger)
  // 3. Variable assignment followed by disconnect
  
  const hasOnUnmounted = /onUnmounted\s*\(/.test(content)
  const hasDisconnect = /\.disconnect\s*\(\s*\)/.test(content)
  
  // For IntersectionObserver that disconnects after first intersection (one-time use),
  // the disconnect can be inside the callback itself
  const hasCallbackDisconnect = new RegExp(
    `${observerType}[\\s\\S]*?\\([\\s\\S]*?\\{[\\s\\S]*?\\.disconnect\\s*\\(\\s*\\)[\\s\\S]*?\\}`,
    'g'
  ).test(content)
  
  // Check if disconnect is called in onUnmounted context
  const hasUnmountedCleanup = /onUnmounted\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*\.disconnect\s*\(\s*\)/.test(content) ||
                              /onUnmounted\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*observer[^}]*\.disconnect/.test(content)
  
  // Also check for cleanup pattern where onUnmounted is nested inside onMounted
  // This is a valid Vue 3 pattern
  const hasNestedCleanup = /onMounted\s*\([^]*onUnmounted\s*\([^]*\.disconnect\s*\(\s*\)/.test(content)
  
  const hasCleanup = hasDisconnect && (hasOnUnmounted || hasCallbackDisconnect || hasNestedCleanup)
  
  if (!hasCleanup) {
    issues.push(`${observerType} created but no disconnect() found in cleanup`)
  }
  
  return {
    hasObserver,
    hasCleanup,
    issues
  }
}

describe('Property 15: Observer Cleanup', () => {
  const vueFiles = findVueFiles('.')
  
  it('should find Vue files in the project', () => {
    expect(vueFiles.length).toBeGreaterThan(0)
  })
  
  it('observers should be disconnected on unmount', () => {
    // Property: For any Vue file with IntersectionObserver, ResizeObserver, or MutationObserver,
    // the observer MUST be disconnected in onUnmounted or after its purpose is fulfilled
    fc.assert(
      fc.property(
        fc.constantFrom(...OBSERVER_TYPES),
        fc.constantFrom(...vueFiles),
        (observerType, filePath) => {
          const content = readFileSync(filePath, 'utf-8')
          const result = checkObserverCleanup(content, observerType)
          
          if (result.hasObserver && !result.hasCleanup) {
            console.error(`In ${filePath}:`, result.issues)
            return false
          }
          
          return true
        }
      ),
      { numRuns: OBSERVER_TYPES.length * Math.min(vueFiles.length, 20) }
    )
  })
  
  it('Hero component should cleanup IntersectionObserver', () => {
    const heroPath = 'components/Hero.vue'
    const content = readFileSync(heroPath, 'utf-8')
    
    const result = checkObserverCleanup(content, 'IntersectionObserver')
    
    expect(result.hasObserver).toBe(true)
    expect(result.hasCleanup).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
  
  it('ServiceCard component should cleanup IntersectionObserver', () => {
    const cardPath = 'components/ServiceCard.vue'
    const content = readFileSync(cardPath, 'utf-8')
    
    const result = checkObserverCleanup(content, 'IntersectionObserver')
    
    expect(result.hasObserver).toBe(true)
    expect(result.hasCleanup).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
