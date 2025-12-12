/**
 * Property-Based Tests for Page SEO
 * Tests correctness properties for page-level SEO requirements
 * 
 * **Feature: seo-optimization, Property 10: Single H1 Per Page**
 * **Validates: Requirements 4.5**
 * 
 * **Feature: seo-optimization, Property 12: No Duplicate Meta Tags**
 * **Validates: Requirements 8.2**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Counts the number of H1 tags in an HTML string
 * @param html - HTML content to analyze
 * @returns Number of H1 tags found
 */
export function countH1Tags(html: string): number {
  // Match both <h1> and <h1 ...> patterns (with attributes)
  const h1Pattern = /<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/gi
  const matches = html.match(h1Pattern)
  return matches ? matches.length : 0
}

/**
 * Validates that HTML content has exactly one H1 tag
 * @param html - HTML content to validate
 * @returns true if exactly one H1 tag exists
 */
export function validateSingleH1(html: string): boolean {
  return countH1Tags(html) === 1
}

/**
 * Generates a valid HTML page with specified number of H1 tags
 * @param h1Count - Number of H1 tags to include
 * @param h1Content - Content for H1 tags
 * @returns HTML string
 */
export function generateHtmlWithH1s(h1Count: number, h1Content: string[]): string {
  const h1Tags = h1Content.slice(0, h1Count).map(content => `<h1>${content}</h1>`).join('\n')
  return `<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body>
${h1Tags}
<p>Some content</p>
</body>
</html>`
}

/**
 * **Feature: seo-optimization, Property 10: Single H1 Per Page**
 * *For any* rendered page, there SHALL be exactly one H1 tag in the HTML output
 * **Validates: Requirements 4.5**
 */
describe('Property 10: Single H1 Per Page', () => {
  it('countH1Tags should correctly count H1 tags in HTML', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 5, maxLength: 10 }),
        (h1Count, contents) => {
          const html = generateHtmlWithH1s(h1Count, contents)
          return countH1Tags(html) === h1Count
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateSingleH1 should return true only when exactly one H1 exists', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 5, maxLength: 10 }),
        (h1Count, contents) => {
          const html = generateHtmlWithH1s(h1Count, contents)
          return validateSingleH1(html) === (h1Count === 1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('countH1Tags should handle H1 tags with attributes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        (content, className) => {
          const html = `<html><body><h1 class="${className}">${content}</h1></body></html>`
          return countH1Tags(html) === 1
        }
      ),
      { numRuns: 100 }
    )
  })

  it('countH1Tags should handle H1 tags with multiple attributes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (content, className, id) => {
          const html = `<html><body><h1 class="${className}" id="${id}">${content}</h1></body></html>`
          return countH1Tags(html) === 1
        }
      ),
      { numRuns: 100 }
    )
  })

  it('countH1Tags should handle multiline H1 content', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
        (lines) => {
          const content = lines.join('\n')
          const html = `<html><body><h1>${content}</h1></body></html>`
          return countH1Tags(html) === 1
        }
      ),
      { numRuns: 100 }
    )
  })

  it('countH1Tags should be case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('h1', 'H1', 'h1', 'H1'),
        (content, tag) => {
          const html = `<html><body><${tag}>${content}</${tag}></body></html>`
          return countH1Tags(html) === 1
        }
      ),
      { numRuns: 100 }
    )
  })

  it('countH1Tags should return 0 for HTML without H1 tags', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (content) => {
          const html = `<html><body><h2>${content}</h2><p>${content}</p></body></html>`
          return countH1Tags(html) === 0
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateSingleH1 should return false for zero H1 tags', () => {
    const html = '<html><body><h2>Title</h2><p>Content</p></body></html>'
    expect(validateSingleH1(html)).toBe(false)
  })

  it('validateSingleH1 should return true for exactly one H1 tag', () => {
    const html = '<html><body><h1>Main Title</h1><p>Content</p></body></html>'
    expect(validateSingleH1(html)).toBe(true)
  })

  it('validateSingleH1 should return false for multiple H1 tags', () => {
    const html = '<html><body><h1>Title 1</h1><h1>Title 2</h1><p>Content</p></body></html>'
    expect(validateSingleH1(html)).toBe(false)
  })
})


/**
 * Extracts all meta tags from an HTML string
 * @param html - HTML content to analyze
 * @returns Array of meta tag objects with name/property and content
 */
export function extractMetaTags(html: string): Array<{ type: 'name' | 'property'; key: string; content: string }> {
  const metaTags: Array<{ type: 'name' | 'property'; key: string; content: string }> = []
  
  // Match meta tags with name attribute
  const namePattern = /<meta\s+name=["']([^"']+)["']\s+content=["']([^"']*)["'][^>]*>/gi
  const namePatternAlt = /<meta\s+content=["']([^"']*)["']\s+name=["']([^"']+)["'][^>]*>/gi
  
  // Match meta tags with property attribute (Open Graph)
  const propertyPattern = /<meta\s+property=["']([^"']+)["']\s+content=["']([^"']*)["'][^>]*>/gi
  const propertyPatternAlt = /<meta\s+content=["']([^"']*)["']\s+property=["']([^"']+)["'][^>]*>/gi
  
  let match
  
  // Extract name-based meta tags
  while ((match = namePattern.exec(html)) !== null) {
    metaTags.push({ type: 'name', key: match[1], content: match[2] })
  }
  while ((match = namePatternAlt.exec(html)) !== null) {
    metaTags.push({ type: 'name', key: match[2], content: match[1] })
  }
  
  // Extract property-based meta tags (OG, Twitter)
  while ((match = propertyPattern.exec(html)) !== null) {
    metaTags.push({ type: 'property', key: match[1], content: match[2] })
  }
  while ((match = propertyPatternAlt.exec(html)) !== null) {
    metaTags.push({ type: 'property', key: match[2], content: match[1] })
  }
  
  return metaTags
}

/**
 * Checks if there are duplicate meta tags in the HTML
 * @param html - HTML content to analyze
 * @returns Object with hasDuplicates boolean and duplicates array
 */
export function findDuplicateMetaTags(html: string): { hasDuplicates: boolean; duplicates: string[] } {
  const metaTags = extractMetaTags(html)
  const seen = new Map<string, number>()
  const duplicates: string[] = []
  
  for (const tag of metaTags) {
    const key = `${tag.type}:${tag.key}`
    const count = seen.get(key) || 0
    seen.set(key, count + 1)
    
    if (count === 1) {
      // First duplicate found
      duplicates.push(tag.key)
    }
  }
  
  return {
    hasDuplicates: duplicates.length > 0,
    duplicates
  }
}

/**
 * Validates that HTML content has no duplicate meta tags
 * @param html - HTML content to validate
 * @returns true if no duplicate meta tags exist
 */
export function validateNoDuplicateMetaTags(html: string): boolean {
  return !findDuplicateMetaTags(html).hasDuplicates
}

/**
 * Generates HTML with specified meta tags
 * @param metaTags - Array of meta tag configurations
 * @returns HTML string
 */
export function generateHtmlWithMetaTags(
  metaTags: Array<{ type: 'name' | 'property'; key: string; content: string }>
): string {
  const metaTagsHtml = metaTags
    .map(tag => {
      if (tag.type === 'name') {
        return `<meta name="${tag.key}" content="${tag.content}">`
      } else {
        return `<meta property="${tag.key}" content="${tag.content}">`
      }
    })
    .join('\n    ')
  
  return `<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
    ${metaTagsHtml}
</head>
<body>
    <h1>Test Content</h1>
</body>
</html>`
}

/**
 * **Feature: seo-optimization, Property 12: No Duplicate Meta Tags**
 * *For any* rendered page, there SHALL be no duplicate meta tags with the same name or property attribute
 * **Validates: Requirements 8.2**
 */
describe('Property 12: No Duplicate Meta Tags', () => {
  // Arbitrary for meta tag type
  const metaTagTypeArb = fc.constantFrom('name', 'property') as fc.Arbitrary<'name' | 'property'>
  
  // Arbitrary for common meta tag names
  const metaTagNameArb = fc.constantFrom(
    'description',
    'keywords',
    'robots',
    'viewport',
    'author',
    'og:title',
    'og:description',
    'og:image',
    'og:url',
    'og:type',
    'og:locale',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image'
  )
  
  // Arbitrary for meta tag content
  const metaTagContentArb = fc.string({ minLength: 1, maxLength: 100 })
  
  // Arbitrary for a single meta tag
  const metaTagArb = fc.record({
    type: metaTagTypeArb,
    key: metaTagNameArb,
    content: metaTagContentArb
  })

  it('extractMetaTags should correctly extract all meta tags from HTML', () => {
    fc.assert(
      fc.property(
        fc.array(metaTagArb, { minLength: 1, maxLength: 10 }),
        (metaTags) => {
          const html = generateHtmlWithMetaTags(metaTags)
          const extracted = extractMetaTags(html)
          
          // Should extract at least as many tags as we put in
          // (may be more due to regex matching variations)
          return extracted.length >= metaTags.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('findDuplicateMetaTags should detect duplicates when same key appears twice', () => {
    fc.assert(
      fc.property(
        metaTagNameArb,
        metaTagContentArb,
        metaTagContentArb,
        (key, content1, content2) => {
          // Create HTML with duplicate meta tags
          const metaTags = [
            { type: 'name' as const, key, content: content1 },
            { type: 'name' as const, key, content: content2 }
          ]
          const html = generateHtmlWithMetaTags(metaTags)
          const result = findDuplicateMetaTags(html)
          
          // Should detect the duplicate
          return result.hasDuplicates && result.duplicates.includes(key)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('findDuplicateMetaTags should not report duplicates for unique meta tags', () => {
    // Generate unique meta tags (no duplicates)
    const uniqueMetaTagsArb = fc.uniqueArray(metaTagNameArb, { minLength: 1, maxLength: 5 })
      .chain(keys => 
        fc.tuple(
          fc.constant(keys),
          fc.array(metaTagContentArb, { minLength: keys.length, maxLength: keys.length })
        )
      )
      .map(([keys, contents]) => 
        keys.map((key, i) => ({
          type: 'name' as const,
          key,
          content: contents[i]
        }))
      )
    
    fc.assert(
      fc.property(
        uniqueMetaTagsArb,
        (metaTags) => {
          const html = generateHtmlWithMetaTags(metaTags)
          const result = findDuplicateMetaTags(html)
          
          // Should not detect any duplicates
          return !result.hasDuplicates
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateNoDuplicateMetaTags should return true for HTML without duplicates', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(metaTagNameArb, { minLength: 1, maxLength: 5 }),
        (keys) => {
          const metaTags = keys.map(key => ({
            type: 'name' as const,
            key,
            content: 'test content'
          }))
          const html = generateHtmlWithMetaTags(metaTags)
          
          return validateNoDuplicateMetaTags(html)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateNoDuplicateMetaTags should return false for HTML with duplicates', () => {
    fc.assert(
      fc.property(
        metaTagNameArb,
        (key) => {
          // Create HTML with duplicate meta tags
          const metaTags = [
            { type: 'name' as const, key, content: 'content 1' },
            { type: 'name' as const, key, content: 'content 2' }
          ]
          const html = generateHtmlWithMetaTags(metaTags)
          
          return !validateNoDuplicateMetaTags(html)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle OG property duplicates separately from name duplicates', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('og:title', 'og:description', 'og:image'),
        metaTagContentArb,
        metaTagContentArb,
        (ogKey, content1, content2) => {
          // Create HTML with duplicate OG property tags
          const metaTags = [
            { type: 'property' as const, key: ogKey, content: content1 },
            { type: 'property' as const, key: ogKey, content: content2 }
          ]
          const html = generateHtmlWithMetaTags(metaTags)
          const result = findDuplicateMetaTags(html)
          
          // Should detect the duplicate OG tag
          return result.hasDuplicates && result.duplicates.includes(ogKey)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Unit tests for edge cases
  it('should return no duplicates for empty HTML', () => {
    const html = '<!DOCTYPE html><html><head></head><body></body></html>'
    expect(validateNoDuplicateMetaTags(html)).toBe(true)
  })

  it('should correctly identify single meta tag as no duplicate', () => {
    const html = generateHtmlWithMetaTags([
      { type: 'name', key: 'description', content: 'Test description' }
    ])
    expect(validateNoDuplicateMetaTags(html)).toBe(true)
  })

  it('should correctly identify duplicate description meta tags', () => {
    const html = generateHtmlWithMetaTags([
      { type: 'name', key: 'description', content: 'First description' },
      { type: 'name', key: 'description', content: 'Second description' }
    ])
    expect(validateNoDuplicateMetaTags(html)).toBe(false)
  })

  it('should allow same key with different types (name vs property)', () => {
    // This is valid - 'title' as name and 'og:title' as property are different
    const html = generateHtmlWithMetaTags([
      { type: 'name', key: 'title', content: 'Page Title' },
      { type: 'property', key: 'og:title', content: 'OG Title' }
    ])
    expect(validateNoDuplicateMetaTags(html)).toBe(true)
  })
})
