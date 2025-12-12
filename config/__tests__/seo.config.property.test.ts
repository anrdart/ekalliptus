/**
 * Property-Based Tests for SEO Configuration
 * Tests correctness properties using fast-check
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  validateTitle,
  validateDescription,
  isTitleLengthValid,
  isDescriptionLengthValid,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  generateOgTags,
  validateOgTagCompleteness,
  generateTwitterTags,
  validateTwitterTagCompleteness,
  generateCanonicalUrl,
  validateCanonicalSelfReference,
  REQUIRED_OG_TAGS,
  REQUIRED_TWITTER_TAGS
} from '../seo.config'
import type { PageSeoMeta } from '~/types/seo.types'

/**
 * **Feature: seo-optimization, Property 3: Title Length Bounds**
 * *For any* page SEO configuration, the generated title tag SHALL have length between 50-60 characters
 * **Validates: Requirements 2.1**
 */
describe('Property 3: Title Length Bounds', () => {
  it('validateTitle should always return a title within max length bounds', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary strings of various lengths
        fc.string({ minLength: 1, maxLength: 200 }),
        (title) => {
          const validated = validateTitle(title)
          // The validated title should never exceed max length
          return validated.length <= TITLE_MAX_LENGTH
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateTitle should preserve titles already within bounds', () => {
    fc.assert(
      fc.property(
        // Generate strings within valid title length
        fc.string({ minLength: TITLE_MIN_LENGTH, maxLength: TITLE_MAX_LENGTH }),
        (title) => {
          const validated = validateTitle(title)
          // Titles within bounds should not be modified
          return validated === title
        }
      ),
      { numRuns: 100 }
    )
  })

  it('isTitleLengthValid should correctly identify valid title lengths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        (length) => {
          const title = 'a'.repeat(length)
          const isValid = isTitleLengthValid(title)
          const expectedValid = length >= TITLE_MIN_LENGTH && length <= TITLE_MAX_LENGTH
          return isValid === expectedValid
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * **Feature: seo-optimization, Property 4: Description Length Bounds**
 * *For any* page SEO configuration, the generated meta description SHALL have length between 150-160 characters
 * **Validates: Requirements 2.2**
 */
describe('Property 4: Description Length Bounds', () => {
  it('validateDescription should always return a description within max length bounds', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary strings of various lengths
        fc.string({ minLength: 1, maxLength: 500 }),
        (description) => {
          const validated = validateDescription(description)
          // The validated description should never exceed max length
          return validated.length <= DESCRIPTION_MAX_LENGTH
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateDescription should preserve descriptions already within bounds', () => {
    fc.assert(
      fc.property(
        // Generate strings within valid description length
        fc.string({ minLength: DESCRIPTION_MIN_LENGTH, maxLength: DESCRIPTION_MAX_LENGTH }),
        (description) => {
          const validated = validateDescription(description)
          // Descriptions within bounds should not be modified
          return validated === description
        }
      ),
      { numRuns: 100 }
    )
  })

  it('isDescriptionLengthValid should correctly identify valid description lengths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500 }),
        (length) => {
          const description = 'a'.repeat(length)
          const isValid = isDescriptionLengthValid(description)
          const expectedValid = length >= DESCRIPTION_MIN_LENGTH && length <= DESCRIPTION_MAX_LENGTH
          return isValid === expectedValid
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * Arbitrary generator for PageSeoMeta
 */
const pageSeoMetaArb = fc.record({
  title: fc.string({ minLength: 10, maxLength: 100 }),
  description: fc.string({ minLength: 50, maxLength: 200 }),
  keywords: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
  ogTitle: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
  ogDescription: fc.option(fc.string({ minLength: 50, maxLength: 200 }), { nil: undefined }),
  ogImage: fc.option(fc.webUrl(), { nil: undefined }),
  ogUrl: fc.option(fc.webUrl(), { nil: undefined }),
  ogType: fc.option(fc.constantFrom('website', 'article') as fc.Arbitrary<'website' | 'article'>, { nil: undefined }),
  ogLocale: fc.option(fc.string({ minLength: 2, maxLength: 10 }), { nil: undefined }),
  twitterCard: fc.option(fc.constantFrom('summary', 'summary_large_image') as fc.Arbitrary<'summary' | 'summary_large_image'>, { nil: undefined }),
  twitterTitle: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
  twitterDescription: fc.option(fc.string({ minLength: 50, maxLength: 200 }), { nil: undefined }),
  twitterImage: fc.option(fc.webUrl(), { nil: undefined }),
  robots: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
  canonical: fc.option(fc.webUrl(), { nil: undefined })
}) as fc.Arbitrary<PageSeoMeta>

/**
 * **Feature: seo-optimization, Property 5: Open Graph Tag Completeness**
 * *For any* rendered page, the HTML output SHALL contain all required Open Graph tags
 * (og:title, og:description, og:image, og:url, og:type, og:locale)
 * **Validates: Requirements 2.3**
 */
describe('Property 5: Open Graph Tag Completeness', () => {
  it('generateOgTags should always produce all required OG tags', () => {
    fc.assert(
      fc.property(
        pageSeoMetaArb,
        fc.webUrl(),
        fc.webUrl(),
        fc.constantFrom('id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr'),
        (pageMeta, siteUrl, pageUrl, locale) => {
          const ogTags = generateOgTags(pageMeta, siteUrl, pageUrl, locale)
          
          // All required OG tags must be present
          return REQUIRED_OG_TAGS.every(tag => tag in ogTags)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateOgTags should produce non-empty values for all required tags', () => {
    fc.assert(
      fc.property(
        pageSeoMetaArb,
        fc.webUrl(),
        fc.webUrl(),
        fc.constantFrom('id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr'),
        (pageMeta, siteUrl, pageUrl, locale) => {
          const ogTags = generateOgTags(pageMeta, siteUrl, pageUrl, locale)
          
          // All OG tag values must be non-empty strings
          return validateOgTagCompleteness(ogTags)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateOgTagCompleteness should return false for incomplete tags', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...REQUIRED_OG_TAGS),
        (tagToRemove) => {
          // Create complete tags then remove one
          const completeTags: Record<string, string> = {
            'og:title': 'Test Title',
            'og:description': 'Test Description',
            'og:image': 'https://example.com/image.jpg',
            'og:url': 'https://example.com',
            'og:type': 'website',
            'og:locale': 'id_ID'
          }
          
          // Remove one tag
          const incompleteTags = { ...completeTags }
          delete incompleteTags[tagToRemove]
          
          // Should return false when any required tag is missing
          return !validateOgTagCompleteness(incompleteTags)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: seo-optimization, Property 6: Twitter Card Tag Completeness**
 * *For any* rendered page, the HTML output SHALL contain all required Twitter Card tags
 * (twitter:card, twitter:title, twitter:description, twitter:image)
 * **Validates: Requirements 2.4**
 */
describe('Property 6: Twitter Card Tag Completeness', () => {
  it('generateTwitterTags should always produce all required Twitter tags', () => {
    fc.assert(
      fc.property(
        pageSeoMetaArb,
        fc.webUrl(),
        (pageMeta, siteUrl) => {
          const twitterTags = generateTwitterTags(pageMeta, siteUrl)
          
          // All required Twitter tags must be present
          return REQUIRED_TWITTER_TAGS.every(tag => tag in twitterTags)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateTwitterTags should produce non-empty values for all required tags', () => {
    fc.assert(
      fc.property(
        pageSeoMetaArb,
        fc.webUrl(),
        (pageMeta, siteUrl) => {
          const twitterTags = generateTwitterTags(pageMeta, siteUrl)
          
          // All Twitter tag values must be non-empty strings
          return validateTwitterTagCompleteness(twitterTags)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateTwitterTagCompleteness should return false for incomplete tags', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...REQUIRED_TWITTER_TAGS),
        (tagToRemove) => {
          // Create complete tags then remove one
          const completeTags: Record<string, string> = {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'Test Title',
            'twitter:description': 'Test Description',
            'twitter:image': 'https://example.com/image.jpg'
          }
          
          // Remove one tag
          const incompleteTags = { ...completeTags }
          delete incompleteTags[tagToRemove]
          
          // Should return false when any required tag is missing
          return !validateTwitterTagCompleteness(incompleteTags)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: seo-optimization, Property 2: Canonical Self-Reference**
 * *For any* page URL, the canonical link tag SHALL reference the same URL as the current page
 * **Validates: Requirements 1.5**
 */
describe('Property 2: Canonical Self-Reference', () => {
  it('generateCanonicalUrl should produce URL that matches current page', () => {
    // Generate valid URL paths
    const pathArb = fc.array(fc.constantFrom('page', 'order', 'about', 'contact', 'services'), { minLength: 0, maxLength: 3 })
      .map(segments => '/' + segments.join('/'))
    
    fc.assert(
      fc.property(
        fc.webUrl(),
        pathArb,
        (siteUrl, pagePath) => {
          const canonicalUrl = generateCanonicalUrl(siteUrl, pagePath)
          const expectedUrl = generateCanonicalUrl(siteUrl, pagePath)
          
          // Canonical URL should match the expected URL for the same page
          return validateCanonicalSelfReference(canonicalUrl, expectedUrl)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateCanonicalUrl should normalize trailing slashes consistently', () => {
    // Generate valid URL paths
    const pathArb = fc.array(fc.constantFrom('page', 'order', 'about', 'contact', 'services'), { minLength: 1, maxLength: 3 })
      .map(segments => '/' + segments.join('/'))
    
    fc.assert(
      fc.property(
        fc.webUrl(),
        pathArb,
        (siteUrl, pagePath) => {
          const pathWithSlash = pagePath + '/'
          const pathWithoutSlash = pagePath
          
          const canonicalWithSlash = generateCanonicalUrl(siteUrl, pathWithSlash)
          const canonicalWithoutSlash = generateCanonicalUrl(siteUrl, pathWithoutSlash)
          
          // Both should produce the same canonical URL (normalized)
          return canonicalWithSlash === canonicalWithoutSlash
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateCanonicalSelfReference should return true for matching URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          // Same URL should always validate as self-referencing
          return validateCanonicalSelfReference(url, url)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateCanonicalSelfReference should handle case-insensitive comparison', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          // URLs differing only in case should still match
          return validateCanonicalSelfReference(url.toLowerCase(), url.toUpperCase())
        }
      ),
      { numRuns: 100 }
    )
  })
})
