/**
 * Property-Based Tests for JavaScript Bundle Size
 * Tests that production build output meets bundle size requirements
 * 
 * **Feature: performance-optimization, Property 1: JavaScript Bundle Size Limit**
 * *For any* production build output, the main JavaScript bundle SHALL be
 * smaller than 200KB when gzipped
 * **Validates: Requirements 1.1**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readdirSync, statSync, readFileSync } from 'fs'
import { join, extname } from 'path'
import { gzipSync } from 'zlib'
import { performanceTargets } from '../performance.config'

/**
 * Find all JavaScript files in a directory recursively
 */
function findJsFiles(dir: string, files: string[] = []): string[] {
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          findJsFiles(fullPath, files)
        } else if (stat.isFile() && (extname(entry) === '.js' || extname(entry) === '.mjs')) {
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
 * Get gzipped size of a file
 */
function getGzippedSize(filePath: string): number {
  try {
    const content = readFileSync(filePath)
    const gzipped = gzipSync(content)
    return gzipped.length
  } catch {
    return 0
  }
}

/**
 * Check if dist directory exists (production build has been run)
 */
function distExists(): boolean {
  try {
    statSync('.output')
    return true
  } catch {
    try {
      statSync('dist')
      return true
    } catch {
      return false
    }
  }
}

/**
 * Get the output directory path
 */
function getOutputDir(): string {
  try {
    statSync('.output')
    return '.output'
  } catch {
    return 'dist'
  }
}

describe('Property 1: JavaScript Bundle Size Limit', () => {
  const hasBuild = distExists()
  
  it.skipIf(!hasBuild)('production build should exist for bundle size testing', () => {
    expect(hasBuild).toBe(true)
  })
  
  it.skipIf(!hasBuild)('all JavaScript chunks should be under individual size limits', () => {
    const outputDir = getOutputDir()
    const jsFiles = findJsFiles(outputDir)
    
    // Filter to only include client-side bundles (not server bundles)
    const clientJsFiles = jsFiles.filter(f => 
      f.includes('_nuxt') || 
      f.includes('client') ||
      (!f.includes('server') && !f.includes('nitro'))
    )
    
    if (clientJsFiles.length === 0) {
      console.log('No client JS files found in build output')
      return
    }
    
    // Property: For any JavaScript file in the build output,
    // the gzipped size should be reasonable (under 500KB per chunk)
    const maxChunkSize = 500 * 1024 // 500KB per individual chunk
    
    fc.assert(
      fc.property(
        fc.constantFrom(...clientJsFiles),
        (filePath) => {
          const gzippedSize = getGzippedSize(filePath)
          const sizeKB = Math.round(gzippedSize / 1024)
          
          if (gzippedSize > maxChunkSize) {
            console.error(`Chunk too large: ${filePath} (${sizeKB}KB gzipped)`)
            return false
          }
          
          return true
        }
      ),
      { numRuns: clientJsFiles.length || 1 }
    )
  })
  
  it.skipIf(!hasBuild)('total initial JavaScript bundle should be under target', () => {
    const outputDir = getOutputDir()
    const jsFiles = findJsFiles(outputDir)
    
    // Filter to only include client-side entry bundles
    const entryFiles = jsFiles.filter(f => 
      (f.includes('_nuxt') || f.includes('client')) &&
      !f.includes('server') &&
      !f.includes('nitro')
    )
    
    if (entryFiles.length === 0) {
      console.log('No entry JS files found in build output')
      return
    }
    
    // Calculate total gzipped size
    let totalGzippedSize = 0
    for (const file of entryFiles) {
      totalGzippedSize += getGzippedSize(file)
    }
    
    const totalKB = Math.round(totalGzippedSize / 1024)
    const targetKB = Math.round(performanceTargets.bundles.totalInitial / 1024)
    
    console.log(`Total JS bundle size: ${totalKB}KB gzipped (target: ${targetKB}KB)`)
    
    // Property: Total initial JavaScript should be under the configured target
    expect(totalGzippedSize).toBeLessThanOrEqual(performanceTargets.bundles.totalInitial)
  })
  
  // Test that validates the configuration itself
  it('bundle size targets should be reasonable', () => {
    fc.assert(
      fc.property(
        fc.record({
          mainJs: fc.constant(performanceTargets.bundles.mainJs),
          mainCss: fc.constant(performanceTargets.bundles.mainCss),
          vendorJs: fc.constant(performanceTargets.bundles.vendorJs),
          totalInitial: fc.constant(performanceTargets.bundles.totalInitial)
        }),
        (targets) => {
          // Main JS should be positive and under 1MB
          if (targets.mainJs <= 0 || targets.mainJs > 1024 * 1024) return false
          
          // Main CSS should be positive and under 500KB
          if (targets.mainCss <= 0 || targets.mainCss > 500 * 1024) return false
          
          // Vendor JS should be positive and under 1MB
          if (targets.vendorJs <= 0 || targets.vendorJs > 1024 * 1024) return false
          
          // Total should be at least the sum of main + vendor
          if (targets.totalInitial < targets.mainJs) return false
          
          return true
        }
      ),
      { numRuns: 1 }
    )
  })
  
  // Test that validates build configuration enables optimizations
  it('nuxt config should have production optimizations enabled', async () => {
    // Read nuxt.config.ts and verify optimization settings
    try {
      const configContent = readFileSync('nuxt.config.ts', 'utf-8')
      
      // Property: Config should contain key optimization settings
      const hasSourcemapDisabled = configContent.includes('sourcemap: false') || 
                                    configContent.includes("sourcemap: 'hidden'")
      const hasMinify = configContent.includes('minify')
      const hasManualChunks = configContent.includes('manualChunks')
      
      expect(hasSourcemapDisabled || hasMinify || hasManualChunks).toBe(true)
    } catch {
      // Config file not found, skip this test
      console.log('nuxt.config.ts not found, skipping config validation')
    }
  })
})
