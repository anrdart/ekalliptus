/**
 * Property-Based Tests for Favicon Size Limit
 * Tests that all favicon PNG files are under 10KB
 * 
 * **Feature: performance-optimization, Property 5: Favicon Size Limit**
 * *For any* favicon PNG file in the public directory, the file size SHALL be under 10KB
 * **Validates: Requirements 2.5**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const MAX_FAVICON_SIZE_KB = 10
const MAX_FAVICON_SIZE_BYTES = MAX_FAVICON_SIZE_KB * 1024

/**
 * Find all favicon PNG files in the public directory
 * Favicons are identified by having 'favicon' in the filename
 */
function findFaviconFiles(dir: string): string[] {
  const faviconFiles: string[] = []
  
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isFile() && entry.toLowerCase().includes('favicon') && entry.endsWith('.png')) {
          faviconFiles.push(fullPath)
        }
      } catch {
        // Skip files we can't access
      }
    }
  } catch {
    // Skip directories we can't access
  }
  
  return faviconFiles
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath: string): number {
  const stat = statSync(filePath)
  return stat.size / 1024
}

function getFileSizeBytes(filePath: string): number {
  return statSync(filePath).size
}

describe('Property 5: Favicon Size Limit', () => {
  const publicDir = 'public'
  const faviconFiles = findFaviconFiles(publicDir)
  
  it('should find favicon PNG files in public directory', () => {
    expect(faviconFiles.length).toBeGreaterThan(0)
  })
  
  it('all favicon PNG files should be under 10KB', () => {
    // Property: For any favicon PNG file in the public directory,
    // the file size MUST be under 10KB
    fc.assert(
      fc.property(
        fc.constantFrom(...faviconFiles),
        (filePath: string) => {
          const sizeKB = getFileSizeKB(filePath)
          const isUnderLimit = getFileSizeBytes(filePath) < MAX_FAVICON_SIZE_BYTES
          
          if (!isUnderLimit) {
            console.error(`Favicon ${filePath} is ${sizeKB.toFixed(2)}KB, exceeds ${MAX_FAVICON_SIZE_KB}KB limit`)
          }
          
          return isUnderLimit
        }
      ),
      { numRuns: Math.max(faviconFiles.length, 1) }
    )
  })
  
  it('should report all favicon sizes for verification', () => {
    console.log('\nFavicon sizes:')
    for (const file of faviconFiles) {
      const sizeKB = getFileSizeKB(file)
      const status = sizeKB < MAX_FAVICON_SIZE_KB ? '✓' : '✗'
      console.log(`  ${status} ${file}: ${sizeKB.toFixed(2)}KB`)
    }
    
    // All favicons should be under limit
    const allUnderLimit = faviconFiles.every(file => getFileSizeKB(file) < MAX_FAVICON_SIZE_KB)
    expect(allUnderLimit).toBe(true)
  })
})
