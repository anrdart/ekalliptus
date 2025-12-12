/**
 * Property-Based Tests for NuxtLink Usage
 * Tests that internal navigation links use NuxtLink component for automatic prefetching
 * 
 * **Feature: performance-optimization, Property 9: NuxtLink Usage**
 * *For any* internal navigation link in Vue components, the link SHALL use
 * NuxtLink component for automatic prefetching
 * **Validates: Requirements 4.5**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Internal route patterns that should use NuxtLink
const INTERNAL_ROUTE_PATTERNS = [
  /href=["']\/(?!\/)/,  // href starting with single / (not //)
  /href=["']\.\.?\//,   // href starting with ./ or ../
]

// Patterns that indicate external links (should use <a>)
const EXTERNAL_PATTERNS = [
  /href=["']https?:\/\//,  // http:// or https://
  /href=["']mailto:/,      // mailto:
  /href=["']tel:/,         // tel:
  /href=["']#/,            // anchor links (#section)
  /target=["']_blank["']/,  // external links with target="_blank"
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
 * Extract all anchor tags from Vue template content
 */
function extractAnchorTags(content: string): { tag: string; href: string; line: number }[] {
  const results: { tag: string; href: string; line: number }[] = []
  
  // Extract template section
  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
  if (!templateMatch) return results
  
  const templateContent = templateMatch[1]
  const lines = templateContent.split('\n')
  
  // Find all <a tags with href
  const anchorPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = anchorPattern.exec(templateContent)) !== null) {
    const href = match[1]
    // Calculate line number
    const beforeMatch = templateContent.substring(0, match.index)
    const lineNumber = beforeMatch.split('\n').length
    
    results.push({
      tag: match[0],
      href,
      line: lineNumber
    })
  }
  
  return results
}

/**
 * Check if an href is an internal route that should use NuxtLink
 */
function isInternalRoute(href: string, fullTag: string): boolean {
  // Check if it's an external link
  for (const pattern of EXTERNAL_PATTERNS) {
    if (pattern.test(`href="${href}"`) || pattern.test(fullTag)) {
      return false
    }
  }
  
  // Check if it matches internal route patterns
  for (const pattern of INTERNAL_ROUTE_PATTERNS) {
    if (pattern.test(`href="${href}"`)) {
      return true
    }
  }
  
  return false
}

/**
 * Check if a file uses NuxtLink for internal navigation
 */
function checkNuxtLinkUsage(filePath: string): {
  valid: boolean
  issues: { href: string; line: number; message: string }[]
} {
  const content = readFileSync(filePath, 'utf-8')
  const issues: { href: string; line: number; message: string }[] = []
  
  const anchorTags = extractAnchorTags(content)
  
  for (const { tag, href, line } of anchorTags) {
    if (isInternalRoute(href, tag)) {
      issues.push({
        href,
        line,
        message: `Internal route "${href}" should use <NuxtLink to="${href}"> instead of <a href="${href}">`
      })
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}

describe('Property 9: NuxtLink Usage', () => {
  // Get all Vue files
  const componentFiles = findVueFiles('components')
  const pageFiles = findVueFiles('pages')
  const allVueFiles = [...componentFiles, ...pageFiles]
  
  it('should find Vue files in the project', () => {
    expect(allVueFiles.length).toBeGreaterThan(0)
  })
  
  it('internal navigation links should use NuxtLink component', () => {
    // Property: For any Vue file with internal navigation links,
    // those links MUST use NuxtLink instead of raw <a> tags
    fc.assert(
      fc.property(
        fc.constantFrom(...allVueFiles),
        (filePath) => {
          const result = checkNuxtLinkUsage(filePath)
          
          if (!result.valid) {
            console.error(`\nIn ${filePath}:`)
            for (const issue of result.issues) {
              console.error(`  Line ${issue.line}: ${issue.message}`)
            }
            return false
          }
          
          return true
        }
      ),
      { numRuns: allVueFiles.length }
    )
  })
  
  it('NuxtLink should be used for route navigation in components', () => {
    // Verify that NuxtLink is actually being used in the codebase
    let nuxtLinkCount = 0
    
    for (const filePath of allVueFiles) {
      const content = readFileSync(filePath, 'utf-8')
      const nuxtLinkMatches = content.match(/<NuxtLink/g)
      if (nuxtLinkMatches) {
        nuxtLinkCount += nuxtLinkMatches.length
      }
    }
    
    // There should be at least some NuxtLink usage in the project
    expect(nuxtLinkCount).toBeGreaterThan(0)
  })
  
  it('external links should correctly use anchor tags', () => {
    // Property: External links (https://, mailto:, tel:) should use <a> tags
    // This is a sanity check that we're not flagging external links incorrectly
    fc.assert(
      fc.property(
        fc.constantFrom(...allVueFiles),
        (filePath) => {
          const content = readFileSync(filePath, 'utf-8')
          const anchorTags = extractAnchorTags(content)
          
          for (const { tag, href } of anchorTags) {
            // External links should NOT be flagged as needing NuxtLink
            if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
              // This is correct usage - external links should use <a>
              const result = isInternalRoute(href, tag)
              if (result) {
                console.error(`External link "${href}" incorrectly identified as internal`)
                return false
              }
            }
          }
          
          return true
        }
      ),
      { numRuns: allVueFiles.length }
    )
  })
})
