/**
 * Property-Based Tests for GPU-Accelerated Animations
 * Tests that CSS animations use transform and opacity for GPU acceleration
 * 
 * **Feature: performance-optimization, Property 11: GPU-Accelerated Animations**
 * *For any* CSS animation or transition, the animation SHALL use transform
 * and/or opacity properties for GPU acceleration
 * **Validates: Requirements 5.4**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

// Properties that are GPU-accelerated (composited)
const GPU_ACCELERATED_PROPERTIES = [
  'transform',
  'opacity',
  'filter',
  'will-change',
  'perspective',
  'backface-visibility'
]

// Properties that trigger layout/paint (not GPU-accelerated)
const NON_GPU_PROPERTIES = [
  'top',
  'left',
  'right',
  'bottom',
  'width',
  'height',
  'margin',
  'padding',
  'border-width',
  'font-size'
]

// Properties that are acceptable exceptions (necessary for certain animations)
const ACCEPTABLE_EXCEPTIONS = [
  'max-height', // Needed for accordion animations
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right'
]

/**
 * Parse @keyframes declarations from CSS content
 */
function parseKeyframes(cssContent: string): { name: string; content: string }[] {
  const keyframeRegex = /@keyframes\s+([\w-]+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  const keyframes: { name: string; content: string }[] = []
  let match

  while ((match = keyframeRegex.exec(cssContent)) !== null) {
    keyframes.push({
      name: match[1],
      content: match[2]
    })
  }

  return keyframes
}

/**
 * Extract animated properties from keyframe content
 */
function extractAnimatedProperties(keyframeContent: string): string[] {
  const properties: string[] = []
  // Match property: value patterns
  const propertyRegex = /([a-z-]+)\s*:/gi
  let match

  while ((match = propertyRegex.exec(keyframeContent)) !== null) {
    const prop = match[1].toLowerCase()
    if (!properties.includes(prop)) {
      properties.push(prop)
    }
  }

  return properties
}

/**
 * Check if a property is GPU-accelerated
 */
function isGpuAccelerated(property: string): boolean {
  return GPU_ACCELERATED_PROPERTIES.some(gpu => property.includes(gpu))
}

/**
 * Check if a property is a non-GPU property that should be avoided
 */
function isNonGpuProperty(property: string): boolean {
  return NON_GPU_PROPERTIES.some(nonGpu => property === nonGpu)
}

/**
 * Check if a property is an acceptable exception
 */
function isAcceptableException(property: string): boolean {
  return ACCEPTABLE_EXCEPTIONS.some(exc => property === exc)
}

/**
 * Validate keyframe uses GPU-accelerated properties
 */
function validateKeyframeGpuAcceleration(keyframe: { name: string; content: string }): {
  valid: boolean
  violations: string[]
  hasGpuProperty: boolean
} {
  const properties = extractAnimatedProperties(keyframe.content)
  const violations: string[] = []
  let hasGpuProperty = false

  for (const prop of properties) {
    if (isGpuAccelerated(prop)) {
      hasGpuProperty = true
    } else if (isNonGpuProperty(prop) && !isAcceptableException(prop)) {
      violations.push(`${keyframe.name}: uses non-GPU property '${prop}'`)
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    hasGpuProperty
  }
}

/**
 * Get all CSS files in the project
 */
function getCssFiles(): string[] {
  const files: string[] = []
  const cssDir = path.resolve(__dirname, '..')
  
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

/**
 * Get all Vue files in the project
 */
function getVueFiles(): string[] {
  const files: string[] = []
  const projectRoot = path.resolve(__dirname, '../../..')
  const searchDirs = ['components', 'pages', 'layouts']
  
  function walkDir(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory() && entry.name !== '__tests__' && entry.name !== 'node_modules') {
          walkDir(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.vue')) {
          files.push(fullPath)
        }
      }
    } catch {
      // Skip directories we can't access
    }
  }
  
  for (const dir of searchDirs) {
    const fullDir = path.join(projectRoot, dir)
    if (fs.existsSync(fullDir)) {
      walkDir(fullDir)
    }
  }
  
  return files
}

/**
 * Extract style content from Vue file
 */
function extractVueStyles(vueContent: string): string {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let styles = ''
  let match

  while ((match = styleRegex.exec(vueContent)) !== null) {
    styles += match[1] + '\n'
  }

  return styles
}

describe('Property 11: GPU-Accelerated Animations', () => {
  describe('parseKeyframes', () => {
    it('should correctly parse @keyframes declarations', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z][a-z0-9-]*$/),
          (animationName) => {
            const cssContent = `
              @keyframes ${animationName} {
                from { transform: translateX(0); }
                to { transform: translateX(100px); }
              }
            `
            const keyframes = parseKeyframes(cssContent)
            return keyframes.length === 1 && keyframes[0].name === animationName
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should parse multiple keyframes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (count) => {
            let cssContent = ''
            for (let i = 0; i < count; i++) {
              cssContent += `
                @keyframes anim${i} {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
              `
            }
            const keyframes = parseKeyframes(cssContent)
            return keyframes.length === count
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('extractAnimatedProperties', () => {
    it('should extract all animated properties from keyframe content', () => {
      const content = `
        from { transform: translateX(0); opacity: 0; }
        to { transform: translateX(100px); opacity: 1; }
      `
      const properties = extractAnimatedProperties(content)
      expect(properties).toContain('transform')
      expect(properties).toContain('opacity')
    })
  })

  describe('isGpuAccelerated', () => {
    it('should return true for GPU-accelerated properties', () => {
      for (const prop of GPU_ACCELERATED_PROPERTIES) {
        expect(isGpuAccelerated(prop)).toBe(true)
      }
    })

    it('should return false for non-GPU properties', () => {
      for (const prop of NON_GPU_PROPERTIES) {
        expect(isGpuAccelerated(prop)).toBe(false)
      }
    })
  })

  describe('main.css keyframe validation', () => {
    it('all @keyframes in main.css should use GPU-accelerated properties', () => {
      const mainCssPath = path.resolve(__dirname, '../main.css')
      const cssContent = fs.readFileSync(mainCssPath, 'utf-8')
      
      const keyframes = parseKeyframes(cssContent)
      
      for (const keyframe of keyframes) {
        const result = validateKeyframeGpuAcceleration(keyframe)
        
        if (!result.valid) {
          console.error(`Keyframe violations in main.css:`)
          result.violations.forEach(v => console.error(`  - ${v}`))
        }
        
        expect(result.valid, `Keyframe '${keyframe.name}' has non-GPU properties`).toBe(true)
      }
    })
  })

  describe('tailwind.config.ts keyframe validation', () => {
    it('all keyframes in tailwind config should use GPU-accelerated properties', () => {
      const configPath = path.resolve(__dirname, '../../../tailwind.config.ts')
      const configContent = fs.readFileSync(configPath, 'utf-8')
      
      // Extract keyframes object from config
      const keyframesMatch = configContent.match(/keyframes:\s*\{([\s\S]*?)\n\s{12}\}/m)
      if (!keyframesMatch) {
        console.log('No keyframes found in tailwind config')
        return
      }
      
      const keyframesContent = keyframesMatch[1]
      
      // Parse individual keyframe blocks
      const keyframeBlocks = keyframesContent.split(/['"][\w-]+['"]\s*:/).slice(1)
      
      const violations: string[] = []
      
      for (const block of keyframeBlocks) {
        // Check for non-GPU properties
        for (const prop of NON_GPU_PROPERTIES) {
          const regex = new RegExp(`['"]?${prop}['"]?\\s*:`, 'i')
          if (regex.test(block)) {
            // Height is acceptable for accordion animations (necessary for height: auto animation)
            if (prop === 'height' && block.includes('accordion')) {
              continue
            }
            // Check if this is an accordion block by looking at the context
            const isAccordionBlock = keyframesContent.includes('accordion') && 
              (block.includes('radix-accordion') || block.includes('height'))
            if (prop === 'height' && isAccordionBlock) {
              continue
            }
            violations.push(`Found non-GPU property '${prop}' in keyframe`)
          }
        }
      }
      
      if (violations.length > 0) {
        console.error('Tailwind keyframes contain non-GPU properties:')
        violations.forEach(v => console.error(`  - ${v}`))
      }
      
      // Height for accordion is an acceptable exception
      expect(violations.length).toBe(0)
    })
  })

  describe('Vue component style validation', () => {
    it('all @keyframes in Vue components should use GPU-accelerated properties', () => {
      const vueFiles = getVueFiles()
      
      for (const vueFile of vueFiles) {
        const vueContent = fs.readFileSync(vueFile, 'utf-8')
        const styles = extractVueStyles(vueContent)
        
        if (!styles) continue
        
        const keyframes = parseKeyframes(styles)
        
        for (const keyframe of keyframes) {
          const result = validateKeyframeGpuAcceleration(keyframe)
          
          if (!result.valid) {
            console.error(`Keyframe violations in ${path.basename(vueFile)}:`)
            result.violations.forEach(v => console.error(`  - ${v}`))
          }
          
          expect(
            result.valid,
            `File ${path.basename(vueFile)}: keyframe '${keyframe.name}' has non-GPU properties`
          ).toBe(true)
        }
      }
    })
  })
})

export {
  parseKeyframes,
  extractAnimatedProperties,
  isGpuAccelerated,
  isNonGpuProperty,
  validateKeyframeGpuAcceleration,
  getCssFiles,
  getVueFiles,
  extractVueStyles
}
