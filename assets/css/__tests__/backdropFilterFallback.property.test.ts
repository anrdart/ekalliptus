/**
 * Property-Based Tests for Backdrop Filter Fallback
 * Tests that CSS rules using backdrop-filter include fallback backgrounds
 * 
 * **Feature: performance-optimization, Property 12: Backdrop Filter Fallback**
 * *For any* CSS rule using backdrop-filter, the rule SHALL include a fallback
 * background color for unsupported browsers
 * **Validates: Requirements 5.5**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Parse CSS rules that use backdrop-filter
 */
function parseBackdropFilterRules(cssContent: string): { selector: string; content: string }[] {
  const rules: { selector: string; content: string }[] = []
  
  // Match CSS rules containing backdrop-filter (excluding @supports blocks)
  // We need to find rules that have backdrop-filter but are NOT inside @supports
  const ruleRegex = /([.#\w\-\[\]="':,\s>+~]+)\s*\{([^{}]*backdrop-filter[^{}]*)\}/gi
  let match

  while ((match = ruleRegex.exec(cssContent)) !== null) {
    const selector = match[1].trim()
    const content = match[2]
    
    // Skip if this is inside an @supports block (we'll handle those separately)
    // Check if backdrop-filter appears with -webkit prefix (inside @supports)
    if (!content.includes('-webkit-backdrop-filter')) {
      rules.push({ selector, content })
    }
  }

  return rules
}

/**
 * Parse @supports blocks for backdrop-filter
 */
function parseSupportsBlocks(cssContent: string): { condition: string; content: string }[] {
  const blocks: { condition: string; content: string }[] = []
  
  // Match @supports with backdrop-filter condition
  // This regex finds @supports followed by any condition containing backdrop-filter
  // It handles: @supports (backdrop-filter: ...) or (-webkit-backdrop-filter: ...)
  const supportsRegex = /@supports\s+([^{]*backdrop-filter[^{]*)\s*\{/gi
  let match

  while ((match = supportsRegex.exec(cssContent)) !== null) {
    const condition = match[1].trim()
    const startIndex = match.index + match[0].length
    
    // Find the matching closing brace by counting braces
    let braceCount = 1
    let endIndex = startIndex
    
    while (braceCount > 0 && endIndex < cssContent.length) {
      if (cssContent[endIndex] === '{') braceCount++
      if (cssContent[endIndex] === '}') braceCount--
      endIndex++
    }
    
    const content = cssContent.substring(startIndex, endIndex - 1)
    blocks.push({ condition, content })
  }

  return blocks
}

/**
 * Check if a CSS rule has a background fallback before @supports
 */
function hasBackgroundFallback(cssContent: string, selector: string): boolean {
  // Find the base rule (without @supports) for this selector
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const baseRuleRegex = new RegExp(
    `${escapedSelector}\\s*\\{([^}]*)\\}`,
    'gi'
  )
  
  let match
  while ((match = baseRuleRegex.exec(cssContent)) !== null) {
    const ruleContent = match[1]
    
    // Check if this rule has a background property (fallback)
    // and is NOT inside @supports
    const beforeMatch = cssContent.substring(0, match.index)
    const lastSupports = beforeMatch.lastIndexOf('@supports')
    const lastCloseBrace = beforeMatch.lastIndexOf('}')
    
    // If @supports appears after the last closing brace, we're inside @supports
    if (lastSupports > lastCloseBrace) {
      continue
    }
    
    // Check for background fallback
    if (/background\s*:/i.test(ruleContent)) {
      return true
    }
  }
  
  return false
}

/**
 * Validate that all backdrop-filter usages have fallbacks
 * The pattern should be:
 * 1. Base rule with background fallback
 * 2. @supports block with backdrop-filter enhancement
 */
function validateBackdropFilterFallbacks(cssContent: string): {
  valid: boolean
  violations: string[]
  validRules: string[]
} {
  const violations: string[] = []
  const validRules: string[] = []
  
  // Find all @supports blocks with backdrop-filter
  const supportsBlocks = parseSupportsBlocks(cssContent)
  
  // For each @supports block, find the selectors inside
  for (const block of supportsBlocks) {
    const selectorRegex = /([.#\w\-\[\]="':,\s>+~]+)\s*\{/gi
    let match
    
    while ((match = selectorRegex.exec(block.content)) !== null) {
      const selector = match[1].trim()
      
      // Check if there's a fallback rule for this selector
      if (hasBackgroundFallback(cssContent, selector)) {
        validRules.push(selector)
      } else {
        violations.push(`Selector '${selector}' uses backdrop-filter in @supports but has no background fallback`)
      }
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
    validRules
  }
}

/**
 * Get all CSS files in the assets directory
 */
function getCssFiles(): string[] {
  const cssDir = path.resolve(__dirname, '..')
  const files: string[] = []
  
  function walkDir(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory() && entry.name !== '__tests__' && entry.name !== 'node_modules') {
          walkDir(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.css')) {
          files.push(fullPath)
        }
      }
    } catch {
      // Skip directories we can't access
    }
  }
  
  walkDir(cssDir)
  return files
}

describe('Property 12: Backdrop Filter Fallback', () => {
  describe('parseSupportsBlocks', () => {
    it('should correctly parse @supports blocks with backdrop-filter', () => {
      const cssContent = `
        .glass {
          background: rgba(255, 255, 255, 0.9);
        }
        
        @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
          .glass {
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(10px);
          }
        }
      `
      const blocks = parseSupportsBlocks(cssContent)
      expect(blocks.length).toBe(1)
      expect(blocks[0].condition).toContain('backdrop-filter')
    })

    it('should parse multiple @supports blocks', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (count) => {
            let cssContent = ''
            for (let i = 0; i < count; i++) {
              cssContent += `
                .glass${i} { background: white; }
                @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
                  .glass${i} { backdrop-filter: blur(10px); }
                }
              `
            }
            const blocks = parseSupportsBlocks(cssContent)
            return blocks.length === count
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('hasBackgroundFallback', () => {
    it('should detect background fallback in base rule', () => {
      const cssContent = `
        .glass-panel {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--glass-border));
        }
        
        @supports (backdrop-filter: blur(1px)) {
          .glass-panel {
            background: hsl(var(--glass-bg));
            backdrop-filter: blur(24px);
          }
        }
      `
      expect(hasBackgroundFallback(cssContent, '.glass-panel')).toBe(true)
    })

    it('should return false when no fallback exists', () => {
      const cssContent = `
        .glass-panel {
          border: 1px solid black;
        }
        
        @supports (backdrop-filter: blur(1px)) {
          .glass-panel {
            backdrop-filter: blur(24px);
          }
        }
      `
      expect(hasBackgroundFallback(cssContent, '.glass-panel')).toBe(false)
    })
  })

  describe('validateBackdropFilterFallbacks', () => {
    it('should validate CSS with proper fallbacks', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z][a-z0-9-]*$/),
          (className) => {
            const cssContent = `
              .${className} {
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.3);
              }
              
              @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
                .${className} {
                  background: rgba(255, 255, 255, 0.5);
                  backdrop-filter: blur(20px);
                  -webkit-backdrop-filter: blur(20px);
                }
              }
            `
            const result = validateBackdropFilterFallbacks(cssContent)
            return result.valid && result.violations.length === 0
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should detect missing fallbacks', () => {
      const cssContent = `
        .no-fallback {
          border: 1px solid black;
        }
        
        @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
          .no-fallback {
            backdrop-filter: blur(20px);
          }
        }
      `
      const result = validateBackdropFilterFallbacks(cssContent)
      expect(result.valid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(0)
    })
  })

  describe('main.css backdrop-filter validation', () => {
    it('all backdrop-filter usages in main.css should have background fallbacks', () => {
      const mainCssPath = path.resolve(__dirname, '../main.css')
      const cssContent = fs.readFileSync(mainCssPath, 'utf-8')
      
      const result = validateBackdropFilterFallbacks(cssContent)
      
      if (!result.valid) {
        console.error('Backdrop-filter rules missing fallbacks:')
        result.violations.forEach(v => console.error(`  - ${v}`))
      }
      
      // Log valid rules for verification
      if (result.validRules.length > 0) {
        console.log(`Found ${result.validRules.length} properly implemented backdrop-filter rules`)
      }
      
      expect(result.valid).toBe(true)
    })

    it('main.css should have at least one @supports block for backdrop-filter', () => {
      const mainCssPath = path.resolve(__dirname, '../main.css')
      const cssContent = fs.readFileSync(mainCssPath, 'utf-8')
      
      const supportsBlocks = parseSupportsBlocks(cssContent)
      expect(supportsBlocks.length).toBeGreaterThan(0)
    })
  })

  describe('all CSS files backdrop-filter validation', () => {
    it('all backdrop-filter usages in all CSS files should have fallbacks', () => {
      const cssFiles = getCssFiles()
      
      for (const cssFile of cssFiles) {
        const cssContent = fs.readFileSync(cssFile, 'utf-8')
        
        // Skip files without @supports backdrop-filter
        const supportsBlocks = parseSupportsBlocks(cssContent)
        if (supportsBlocks.length === 0) continue
        
        const result = validateBackdropFilterFallbacks(cssContent)
        
        if (!result.valid) {
          console.error(`Backdrop-filter fallback violations in ${path.basename(cssFile)}:`)
          result.violations.forEach(v => console.error(`  - ${v}`))
        }
        
        expect(
          result.valid,
          `File ${path.basename(cssFile)} has backdrop-filter without fallback`
        ).toBe(true)
      }
    })
  })
})

// Export functions for potential reuse
export {
  parseBackdropFilterRules,
  parseSupportsBlocks,
  hasBackgroundFallback,
  validateBackdropFilterFallbacks,
  getCssFiles
}
