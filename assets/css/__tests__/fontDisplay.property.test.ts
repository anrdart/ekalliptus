/**
 * Property-Based Tests for Font Display Optimization
 * Tests correctness properties for font-display: swap using fast-check
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Parse @font-face declarations from CSS content
 */
function parseFontFaceDeclarations(cssContent: string): string[] {
  const fontFaceRegex = /@font-face\s*\{[^}]*\}/g
  const matches = cssContent.match(fontFaceRegex)
  return matches || []
}

/**
 * Check if a @font-face declaration has font-display: swap
 */
function hasFontDisplaySwap(fontFaceDeclaration: string): boolean {
  // Match font-display: swap with optional whitespace
  const fontDisplayRegex = /font-display\s*:\s*swap\s*;?/i
  return fontDisplayRegex.test(fontFaceDeclaration)
}

/**
 * Validate that all @font-face declarations have font-display: swap
 */
function validateAllFontFacesHaveSwap(cssContent: string): { valid: boolean; violations: string[] } {
  const fontFaces = parseFontFaceDeclarations(cssContent)
  const violations: string[] = []
  
  for (const fontFace of fontFaces) {
    if (!hasFontDisplaySwap(fontFace)) {
      violations.push(fontFace)
    }
  }
  
  return {
    valid: violations.length === 0,
    violations
  }
}

/**
 * Get all CSS files in the assets directory
 */
function getCssFiles(): string[] {
  const cssDir = path.resolve(__dirname, '..')
  const files: string[] = []
  
  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory() && entry.name !== '__tests__' && entry.name !== 'node_modules') {
        walkDir(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        files.push(fullPath)
      }
    }
  }
  
  walkDir(cssDir)
  return files
}

/**
 * **Feature: performance-optimization, Property 6: Font Display Swap**
 * *For any* @font-face declaration in CSS files, the declaration SHALL include font-display: swap
 * **Validates: Requirements 3.1**
 */
describe('Property 6: Font Display Swap', () => {
  describe('parseFontFaceDeclarations', () => {
    it('should correctly parse @font-face declarations from CSS', () => {
      fc.assert(
        fc.property(
          // Generate font family names
          fc.stringMatching(/^[A-Za-z][A-Za-z0-9 -]*$/),
          fc.integer({ min: 100, max: 900 }),
          (fontFamily, fontWeight) => {
            const cssContent = `
              @font-face {
                font-family: '${fontFamily}';
                font-weight: ${fontWeight};
                font-display: swap;
              }
            `
            const declarations = parseFontFaceDeclarations(cssContent)
            return declarations.length === 1
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should parse multiple @font-face declarations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (count) => {
            let cssContent = ''
            for (let i = 0; i < count; i++) {
              cssContent += `
                @font-face {
                  font-family: 'Font${i}';
                  font-display: swap;
                }
              `
            }
            const declarations = parseFontFaceDeclarations(cssContent)
            return declarations.length === count
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('hasFontDisplaySwap', () => {
    it('should detect font-display: swap in various formats', () => {
      const validDeclarations = [
        '@font-face { font-display: swap; }',
        '@font-face { font-display:swap; }',
        '@font-face { font-display: swap }',
        '@font-face {\n  font-display: swap;\n}',
        '@font-face { font-family: "Inter"; font-display: swap; src: local("Inter"); }'
      ]
      
      for (const declaration of validDeclarations) {
        expect(hasFontDisplaySwap(declaration)).toBe(true)
      }
    })

    it('should return false when font-display: swap is missing', () => {
      const invalidDeclarations = [
        '@font-face { font-family: "Inter"; }',
        '@font-face { font-display: block; }',
        '@font-face { font-display: auto; }',
        '@font-face { font-display: fallback; }',
        '@font-face { font-display: optional; }'
      ]
      
      for (const declaration of invalidDeclarations) {
        expect(hasFontDisplaySwap(declaration)).toBe(false)
      }
    })
  })

  describe('validateAllFontFacesHaveSwap', () => {
    it('should return valid for CSS with all font-display: swap', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (count) => {
            let cssContent = ''
            for (let i = 0; i < count; i++) {
              cssContent += `
                @font-face {
                  font-family: 'Font${i}';
                  font-style: normal;
                  font-weight: ${400 + i * 100};
                  font-display: swap;
                  src: local('Font${i}');
                }
              `
            }
            const result = validateAllFontFacesHaveSwap(cssContent)
            return result.valid && result.violations.length === 0
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should return invalid when any @font-face is missing font-display: swap', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 0, max: 4 }),
          (count, missingIndex) => {
            const actualMissingIndex = missingIndex % count
            let cssContent = ''
            for (let i = 0; i < count; i++) {
              if (i === actualMissingIndex) {
                // Missing font-display: swap
                cssContent += `
                  @font-face {
                    font-family: 'Font${i}';
                    src: local('Font${i}');
                  }
                `
              } else {
                cssContent += `
                  @font-face {
                    font-family: 'Font${i}';
                    font-display: swap;
                    src: local('Font${i}');
                  }
                `
              }
            }
            const result = validateAllFontFacesHaveSwap(cssContent)
            return !result.valid && result.violations.length === 1
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('main.css font-display validation', () => {
    it('all @font-face declarations in main.css should have font-display: swap', () => {
      const mainCssPath = path.resolve(__dirname, '../main.css')
      const cssContent = fs.readFileSync(mainCssPath, 'utf-8')
      
      const result = validateAllFontFacesHaveSwap(cssContent)
      
      if (!result.valid) {
        console.error('Font-face declarations missing font-display: swap:')
        result.violations.forEach(v => console.error(v))
      }
      
      expect(result.valid).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    it('main.css should have at least one @font-face declaration', () => {
      const mainCssPath = path.resolve(__dirname, '../main.css')
      const cssContent = fs.readFileSync(mainCssPath, 'utf-8')
      
      const declarations = parseFontFaceDeclarations(cssContent)
      expect(declarations.length).toBeGreaterThan(0)
    })
  })

  describe('all CSS files font-display validation', () => {
    it('all @font-face declarations in all CSS files should have font-display: swap', () => {
      const cssFiles = getCssFiles()
      
      for (const cssFile of cssFiles) {
        const cssContent = fs.readFileSync(cssFile, 'utf-8')
        const result = validateAllFontFacesHaveSwap(cssContent)
        
        if (!result.valid) {
          console.error(`Font-face declarations missing font-display: swap in ${cssFile}:`)
          result.violations.forEach(v => console.error(v))
        }
        
        expect(result.valid, `File ${cssFile} has @font-face without font-display: swap`).toBe(true)
      }
    })
  })
})

// Export functions for potential reuse
export {
  parseFontFaceDeclarations,
  hasFontDisplaySwap,
  validateAllFontFacesHaveSwap,
  getCssFiles
}
