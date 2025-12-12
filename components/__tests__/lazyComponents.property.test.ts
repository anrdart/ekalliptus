/**
 * Property-Based Tests for Lazy Component Pattern
 * Tests that below-the-fold components use Nuxt's lazy loading pattern
 * 
 * **Feature: performance-optimization, Property 7: Lazy Component Pattern**
 * *For any* below-the-fold component (FAQ, Services, ContactCTA), the component
 * SHALL be loaded using defineAsyncComponent or Nuxt's lazy loading pattern
 * **Validates: Requirements 4.1**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, extname } from 'path'

// Components that should be lazy loaded (below-the-fold)
const LAZY_COMPONENTS = ['FAQ', 'Services', 'ContactCTA']

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
 * Check if a component is used with lazy loading pattern in a file
 * Nuxt 3 lazy loading: <LazyComponentName /> or defineAsyncComponent
 */
function checkLazyUsage(content: string, componentName: string): { 
  usesComponent: boolean
  usesLazyPattern: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check for direct component usage (non-lazy): <ComponentName or <component-name
  const directUsagePattern = new RegExp(`<${componentName}[\\s/>]`, 'g')
  const kebabName = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
  const kebabUsagePattern = new RegExp(`<${kebabName}[\\s/>]`, 'g')
  
  // Check for lazy component usage: <LazyComponentName or <lazy-component-name
  const lazyUsagePattern = new RegExp(`<Lazy${componentName}[\\s/>]`, 'g')
  const lazyKebabPattern = new RegExp(`<lazy-${kebabName}[\\s/>]`, 'g')
  
  // Check for defineAsyncComponent usage
  const asyncComponentPattern = new RegExp(`defineAsyncComponent.*${componentName}`, 'g')
  
  const hasDirectUsage = directUsagePattern.test(content) || kebabUsagePattern.test(content)
  const hasLazyUsage = lazyUsagePattern.test(content) || lazyKebabPattern.test(content) || asyncComponentPattern.test(content)
  
  // Reset regex lastIndex
  directUsagePattern.lastIndex = 0
  kebabUsagePattern.lastIndex = 0
  
  const usesComponent = hasDirectUsage || hasLazyUsage
  
  if (hasDirectUsage && !hasLazyUsage) {
    issues.push(`Component ${componentName} is used directly without lazy loading pattern`)
  }
  
  return {
    usesComponent,
    usesLazyPattern: hasLazyUsage,
    issues
  }
}

describe('Property 7: Lazy Component Pattern', () => {
  // Get all Vue files in pages directory (where lazy loading matters most)
  const pageFiles = findVueFiles('pages')
  const allVueFiles = findVueFiles('.')
  
  it('should find Vue files in the project', () => {
    expect(allVueFiles.length).toBeGreaterThan(0)
  })
  
  it('should have the required lazy components defined', () => {
    // Verify that the base components exist
    for (const componentName of LAZY_COMPONENTS) {
      const componentPath = join('components', `${componentName}.vue`)
      expect(existsSync(componentPath)).toBe(true)
    }
  })
  
  it('below-the-fold components should use lazy loading pattern in pages', () => {
    // Property: For any page file that uses FAQ, Services, or ContactCTA,
    // the component MUST be used with Nuxt's Lazy prefix or defineAsyncComponent
    fc.assert(
      fc.property(
        fc.constantFrom(...LAZY_COMPONENTS),
        fc.constantFrom(...pageFiles),
        (componentName, filePath) => {
          const content = readFileSync(filePath, 'utf-8')
          const result = checkLazyUsage(content, componentName)
          
          // If the component is used, it must use lazy loading
          if (result.usesComponent && !result.usesLazyPattern) {
            console.error(`In ${filePath}:`, result.issues)
            return false
          }
          
          return true
        }
      ),
      { numRuns: LAZY_COMPONENTS.length * Math.max(pageFiles.length, 1) }
    )
  })
  
  it('lazy components should be used with Lazy prefix in index page', () => {
    const indexPath = 'pages/index.vue'
    if (!existsSync(indexPath)) {
      return // Skip if index page doesn't exist
    }
    
    const content = readFileSync(indexPath, 'utf-8')
    
    // Property: For any below-the-fold component used in index page,
    // it MUST use the Lazy prefix pattern
    fc.assert(
      fc.property(
        fc.constantFrom(...LAZY_COMPONENTS),
        (componentName) => {
          const result = checkLazyUsage(content, componentName)
          
          // If the component is used in index, it must be lazy loaded
          if (result.usesComponent) {
            if (!result.usesLazyPattern) {
              console.error(`Index page uses ${componentName} without lazy loading:`, result.issues)
              return false
            }
          }
          
          return true
        }
      ),
      { numRuns: LAZY_COMPONENTS.length }
    )
  })
})
