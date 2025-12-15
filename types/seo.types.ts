/**
 * SEO Types for ekalliptus.com
 * Defines TypeScript interfaces for SEO configuration
 */

export interface ContactPoint {
  '@type': 'ContactPoint'
  telephone: string
  contactType: string
  email?: string
  areaServed?: string
  availableLanguage?: string[]
}

export interface PostalAddress {
  '@type': 'PostalAddress'
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates'
  latitude: number
  longitude: number
}

export interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  legalName?: string
  url: string
  logo: string
  email?: string
  telephone?: string
  contactPoint?: ContactPoint
  sameAs?: string[]
  address?: PostalAddress
}

export interface LocalBusinessSchema {
  '@context': 'https://schema.org'
  '@type': 'LocalBusiness'
  name: string
  url: string
  logo?: string
  image?: string
  address: PostalAddress
  geo: GeoCoordinates
  telephone: string
  email?: string
  areaServed?: string
  priceRange?: string
  openingHours?: string[]
}


export interface FAQItem {
  '@type': 'Question'
  name: string
  acceptedAnswer: {
    '@type': 'Answer'
    text: string
  }
}

export interface FAQPageSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: FAQItem[]
}

export interface ServiceSchema {
  '@context': 'https://schema.org'
  '@type': 'Service'
  name: string
  description: string
  provider?: {
    '@type': 'Organization'
    name: string
    url?: string
  }
  areaServed?: string
  serviceType?: string
}

export interface BreadcrumbItem {
  '@type': 'ListItem'
  position: number
  name: string
  item?: {
    '@type': 'WebPage'
    '@id': string
  }
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: BreadcrumbItem[]
}

export interface WebSiteSchema {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  potentialAction?: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

export interface PageSeoMeta {
  title: string
  description: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: 'website' | 'article'
  ogLocale?: string
  twitterCard?: 'summary' | 'summary_large_image'
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  robots?: string
  canonical?: string
}

export interface SeoConfig {
  siteName: string
  siteUrl: string
  defaultLocale: string
  supportedLocales: string[]
  organization: OrganizationData
  pages: Record<string, PageSeoMeta>
}

export interface OrganizationData {
  name: string
  legalName: string
  email: string
  telephone: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo: {
    latitude: number
    longitude: number
  }
  socialProfiles: string[]
}


/**
 * Sitemap Types for dynamic sitemap generation
 * Requirements: 1.2, 6.4, 8.3
 */

export interface SitemapAlternative {
  hreflang: string
  href: string
}

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternatives?: SitemapAlternative[]
}

export interface SitemapConfig {
  siteUrl: string
  urls: SitemapUrl[]
  exclude?: string[]
  defaults?: {
    changefreq?: SitemapUrl['changefreq']
    priority?: number
    lastmod?: string
  }
}

/**
 * Supported locales for hreflang generation
 */
export const SUPPORTED_LOCALES = ['id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr'] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

/**
 * Public pages that should be included in sitemap
 */
export const PUBLIC_PAGES = ['/', '/order'] as const
export type PublicPage = typeof PUBLIC_PAGES[number]

/**
 * Pages excluded from sitemap (noindex pages)
 */
export const EXCLUDED_PAGES = ['/privacy-policy', '/terms-of-service', '/order-success'] as const
export type ExcludedPage = typeof EXCLUDED_PAGES[number]
