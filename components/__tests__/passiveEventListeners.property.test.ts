/**
 * Property-Based Tests for Passive Event Listeners
 * Tests that scroll, touchstart, and touchmove event listeners use passive option
 * 
 * **Feature: performance-optimization, Property 14: Passive Event Listeners**
 * *For any* scroll, touchstart, or touchmove event listener in Vue components,
 * the listener SHALL use the passive option
 * **Validates: Requirements 7.1**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Events that should use passive listeners for performance
const PASSIVE_EVENTS = ['scroll', 'touchstart', 'touchmove', 'wheel']

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
 * Check if event listeners for scroll/touch events use passive option
 */
function checkPassiveListeners(content: string, eventType: string): {
  hasListener: boolean
  usesPassive: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Pattern to match addEventListener calls for the specific event type
  // Matches: addEventListener('scroll', handler) or addEventListener("scroll", handler)
  const listenerPattern = new RegExp(
    `addEventListener\\s*\\(\\s*['"]${eventType}['"]\\s*,\\s*[^,)]+(?:,\\s*([^)]+))?\\)`,
    'g'
  )
  
  const matches = content.matchAll(listenerPattern)
  let hasListener = false
  let allUsePassive = true
  
  for (const match of matches) {
    hasListener = true
    const options = match[1] || ''
    
    // Check if passive: true is in the options
    // Options can be: { passive: true }, { passive: true, ... }, or just true (for capture)
    const hasPassiveOption = /passive\s*:\s*true/.test(options) || 
                            /\{\s*passive\s*\}/.test(options) // shorthand { passive }
    
    if (!hasPassiveOption) {
      allUsePassive = false
      issues.push(`addEventListener('${eventType}', ...) missing { passive: true } option`)
    }
  }
  
  return {
    hasListener,
    usesPassive: !hasListener || allUsePassive,
    issues
  }
}

describe('Property 14: Passive Event Listeners', () => {
  const vueFiles = findVueFiles('.')
  
  it('should find Vue files in the project', () => {
    expect(vueFiles.length).toBeGreaterThan(0)
  })
  
  it('scroll/touch/wheel event listeners should use passive option', () => {
    // Property: For any Vue file with scroll, touchstart, touchmove, or wheel listeners,
    // the listener MUST use { passive: true } option
    fc.assert(
      fc.property(
        fc.constantFrom(...PASSIVE_EVENTS),
        fc.constantFrom(...vueFiles),
        (eventType, filePath) => {
          const content = readFileSync(filePath, 'utf-8')
          const result = checkPassiveListeners(content, eventType)
          
          if (result.hasListener && !result.usesPassive) {
            console.error(`In ${filePath}:`, result.issues)
            return false
          }
          
          return true
        }
      ),
      { numRuns: PASSIVE_EVENTS.length * Math.min(vueFiles.length, 20) }
    )
  })
  
  it('Navigation component should have passive scroll listener', () => {
    const navPath = 'components/Navigation.vue'
    const content = readFileSync(navPath, 'utf-8')
    
    // Verify scroll listener exists and uses passive
    const result = checkPassiveListeners(content, 'scroll')
    
    expect(result.hasListener).toBe(true)
    expect(result.usesPassive).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
