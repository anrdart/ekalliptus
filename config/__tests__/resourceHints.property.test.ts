/**
 * Property-Based Tests for Resource Hints Completeness
 * Tests correctness properties using fast-check
 * 
 * **Feature: performance-optimization, Property 13: Resource Hints Completeness**
 * *For any* external domain used by the application, there SHALL be a dns-prefetch 
 * or preconnect link tag in the document head
 * **Validates: Requirements 6.4, 6.5**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { externalDomains } from '../performance.config'

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * Validate that a domain has a resource hint configured
 */
function hasResourceHint(domain: string): boolean {
  const preconnectDomains = externalDomains.preconnect.map(url => extractDomain(url))
  const dnsPrefetchDomains = externalDomains.dnsPrefetch.map(url => extractDomain(url))
  
  const domainHostname = extractDomain(domain.startsWith('https://') ? domain : `https://${domain}`)
  
  return preconnectDomains.includes(domainHostname) || dnsPrefetchDomains.includes(domainHostname)
}

/**
 * Validate that critical domains have preconnect (not just dns-prefetch)
 */
function hasCriticalPreconnect(domain: string): boolean {
  const preconnectDomains = externalDomains.preconnect.map(url => extractDomain(url))
  const domainHostname = extractDomain(domain.startsWith('https://') ? domain : `https://${domain}`)
  
  return preconnectDomains.includes(domainHostname)
}

/**
 * List of all external domains used in the application
 * These are extracted from CSP headers and component usage
 */
const KNOWN_EXTERNAL_DOMAINS = [
  // Font domains (critical)
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  // CDN domains
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'static.cloudflareinsights.com',
  // API/service domains
  'api.emailjs.com',
  'sheetdb.io',
  // Supabase
  'muyzxygtlwsfegzyvgcm.supabase.co',
  // External links
  'wa.me',
  'me.ekalliptus.com'
]

/**
 * Critical domains that need preconnect for early connection establishment
 */
const CRITICAL_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com'
]

describe('Property 13: Resource Hints Completeness', () => {
  /**
   * Test that all known external domains have resource hints configured
   */
  it('all known external domains should have dns-prefetch or preconnect configured', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...KNOWN_EXTERNAL_DOMAINS),
        (domain) => {
          return hasResourceHint(domain)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test that critical domains have preconnect (not just dns-prefetch)
   */
  it('critical domains should have preconnect configured', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CRITICAL_DOMAINS),
        (domain) => {
          return hasCriticalPreconnect(domain)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test that preconnect domains are a subset of dns-prefetch domains
   * (preconnect implies dns-prefetch functionality)
   */
  it('preconnect domains should also be in dns-prefetch list', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...externalDomains.preconnect),
        (preconnectUrl) => {
          const domain = extractDomain(preconnectUrl)
          const dnsPrefetchDomains = externalDomains.dnsPrefetch.map(url => extractDomain(url))
          return dnsPrefetchDomains.includes(domain)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test that all configured domains are valid URLs
   */
  it('all configured domains should be valid URLs', () => {
    const allDomains = [...externalDomains.preconnect, ...externalDomains.dnsPrefetch]
    
    fc.assert(
      fc.property(
        fc.constantFrom(...allDomains),
        (url) => {
          try {
            new URL(url)
            return true
          } catch {
            return false
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test that preload assets are configured
   */
  it('critical assets should have preload configured', () => {
    // At minimum, the logo should be preloaded
    expect(externalDomains.preload).toBeDefined()
    expect(externalDomains.preload.length).toBeGreaterThan(0)
    expect(externalDomains.preload).toContain('/ekalliptus_rounded.webp')
  })

  /**
   * Test that no duplicate domains exist in the configuration
   */
  it('dns-prefetch list should not have duplicate domains', () => {
    const domains = externalDomains.dnsPrefetch.map(url => extractDomain(url))
    const uniqueDomains = [...new Set(domains)]
    expect(domains.length).toBe(uniqueDomains.length)
  })

  /**
   * Test that no duplicate domains exist in preconnect
   */
  it('preconnect list should not have duplicate domains', () => {
    const domains = externalDomains.preconnect.map(url => extractDomain(url))
    const uniqueDomains = [...new Set(domains)]
    expect(domains.length).toBe(uniqueDomains.length)
  })
})
