/**
 * Property-Based Tests for Sitemap Composable
 * Tests correctness properties using fast-check
 * Requirements: 1.2, 6.4, 8.3
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  generateSitemapUrl,
  generateAlternatives,
  generateSitemapConfig,
  generateSitemapXml,
  validateSitemapXml,
  validateSitemapPageInclusion,
  validateSitemapExclusion,
  validateLastmodDates,
  validateI18nAlternatives,
  validatePriorityValues,
  validateChangefreqValues,
  SUPPORTED_LOCALES,
  PUBLIC_PAGES,
  EXCLUDED_PAGES,
  type SitemapUrl,
  type SitemapConfig
} from '../useSitemap'

/**
 * Arbitrary generator for valid URL paths
 */
const validPathArb = fc.stringMatching(/^\/[a-z0-9-]{0,20}$/)

/**
 * Arbitrary generator for valid site URLs
 */
const validSiteUrlArb = fc.constantFrom(
  'https://ekalliptus.id',
  'https://example.com',
  'https://test-site.org'
)

/**
 * Arbitrary generator for valid changefreq values
 */
const changefreqArb = fc.constantFrom(
  'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
) as fc.Arbitrary<SitemapUrl['changefreq']>

/**
 * Arbitrary generator for valid priority values (0.0 to 1.0)
 */
const priorityArb = fc.double({ min: 0.0, max: 1.0, noNaN: true })

/**
 * Arbitrary generator for valid ISO date strings
 * Using integer-based approach to avoid invalid date issues
 */
const isoDateArb = fc.integer({ min: 1577836800000, max: 1924905600000 }) // 2020-01-01 to 2030-12-31
  .map(timestamp => new Date(timestamp).toISOString())

/**
 * Arbitrary generator for sitemap URL entries
 */
const sitemapUrlArb: fc.Arbitrary<SitemapUrl> = fc.record({
  loc: fc.tuple(validSiteUrlArb, validPathArb).map(([site, path]) => 
    path === '/' ? site + '/' : site + path
  ),
  lastmod: fc.option(isoDateArb, { nil: undefined }),
  changefreq: fc.option(changefreqArb, { nil: undefined }),
  priority: fc.option(priorityArb, { nil: undefined }),
  alternatives: fc.option(
    fc.array(
      fc.record({
        hreflang: fc.stringMatching(/^[a-z]{2}(-[A-Z]{2})?$/),
        href: fc.webUrl()
      }),
      { minLength: 1, maxLength: 10 }
    ),
    { nil: undefined }
  )
})

/**
 * Arbitrary generator for sitemap config
 */
const sitemapConfigArb: fc.Arbitrary<SitemapConfig> = fc.record({
  siteUrl: validSiteUrlArb,
  urls: fc.array(sitemapUrlArb, { minLength: 1, maxLength: 10 }),
  exclude: fc.option(
    fc.array(validPathArb, { minLength: 0, maxLength: 5 }),
    { nil: undefined }
  ),
  defaults: fc.option(
    fc.record({
      changefreq: fc.option(changefreqArb, { nil: undefined }),
      priority: fc.option(priorityArb, { nil: undefined }),
      lastmod: fc.option(isoDateArb, { nil: undefined })
    }),
    { nil: undefined }
  )
})


/**
 * **Feature: seo-optimization, Property 13: Sitemap XML Validity**
 * *For any* generated sitemap content, the XML SHALL be valid and parseable
 * **Validates: Requirements 8.3**
 */
describe('Property 13: Sitemap XML Validity', () => {
  it('generateSitemapXml should produce valid XML structure', () => {
    fc.assert(
      fc.property(
        sitemapConfigArb,
        (config) => {
          const xml = generateSitemapXml(config)
          return validateSitemapXml(xml)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapXml should include XML declaration', () => {
    fc.assert(
      fc.property(
        sitemapConfigArb,
        (config) => {
          const xml = generateSitemapXml(config)
          return xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapXml should include proper namespace', () => {
    fc.assert(
      fc.property(
        sitemapConfigArb,
        (config) => {
          const xml = generateSitemapXml(config)
          return xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapXml should include xhtml namespace for alternatives', () => {
    fc.assert(
      fc.property(
        sitemapConfigArb,
        (config) => {
          const xml = generateSitemapXml(config)
          return xml.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapXml should have balanced url tags', () => {
    fc.assert(
      fc.property(
        sitemapConfigArb,
        (config) => {
          const xml = generateSitemapXml(config)
          const openCount = (xml.match(/<url>/g) || []).length
          const closeCount = (xml.match(/<\/url>/g) || []).length
          return openCount === closeCount && openCount === config.urls.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapXml should have one loc per url', () => {
    fc.assert(
      fc.property(
        sitemapConfigArb,
        (config) => {
          const xml = generateSitemapXml(config)
          const urlCount = (xml.match(/<url>/g) || []).length
          const locCount = (xml.match(/<loc>/g) || []).length
          return urlCount === locCount
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapXml should escape special XML characters', () => {
    const configWithSpecialChars: SitemapConfig = {
      siteUrl: 'https://example.com',
      urls: [{
        loc: 'https://example.com/test?a=1&b=2',
        lastmod: new Date().toISOString()
      }]
    }
    
    const xml = generateSitemapXml(configWithSpecialChars)
    expect(xml).toContain('&amp;')
    expect(validateSitemapXml(xml)).toBe(true)
  })

  it('validateSitemapXml should reject invalid XML', () => {
    expect(validateSitemapXml('')).toBe(false)
    expect(validateSitemapXml('<invalid>')).toBe(false)
    expect(validateSitemapXml('<?xml version="1.0"?><url></url>')).toBe(false)
  })
})


/**
 * **Feature: seo-optimization, Property 14: Sitemap Page Inclusion**
 * *For any* set of public pages, the generated sitemap SHALL contain URLs for all pages with valid lastmod dates
 * **Validates: Requirements 1.2**
 */
describe('Property 14: Sitemap Page Inclusion', () => {
  it('generateSitemapConfig should include all public pages', () => {
    fc.assert(
      fc.property(
        validSiteUrlArb,
        (siteUrl) => {
          const config = generateSitemapConfig([...PUBLIC_PAGES], siteUrl)
          return validateSitemapPageInclusion(config, [...PUBLIC_PAGES])
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapConfig should exclude noindex pages', () => {
    fc.assert(
      fc.property(
        validSiteUrlArb,
        (siteUrl) => {
          // Try to include excluded pages - they should be filtered out
          const allPages = [...PUBLIC_PAGES, ...EXCLUDED_PAGES]
          const config = generateSitemapConfig(allPages, siteUrl)
          return validateSitemapExclusion(config, [...EXCLUDED_PAGES])
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapConfig should have valid lastmod dates for all URLs', () => {
    fc.assert(
      fc.property(
        validSiteUrlArb,
        (siteUrl) => {
          const config = generateSitemapConfig([...PUBLIC_PAGES], siteUrl)
          return validateLastmodDates(config)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapUrl should produce valid lastmod dates', () => {
    fc.assert(
      fc.property(
        validPathArb,
        isoDateArb,
        (path, lastmod) => {
          const url = generateSitemapUrl(path, { lastmod })
          const date = new Date(url.lastmod!)
          return !isNaN(date.getTime())
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapConfig should have valid priority values', () => {
    fc.assert(
      fc.property(
        validSiteUrlArb,
        (siteUrl) => {
          const config = generateSitemapConfig([...PUBLIC_PAGES], siteUrl)
          return validatePriorityValues(config)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapConfig should have valid changefreq values', () => {
    fc.assert(
      fc.property(
        validSiteUrlArb,
        (siteUrl) => {
          const config = generateSitemapConfig([...PUBLIC_PAGES], siteUrl)
          return validateChangefreqValues(config)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateSitemapConfig should include i18n alternatives for all URLs', () => {
    fc.assert(
      fc.property(
        validSiteUrlArb,
        (siteUrl) => {
          const config = generateSitemapConfig([...PUBLIC_PAGES], siteUrl)
          return validateI18nAlternatives(config)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateAlternatives should include all supported locales', () => {
    fc.assert(
      fc.property(
        validPathArb,
        validSiteUrlArb,
        (path, siteUrl) => {
          const alternatives = generateAlternatives(path, siteUrl)
          const hreflangs = alternatives.map(alt => alt.hreflang)
          
          // Should have all supported locales
          const hasAllLocales = SUPPORTED_LOCALES.every(locale => 
            hreflangs.includes(locale)
          )
          
          // Should have x-default
          const hasXDefault = hreflangs.includes('x-default')
          
          return hasAllLocales && hasXDefault
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateAlternatives should have correct count', () => {
    fc.assert(
      fc.property(
        validPathArb,
        validSiteUrlArb,
        (path, siteUrl) => {
          const alternatives = generateAlternatives(path, siteUrl)
          // Should have all locales + x-default
          return alternatives.length === SUPPORTED_LOCALES.length + 1
        }
      ),
      { numRuns: 100 }
    )
  })

  it('homepage should have highest priority', () => {
    fc.assert(
      fc.property(
        validSiteUrlArb,
        (siteUrl) => {
          const config = generateSitemapConfig(['/', '/order', '/about'], siteUrl)
          const homepageUrl = config.urls.find(url => url.loc.endsWith('/'))
          return homepageUrl?.priority === 1.0
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * Additional validation tests for edge cases
 */
describe('Sitemap Edge Cases', () => {
  it('should handle empty URL list gracefully', () => {
    const config: SitemapConfig = {
      siteUrl: 'https://example.com',
      urls: []
    }
    
    const xml = generateSitemapXml(config)
    expect(validateSitemapXml(xml)).toBe(true)
    expect(xml).toContain('<urlset')
    expect(xml).toContain('</urlset>')
  })

  it('should handle URLs with query parameters', () => {
    const config: SitemapConfig = {
      siteUrl: 'https://example.com',
      urls: [{
        loc: 'https://example.com/search?q=test&page=1',
        lastmod: new Date().toISOString()
      }]
    }
    
    const xml = generateSitemapXml(config)
    expect(validateSitemapXml(xml)).toBe(true)
    expect(xml).toContain('&amp;') // & should be escaped
  })

  it('should handle root path correctly', () => {
    const url = generateSitemapUrl('/')
    expect(url.loc).toBe('https://ekalliptus.id/')
  })

  it('should handle non-root paths correctly', () => {
    const url = generateSitemapUrl('/order')
    expect(url.loc).toBe('https://ekalliptus.id/order')
  })
})
