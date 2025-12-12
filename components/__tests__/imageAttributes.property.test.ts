/**
 * Property-Based Tests for Image Attributes Completeness
 * Tests that all img elements in Vue components have required attributes
 * 
 * **Feature: performance-optimization, Property 4: Image Attributes Completeness**
 * *For any* img element in Vue components, the element SHALL include width, height,
 * and alt attributes, and non-critical images SHALL include loading="lazy"
 * **Validates: Requirements 2.2, 2.4**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

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
 * Extract all img tags from Vue template content
 */
function extractImgTags(content: string): string[] {
  // Match img tags in template section
  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
  if (!templateMatch) return []
  
  const templateContent = templateMatch[1]
  // Match self-closing and regular img tags
  const imgPattern = /<img\s+[^>]*\/?>/gi
  return templateContent.match(imgPattern) || []
}

/**
 * Check if an attribute exists (static or dynamic Vue binding)
 */
function hasAttribute(imgTag: string, attrName: string, allowEmpty = false): boolean {
  // Static attribute: attr="value" or attr='value'
  const staticPattern = allowEmpty
    ? new RegExp(`\\b${attrName}\\s*=\\s*["'][^"']*["']`, 'i')
    : new RegExp(`\\b${attrName}\\s*=\\s*["'][^"']+["']`, 'i')
  
  // Dynamic Vue binding: :attr="value" or v-bind:attr="value"
  const dynamicPattern = new RegExp(`(?::|v-bind:)${attrName}\\s*=\\s*["'][^"']+["']`, 'i')
  
  return staticPattern.test(imgTag) || dynamicPattern.test(imgTag)
}

/**
 * Check if an img tag has all required attributes
 */
function validateImgTag(imgTag: string): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Check for width attribute (static or dynamic)
  if (!hasAttribute(imgTag, 'width')) {
    issues.push('Missing width attribute')
  }
  
  // Check for height attribute (static or dynamic)
  if (!hasAttribute(imgTag, 'height')) {
    issues.push('Missing height attribute')
  }
  
  // Check for alt attribute (can be empty for decorative images)
  if (!hasAttribute(imgTag, 'alt', true)) {
    issues.push('Missing alt attribute')
  }
  
  // Check for loading attribute (should be present - either lazy or eager)
  const hasLoadingStatic = /\bloading\s*=\s*["'](lazy|eager)["']/i.test(imgTag)
  const hasLoadingDynamic = /(?::|v-bind:)loading\s*=\s*["'][^"']+["']/i.test(imgTag)
  if (!hasLoadingStatic && !hasLoadingDynamic) {
    issues.push('Missing loading attribute (should be "lazy" or "eager")')
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}

describe('Property 4: Image Attributes Completeness', () => {
  // Get all Vue files in the project
  const vueFiles = findVueFiles('.')
  
  it('should find Vue files in the project', () => {
    expect(vueFiles.length).toBeGreaterThan(0)
  })
  
  it('all img elements should have width, height, alt, and loading attributes', () => {
    const filesWithImages = vueFiles.filter(file => {
      try {
        const content = readFileSync(file, 'utf-8')
        return extractImgTags(content).length > 0
      } catch {
        return false
      }
    })
    
    if (filesWithImages.length === 0) {
      // No files with images, test passes trivially
      expect(true).toBe(true)
      return
    }
    
    // Property: For any Vue file with img elements,
    // each img MUST have width, height, alt, and loading attributes
    fc.assert(
      fc.property(
        fc.constantFrom(...filesWithImages),
        (filePath) => {
          const content = readFileSync(filePath, 'utf-8')
          const imgTags = extractImgTags(content)
          
          for (const imgTag of imgTags) {
            const result = validateImgTag(imgTag)
            
            if (!result.valid) {
              console.error(`Invalid img in ${filePath}:`, imgTag)
              console.error('Issues:', result.issues)
              return false
            }
          }
          
          return true
        }
      ),
      { numRuns: Math.max(filesWithImages.length, 1) }
    )
  })
  
  it('critical images (logo) should have fetchpriority="high"', () => {
    const filesWithImages = vueFiles.filter(file => {
      try {
        const content = readFileSync(file, 'utf-8')
        return extractImgTags(content).length > 0
      } catch {
        return false
      }
    })
    
    if (filesWithImages.length === 0) {
      expect(true).toBe(true)
      return
    }
    
    // Property: For any img that is a logo (contains 'logo' in alt or src),
    // it SHOULD have fetchpriority="high"
    fc.assert(
      fc.property(
        fc.constantFrom(...filesWithImages),
        (filePath) => {
          const content = readFileSync(filePath, 'utf-8')
          const imgTags = extractImgTags(content)
          
          for (const imgTag of imgTags) {
            const isLogo = /logo/i.test(imgTag)
            
            if (isLogo) {
              // Check for static or dynamic fetchpriority
              const hasFetchPriorityStatic = /fetchpriority\s*=\s*["']high["']/i.test(imgTag)
              const hasFetchPriorityDynamic = /(?::|v-bind:)fetchpriority\s*=\s*["'][^"']+["']/i.test(imgTag)
              if (!hasFetchPriorityStatic && !hasFetchPriorityDynamic) {
                console.error(`Logo image missing fetchpriority="high" in ${filePath}:`, imgTag)
                return false
              }
            }
          }
          
          return true
        }
      ),
      { numRuns: Math.max(filesWithImages.length, 1) }
    )
  })
})
