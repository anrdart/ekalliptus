/**
 * Property-Based Tests for Icon Import Specificity
 * Tests that all Vue components use named imports for lucide-vue-next icons
 * 
 * **Feature: performance-optimization, Property 2: Icon Import Specificity**
 * *For any* component file that imports icons, the import statement SHALL use
 * named imports for specific icons rather than importing the entire library
 * **Validates: Requirements 1.5**
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
 * Check if a file contains valid lucide-vue-next imports (named imports only)
 */
function hasValidIconImports(content: string): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Pattern for wildcard imports: import * from 'lucide-vue-next'
  const wildcardPattern = /import\s+\*\s+(?:as\s+\w+\s+)?from\s+['"]lucide-vue-next['"]/g
  const wildcardMatches = content.match(wildcardPattern)
  if (wildcardMatches) {
    issues.push(`Wildcard import found: ${wildcardMatches.join(', ')}`)
  }
  
  // Pattern for default imports: import Icons from 'lucide-vue-next'
  const defaultPattern = /import\s+(?!{)[A-Z]\w*\s+from\s+['"]lucide-vue-next['"]/g
  const defaultMatches = content.match(defaultPattern)
  if (defaultMatches) {
    issues.push(`Default import found: ${defaultMatches.join(', ')}`)
  }
  
  // Pattern for re-exports: export * from 'lucide-vue-next'
  const reexportPattern = /export\s+\*\s+from\s+['"]lucide-vue-next['"]/g
  const reexportMatches = content.match(reexportPattern)
  if (reexportMatches) {
    issues.push(`Re-export found: ${reexportMatches.join(', ')}`)
  }
  
  // Valid pattern: import { Icon1, Icon2 } from 'lucide-vue-next'
  const namedPattern = /import\s+\{[^}]+\}\s+from\s+['"]lucide-vue-next['"]/g
  const namedMatches = content.match(namedPattern)
  
  // If there are lucide imports but no named imports, that's an issue
  const hasAnyLucideImport = content.includes('lucide-vue-next')
  if (hasAnyLucideImport && !namedMatches && issues.length === 0) {
    issues.push('Has lucide-vue-next reference but no valid named import found')
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}

describe('Property 2: Icon Import Specificity', () => {
  // Get all Vue files in the project
  const vueFiles = findVueFiles('.')
  
  it('should find Vue files in the project', () => {
    expect(vueFiles.length).toBeGreaterThan(0)
  })
  
  it('all Vue files with lucide imports should use named imports only', () => {
    const filesWithLucide = vueFiles.filter(file => {
      try {
        const content = readFileSync(file, 'utf-8')
        return content.includes('lucide-vue-next')
      } catch {
        return false
      }
    })
    
    // Property: For any Vue file that imports from lucide-vue-next,
    // the import MUST be a named import (not wildcard or default)
    fc.assert(
      fc.property(
        fc.constantFrom(...filesWithLucide),
        (filePath) => {
          const content = readFileSync(filePath, 'utf-8')
          const result = hasValidIconImports(content)
          
          if (!result.valid) {
            console.error(`Invalid import in ${filePath}:`, result.issues)
          }
          
          return result.valid
        }
      ),
      { numRuns: filesWithLucide.length || 1 }
    )
  })
  
  it('named imports should only import specific icons', () => {
    const filesWithLucide = vueFiles.filter(file => {
      try {
        const content = readFileSync(file, 'utf-8')
        return content.includes('lucide-vue-next')
      } catch {
        return false
      }
    })
    
    // Property: For any named import from lucide-vue-next,
    // the import should contain specific icon names (PascalCase)
    fc.assert(
      fc.property(
        fc.constantFrom(...filesWithLucide),
        (filePath) => {
          const content = readFileSync(filePath, 'utf-8')
          const namedPattern = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-vue-next['"]/g
          let match
          
          while ((match = namedPattern.exec(content)) !== null) {
            const imports = match[1].split(',').map(s => s.trim())
            
            // Each import should be a valid icon name (PascalCase)
            for (const imp of imports) {
              // Handle "as" aliases: Icon as MyIcon
              const iconName = imp.split(/\s+as\s+/)[0].trim()
              
              // Icon names should be PascalCase and not empty
              if (!iconName || !/^[A-Z][a-zA-Z0-9]*$/.test(iconName)) {
                console.error(`Invalid icon name in ${filePath}: "${iconName}"`)
                return false
              }
            }
          }
          
          return true
        }
      ),
      { numRuns: filesWithLucide.length || 1 }
    )
  })
})
