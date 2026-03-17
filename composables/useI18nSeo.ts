/**
 * Composable for i18n SEO functionality
 * Generates hreflang tags and localized meta content
 * Requirements: 1.4, 6.1, 6.2, 6.3
 */

import { seoConfig } from '~/config/seo.config'

/**
 * Supported locales with their ISO codes for hreflang
 */
export const I18N_LOCALES = [
  { code: 'id', iso: 'id-ID', name: 'Bahasa Indonesia' },
  { code: 'en', iso: 'en-US', name: 'English' },
  { code: 'ja', iso: 'ja-JP', name: '日本語' },
  { code: 'ko', iso: 'ko-KR', name: '한국어' },
  { code: 'ru', iso: 'ru-RU', name: 'Русский' },
  { code: 'ar', iso: 'ar-SA', name: 'العربية' },
  { code: 'tr', iso: 'tr-TR', name: 'Türkçe' }
] as const

export type LocaleCode = typeof I18N_LOCALES[number]['code']

/**
 * Interface for hreflang link tag
 */
export interface HreflangLink {
  rel: 'alternate'
  hreflang: string
  href: string
  [key: `data-${string}`]: string
}

/**
 * Generates hreflang link tags for all supported languages
 * Requirements 1.4, 6.1: Include hreflang tags for all 7 supported languages
 * Requirements 6.2: Include x-default hreflang pointing to Indonesian version
 * 
 * @param currentPath - Current page path (e.g., '/', '/order')
 * @param baseUrl - Base URL of the site
 * @returns Array of hreflang link objects
 */
export function generateHreflangTags(
  currentPath: string = '/',
  baseUrl: string = seoConfig.siteUrl
): HreflangLink[] {
  const normalizedPath = currentPath === '/' ? '' : currentPath.replace(/\/$/, '')
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  
  const hreflangLinks: HreflangLink[] = []
  
  // Generate hreflang for each supported locale
  for (const locale of I18N_LOCALES) {
    hreflangLinks.push({
      rel: 'alternate',
      hreflang: locale.iso,
      href: `${normalizedBaseUrl}${normalizedPath}`
    })
  }
  
  // Add x-default pointing to Indonesian (default locale) - Requirements 6.2
  hreflangLinks.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: `${normalizedBaseUrl}${normalizedPath}`
  })
  
  return hreflangLinks
}

/**
 * Validates that hreflang tags include all required languages
 * Requirements 1.4, 6.1: All 7 supported languages must be present
 * 
 * @param hreflangLinks - Array of hreflang link objects
 * @returns true if all required languages are present
 */
export function validateHreflangCompleteness(hreflangLinks: HreflangLink[]): boolean {
  const requiredHreflangs = [
    ...I18N_LOCALES.map(l => l.iso),
    'x-default'
  ]
  
  const presentHreflangs = new Set(hreflangLinks.map(link => link.hreflang))
  
  return requiredHreflangs.every(hreflang => presentHreflangs.has(hreflang))
}

/**
 * Validates that all hreflang links have valid href URLs
 * 
 * @param hreflangLinks - Array of hreflang link objects
 * @returns true if all href values are valid URLs
 */
export function validateHreflangUrls(hreflangLinks: HreflangLink[]): boolean {
  return hreflangLinks.every(link => {
    try {
      new URL(link.href)
      return true
    } catch {
      return false
    }
  })
}

/**
 * Interface for localized SEO meta content
 */
export interface LocalizedSeoMeta {
  title: string
  description: string
  keywords?: string
}

/**
 * Validates that localized meta content is in the expected language
 * This is a heuristic check based on character sets and common patterns
 * Requirements 6.3: Meta title and description SHALL be in the corresponding language
 * 
 * @param meta - Localized SEO meta content
 * @param localeCode - The locale code to validate against
 * @returns true if the content appears to be in the correct language
 */
export function validateLocalizedMetaContent(
  meta: LocalizedSeoMeta,
  localeCode: LocaleCode
): boolean {
  // Basic validation: content must be non-empty
  if (!meta.title || meta.title.trim().length === 0) return false
  if (!meta.description || meta.description.trim().length === 0) return false
  
  // Language-specific character detection
  const content = meta.title + ' ' + meta.description
  
  switch (localeCode) {
    case 'ja':
      // Japanese should contain hiragana, katakana, or kanji
      return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(content)
    case 'ko':
      // Korean should contain Hangul characters
      return /[\uAC00-\uD7AF\u1100-\u11FF]/.test(content)
    case 'ar':
      // Arabic should contain Arabic characters
      return /[\u0600-\u06FF\u0750-\u077F]/.test(content)
    case 'ru':
      // Russian should contain Cyrillic characters
      return /[\u0400-\u04FF]/.test(content)
    case 'tr':
      // Turkish may contain special Turkish characters (ğ, ı, ş, etc.)
      // But also valid with standard Latin, so we just check it's not empty
      return content.length > 0
    case 'id':
    case 'en':
      // Indonesian and English use Latin characters
      return /[a-zA-Z]/.test(content)
    default:
      return true
  }
}

/**
 * Composable for i18n SEO functionality
 */
export function useI18nSeo() {
  const route = useRoute()
  const { locale } = useI18n()
  
  /**
   * Get hreflang tags for the current page
   */
  const getHreflangTags = () => {
    return generateHreflangTags(route.path, seoConfig.siteUrl)
  }
  
  /**
   * Apply hreflang tags to the page head
   */
  const applyHreflangTags = () => {
    const hreflangLinks = getHreflangTags()
    
    useHead({
      link: hreflangLinks
    })
  }
  
  return {
    locale,
    supportedLocales: I18N_LOCALES,
    getHreflangTags,
    applyHreflangTags,
    generateHreflangTags,
    validateHreflangCompleteness,
    validateHreflangUrls,
    validateLocalizedMetaContent
  }
}

export default useI18nSeo
