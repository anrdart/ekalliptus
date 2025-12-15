/**
 * SEO Configuration for ekalliptus.com
 * Contains site-wide SEO settings, organization data, and page meta
 */

import type { SeoConfig, PageSeoMeta } from '~/types/seo.types'

// Title length constraints (50-60 characters)
export const TITLE_MIN_LENGTH = 50
export const TITLE_MAX_LENGTH = 60

// Description length constraints (150-160 characters)
export const DESCRIPTION_MIN_LENGTH = 150
export const DESCRIPTION_MAX_LENGTH = 160

/**
 * Validates and truncates title to meet SEO requirements
 * @param title - The title to validate
 * @returns Truncated title if needed
 */
export function validateTitle(title: string): string {
  if (title.length > TITLE_MAX_LENGTH) {
    // Truncate at word boundary with ellipsis
    const truncated = title.substring(0, TITLE_MAX_LENGTH - 3)
    const lastSpace = truncated.lastIndexOf(' ')
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
  }
  return title
}

/**
 * Validates and truncates description to meet SEO requirements
 * @param description - The description to validate
 * @returns Truncated description if needed
 */
export function validateDescription(description: string): string {
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    // Truncate at word boundary with ellipsis
    const truncated = description.substring(0, DESCRIPTION_MAX_LENGTH - 3)
    const lastSpace = truncated.lastIndexOf(' ')
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
  }
  return description
}

/**
 * Checks if title length is within valid bounds
 */
export function isTitleLengthValid(title: string): boolean {
  return title.length >= TITLE_MIN_LENGTH && title.length <= TITLE_MAX_LENGTH
}


/**
 * Checks if description length is within valid bounds
 */
export function isDescriptionLengthValid(description: string): boolean {
  return description.length >= DESCRIPTION_MIN_LENGTH && description.length <= DESCRIPTION_MAX_LENGTH
}

/**
 * Required Open Graph tags for SEO compliance
 * Requirements 2.3: og:title, og:description, og:image, og:url, og:type, og:locale
 */
export const REQUIRED_OG_TAGS = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:locale'] as const

/**
 * Required Twitter Card tags for SEO compliance
 * Requirements 2.4: twitter:card, twitter:title, twitter:description, twitter:image
 */
export const REQUIRED_TWITTER_TAGS = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'] as const

/**
 * Generates Open Graph meta tags from page SEO configuration
 * @param pageMeta - Page SEO meta configuration
 * @param siteUrl - Base site URL
 * @param pageUrl - Current page URL
 * @param locale - Current locale
 * @returns Object with all OG tag values
 */
export function generateOgTags(
  pageMeta: PageSeoMeta,
  siteUrl: string,
  pageUrl: string,
  locale: string = 'id'
): Record<string, string> {
  const ogLocale = locale === 'id' ? 'id_ID' : locale
  return {
    'og:title': pageMeta.ogTitle || pageMeta.title,
    'og:description': pageMeta.ogDescription || pageMeta.description,
    'og:image': pageMeta.ogImage || `${siteUrl}/__og-image__/image/og.png`,
    'og:url': pageMeta.ogUrl || pageUrl,
    'og:type': pageMeta.ogType || 'website',
    'og:locale': pageMeta.ogLocale || ogLocale
  }
}

/**
 * Validates that all required Open Graph tags are present and non-empty
 * @param ogTags - Object containing OG tag values
 * @returns true if all required tags are present and non-empty
 */
export function validateOgTagCompleteness(ogTags: Record<string, string>): boolean {
  return REQUIRED_OG_TAGS.every(tag => {
    const key = tag.replace('og:', 'og:')
    return ogTags[key] && ogTags[key].trim().length > 0
  })
}

/**
 * Generates Twitter Card meta tags from page SEO configuration
 * @param pageMeta - Page SEO meta configuration
 * @param siteUrl - Base site URL
 * @returns Object with all Twitter Card tag values
 */
export function generateTwitterTags(
  pageMeta: PageSeoMeta,
  siteUrl: string
): Record<string, string> {
  return {
    'twitter:card': pageMeta.twitterCard || 'summary_large_image',
    'twitter:title': pageMeta.twitterTitle || pageMeta.title,
    'twitter:description': pageMeta.twitterDescription || pageMeta.description,
    'twitter:image': pageMeta.twitterImage || `${siteUrl}/__og-image__/image/og.png`
  }
}

/**
 * Validates that all required Twitter Card tags are present and non-empty
 * @param twitterTags - Object containing Twitter Card tag values
 * @returns true if all required tags are present and non-empty
 */
export function validateTwitterTagCompleteness(twitterTags: Record<string, string>): boolean {
  return REQUIRED_TWITTER_TAGS.every(tag => {
    return twitterTags[tag] && twitterTags[tag].trim().length > 0
  })
}

/**
 * Generates canonical URL for a page
 * @param siteUrl - Base site URL
 * @param pagePath - Current page path
 * @returns Canonical URL
 */
export function generateCanonicalUrl(siteUrl: string, pagePath: string): string {
  // Normalize path - remove trailing slash except for root
  const normalizedPath = pagePath === '/' ? '' : pagePath.replace(/\/$/, '')
  // Ensure siteUrl doesn't have trailing slash
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '')
  return `${normalizedSiteUrl}${normalizedPath}`
}

/**
 * Validates that canonical URL is self-referencing (matches current page URL)
 * @param canonicalUrl - The canonical URL
 * @param currentPageUrl - The current page URL
 * @returns true if canonical URL matches current page URL
 */
export function validateCanonicalSelfReference(canonicalUrl: string, currentPageUrl: string): boolean {
  // Normalize both URLs for comparison
  const normalizeUrl = (url: string) => url.replace(/\/$/, '').toLowerCase()
  return normalizeUrl(canonicalUrl) === normalizeUrl(currentPageUrl)
}

export const seoConfig: SeoConfig = {
  siteName: 'ekalliptus',
  siteUrl: 'https://ekalliptus.com',
  defaultLocale: 'id',
  supportedLocales: ['id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr'],

  organization: {
    name: 'ekalliptus',
    legalName: 'ekalliptus Digital Agency',
    email: 'ekalliptus@gmail.com',
    telephone: '+62-819-9990-0306',
    address: {
      streetAddress: 'Indonesia',
      addressLocality: 'Jakarta',
      addressRegion: 'DKI Jakarta',
      postalCode: '10110',
      addressCountry: 'ID'
    },
    geo: {
      latitude: -6.2088,
      longitude: 106.8456
    },
    socialProfiles: [
      'https://instagram.com/ekalliptus',
      'https://wa.me/6281999900306'
    ]
  },

  pages: {
    home: {
      title: 'ekalliptus - Digital Agency Indonesia | Web & Mobile App',
      description: 'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing. Transformasi bisnis Anda dengan teknologi terdepan.',
      keywords: 'digital agency indonesia, web development, wordpress, mobile app, website development indonesia, jasa pembuatan website',
      ogType: 'website',
      twitterCard: 'summary_large_image'
    },
    order: {
      title: 'Order Layanan Digital - ekalliptus | Pesan Sekarang',
      description: 'Pesan layanan digital ekalliptus - Web Development, Mobile App, WordPress, editing foto video. Dapatkan penawaran terbaik untuk proyek digital Anda.',
      keywords: 'order layanan digital, pesan website, jasa website murah, order web development',
      ogType: 'website',
      twitterCard: 'summary_large_image'
    },
    privacyPolicy: {
      title: 'Kebijakan Privasi - ekalliptus Digital Agency',
      description: 'Kebijakan privasi ekalliptus menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.',
      robots: 'noindex,nofollow'
    },
    termsOfService: {
      title: 'Syarat dan Ketentuan - ekalliptus Digital Agency',
      description: 'Syarat dan ketentuan layanan ekalliptus Digital Agency. Baca sebelum menggunakan layanan kami.',
      robots: 'noindex,nofollow'
    }
  }
}

export default seoConfig
