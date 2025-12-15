/**
 * Sitemap Utility Composable
 * Provides functions for sitemap generation and validation
 * Requirements: 1.2, 6.4, 8.3
 */

import type {
  SitemapUrl,
  SitemapAlternative,
  SitemapConfig
} from '~/types/seo.types'
import {
  SUPPORTED_LOCALES,
  PUBLIC_PAGES,
  EXCLUDED_PAGES
} from '~/types/seo.types'

export type { SitemapUrl, SitemapAlternative, SitemapConfig }
export { SUPPORTED_LOCALES, PUBLIC_PAGES, EXCLUDED_PAGES }

/**
 * Site configuration for sitemap generation
 */
const SITE_URL = 'https://ekalliptus.com'

/**
 * Generate sitemap URL entry with i18n alternatives
 * Requirements: 1.2, 6.4
 */
export function generateSitemapUrl(
  path: string,
  options?: {
    lastmod?: string
    changefreq?: SitemapUrl['changefreq']
    priority?: number
    includeAlternatives?: boolean
    siteUrl?: string
  }
): SitemapUrl {
  const siteUrl = options?.siteUrl || SITE_URL
  const fullUrl = path === '/' ? siteUrl + '/' : siteUrl + path

  const url: SitemapUrl = {
    loc: fullUrl,
    lastmod: options?.lastmod || new Date().toISOString(),
    changefreq: options?.changefreq || 'weekly',
    priority: options?.priority ?? 0.8
  }

  // Add i18n alternatives if requested (Requirements 6.4)
  if (options?.includeAlternatives !== false) {
    url.alternatives = generateAlternatives(path, siteUrl)
  }

  return url
}

/**
 * Generate hreflang alternatives for a URL
 * Requirements: 6.4
 */
export function generateAlternatives(
  path: string,
  siteUrl: string = SITE_URL
): SitemapAlternative[] {
  const fullUrl = path === '/' ? siteUrl + '/' : siteUrl + path

  const alternatives: SitemapAlternative[] = SUPPORTED_LOCALES.map(locale => ({
    hreflang: locale,
    href: fullUrl
  }))

  // Add x-default pointing to Indonesian version (Requirements 6.2)
  alternatives.push({
    hreflang: 'x-default',
    href: fullUrl
  })

  return alternatives
}

/**
 * Generate complete sitemap configuration
 * Requirements: 1.2, 6.4
 */
export function generateSitemapConfig(
  pages: string[] = [...PUBLIC_PAGES],
  siteUrl: string = SITE_URL
): SitemapConfig {
  // Filter out excluded pages
  const includedPages = pages.filter(
    page => !EXCLUDED_PAGES.includes(page as typeof EXCLUDED_PAGES[number])
  )

  const urls = includedPages.map((page, index) =>
    generateSitemapUrl(page, {
      siteUrl,
      priority: index === 0 ? 1.0 : 0.9 - (index * 0.1),
      includeAlternatives: true
    })
  )

  return {
    siteUrl,
    urls,
    exclude: [...EXCLUDED_PAGES],
    defaults: {
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString()
    }
  }
}

/**
 * Generate XML sitemap string from config
 * Requirements: 8.3
 */
export function generateSitemapXml(config: SitemapConfig): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>'
  const urlsetOpen = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`
  const urlsetClose = '</urlset>'

  const urlEntries = config.urls.map(url => {
    let entry = '  <url>\n'
    entry += `    <loc>${escapeXml(url.loc)}</loc>\n`

    if (url.lastmod) {
      entry += `    <lastmod>${escapeXml(url.lastmod)}</lastmod>\n`
    }

    if (url.changefreq) {
      entry += `    <changefreq>${url.changefreq}</changefreq>\n`
    }

    if (url.priority !== undefined) {
      entry += `    <priority>${url.priority.toFixed(1)}</priority>\n`
    }

    // Add xhtml:link for alternatives (Requirements 6.4)
    if (url.alternatives && url.alternatives.length > 0) {
      url.alternatives.forEach(alt => {
        entry += `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />\n`
      })
    }

    entry += '  </url>'
    return entry
  }).join('\n')

  return `${xmlHeader}\n${urlsetOpen}\n${urlEntries}\n${urlsetClose}`
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Validate sitemap XML syntax
 * Requirements: 8.3
 */
export function validateSitemapXml(xml: string): boolean {
  try {
    // Check for XML declaration
    if (!xml.startsWith('<?xml')) {
      return false
    }

    // Check for urlset element
    if (!xml.includes('<urlset') || !xml.includes('</urlset>')) {
      return false
    }

    // Check for proper namespace
    if (!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
      return false
    }

    // Check for balanced tags
    const urlOpenCount = (xml.match(/<url>/g) || []).length
    const urlCloseCount = (xml.match(/<\/url>/g) || []).length
    if (urlOpenCount !== urlCloseCount) {
      return false
    }

    const locOpenCount = (xml.match(/<loc>/g) || []).length
    const locCloseCount = (xml.match(/<\/loc>/g) || []).length
    if (locOpenCount !== locCloseCount) {
      return false
    }

    // Each URL should have exactly one loc
    if (urlOpenCount !== locOpenCount) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Validate that sitemap includes all required pages
 * Requirements: 1.2
 */
export function validateSitemapPageInclusion(
  config: SitemapConfig,
  requiredPages: string[]
): boolean {
  const includedLocs = config.urls.map(url => {
    // Extract path from full URL
    const urlObj = new URL(url.loc)
    return urlObj.pathname === '/' ? '/' : urlObj.pathname
  })

  return requiredPages.every(page => includedLocs.includes(page))
}

/**
 * Validate that sitemap excludes noindex pages
 * Requirements: 1.2
 */
export function validateSitemapExclusion(
  config: SitemapConfig,
  excludedPages: string[]
): boolean {
  const includedLocs = config.urls.map(url => {
    const urlObj = new URL(url.loc)
    return urlObj.pathname === '/' ? '/' : urlObj.pathname
  })

  return excludedPages.every(page => !includedLocs.includes(page))
}

/**
 * Validate that all URLs have valid lastmod dates
 * Requirements: 1.2
 */
export function validateLastmodDates(config: SitemapConfig): boolean {
  return config.urls.every(url => {
    if (!url.lastmod) return true // lastmod is optional

    // Check if it's a valid ISO date string
    const date = new Date(url.lastmod)
    return !isNaN(date.getTime())
  })
}

/**
 * Validate that all URLs have i18n alternatives
 * Requirements: 6.4
 */
export function validateI18nAlternatives(config: SitemapConfig): boolean {
  return config.urls.every(url => {
    if (!url.alternatives || url.alternatives.length === 0) {
      return false
    }

    // Should have all supported locales plus x-default
    const expectedCount = SUPPORTED_LOCALES.length + 1 // +1 for x-default
    if (url.alternatives.length !== expectedCount) {
      return false
    }

    // Check that all locales are present
    const hreflangs = url.alternatives.map(alt => alt.hreflang)
    const hasAllLocales = SUPPORTED_LOCALES.every(locale => hreflangs.includes(locale))
    const hasXDefault = hreflangs.includes('x-default')

    return hasAllLocales && hasXDefault
  })
}

/**
 * Validate priority values are within valid range
 */
export function validatePriorityValues(config: SitemapConfig): boolean {
  return config.urls.every(url => {
    if (url.priority === undefined) return true
    return url.priority >= 0.0 && url.priority <= 1.0
  })
}

/**
 * Validate changefreq values are valid
 */
export function validateChangefreqValues(config: SitemapConfig): boolean {
  const validValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
  return config.urls.every(url => {
    if (!url.changefreq) return true
    return validValues.includes(url.changefreq)
  })
}
