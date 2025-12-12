/**
 * Property-Based Tests for Modal Conditional Rendering
 * Tests that modal components use v-if directive for conditional rendering
 * 
 * **Feature: performance-optimization, Property 8: Modal Conditional Rendering**
 * *For any* modal component in Vue files, the modal content SHALL use v-if
 * directive for conditional rendering rather than v-show
 * **Validates: Requirements 4.4**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Patterns that indicate modal-like components
const MODAL_INDICATORS = [
  'modal',
  'dialog',
  'popup',
  'overlay',
  'drawer',
  'menu',
  'dropdown'
]

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
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== '.nuxt' && entry !== 'dist' && entry !== '__tests__') {
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
 * Extract template content from Vue file
 */
function extractTemplate(content: string): string {
  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
  return templateMatch ? templateMatch[1] : ''
}

/**
 * Check if content contains modal-related patterns
 */
function containsModalPattern(content: string): boolean {
  const lowerContent = content.toLowerCase()
  return MODAL_INDICATORS.some(indicator => lowerContent.includes(indicator))
}

/**
 * Find v-show usages that might be on modal-like elements
 */
function findVShowOnModals(content: string): {
  found: boolean
  issues: { line: number; context: string }[]
} {
  const issues: { line: number; context: string }[] = []
  const template = extractTemplate(content)
  
  if (!template) {
    return { found: false, issues }
  }
  
  const lines = template.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()
    
    // Check if line has v-show
    if (line.includes('v-show')) {
      // Check surrounding context for modal indicators
      const contextStart = Math.max(0, i - 5)
      const contextEnd = Math.min(lines.length, i + 5)
      const context = lines.slice(contextStart, contextEnd).join('\n').toLowerCase()
      
      // Check if this v-show is related to a modal
      const isModalRelated = MODAL_INDICATORS.some(indicator => {
        // Check if the indicator is in the context
        return context.includes(indicator)
      })
      
      if (isModalRelated) {
        issues.push({
          line: i + 1,
          context: line.trim()
        })
      }
    }
  }
  
  return {
    found: issues.length > 0,
    issues
  }
}

/**
 * Check if modals use v-if correctly
 */
function checkModalRendering(filePath: string): {
  valid: boolean
  hasModals: boolean
  usesVIf: boolean
  usesVShow: boolean
  issues: string[]
} {
  const content = readFileSync(filePath, 'utf-8')
  const template = extractTemplate(content)
  const issues: string[] = []
  
  // Check if file has modal-related content
  const hasModals = containsModalPattern(template)
  
  if (!hasModals) {
    return {
      valid: true,
      hasModals: false,
      usesVIf: false,
      usesVShow: false,
      issues
    }
  }
  
  // Check for v-show usage on modals
  const vShowResult = findVShowOnModals(content)
  
  // Check for v-if usage (expected for modals)
  const usesVIf = template.includes('v-if')
  const usesVShow = template.includes('v-show')
  
  if (vShowResult.found) {
    for (const issue of vShowResult.issues) {
      issues.push(`Line ${issue.line}: Modal-related element uses v-show instead of v-if: "${issue.context}"`)
    }
  }
  
  return {
    valid: !vShowResult.found,
    hasModals,
    usesVIf,
    usesVShow,
    issues
  }
}

describe('Property 8: Modal Conditional Rendering', () => {
  // Get all Vue files
  const componentFiles = findVueFiles('components')
  const pageFiles = findVueFiles('pages')
  const allVueFiles = [...componentFiles, ...pageFiles]
  
  it('should find Vue files in the project', () => {
    expect(allVueFiles.length).toBeGreaterThan(0)
  })
  
  it('modal components should use v-if for conditional rendering', () => {
    // Property: For any Vue file with modal-like components,
    // those modals MUST use v-if instead of v-show
    fc.assert(
      fc.property(
        fc.constantFrom(...allVueFiles),
        (filePath) => {
          const result = checkModalRendering(filePath)
          
          if (!result.valid) {
            console.error(`\nIn ${filePath}:`)
            for (const issue of result.issues) {
              console.error(`  ${issue}`)
            }
            return false
          }
          
          return true
        }
      ),
      { numRuns: allVueFiles.length }
    )
  })
  
  it('Navigation component should use v-if for mobile menu and language modal', () => {
    const navPath = 'components/Navigation.vue'
    const content = readFileSync(navPath, 'utf-8')
    const template = extractTemplate(content)
    
    // Check that mobile menu uses v-if
    const mobileMenuVIf = template.includes('v-if="menuOpen"')
    expect(mobileMenuVIf).toBe(true)
    
    // Check that language modal uses v-if
    const languageModalVIf = template.includes('v-if="languageModalOpen"')
    expect(languageModalVIf).toBe(true)
    
    // Ensure no v-show is used for these modals
    const mobileMenuVShow = template.includes('v-show="menuOpen"')
    const languageModalVShow = template.includes('v-show="languageModalOpen"')
    
    expect(mobileMenuVShow).toBe(false)
    expect(languageModalVShow).toBe(false)
  })
  
  it('no Vue file should use v-show for modal-like elements', () => {
    // Property: For any Vue file, v-show should not be used on modal elements
    let totalVShowOnModals = 0
    
    for (const filePath of allVueFiles) {
      const result = checkModalRendering(filePath)
      if (!result.valid) {
        totalVShowOnModals += result.issues.length
      }
    }
    
    expect(totalVShowOnModals).toBe(0)
  })
})
