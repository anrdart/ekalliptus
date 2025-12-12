/**
 * Property-Based Tests for i18n SEO functionality
 * Tests correctness properties using fast-check
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  generateHreflangTags,
  validateHreflangCompleteness,
  validateHreflangUrls,
  validateLocalizedMetaContent,
  I18N_LOCALES,
  type LocaleCode,
  type HreflangLink,
  type LocalizedSeoMeta
} from '../useI18nSeo'

/**
 * **Feature: seo-optimization, Property 1: Hreflang Completeness**
 * *For any* rendered page, the HTML output SHALL contain hreflang link tags for all 7 supported languages
 * (id, en, ja, ko, ru, ar, tr) plus x-default
 * **Validates: Requirements 1.4, 6.1**
 */
describe('Property 1: Hreflang Completeness', () => {
  // All required hreflang values including x-default
  const REQUIRED_HREFLANGS = [
    'id-ID', 'en-US', 'ja-JP', 'ko-KR', 'ru-RU', 'ar-SA', 'tr-TR', 'x-default'
  ]

  it('generateHreflangTags should produce hreflang tags for all 7 supported languages plus x-default', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary page paths
        fc.array(fc.constantFrom('', 'order', 'about', 'contact', 'services', 'privacy-policy'), { minLength: 0, maxLength: 2 })
          .map(segments => '/' + segments.filter(s => s).join('/')),
        fc.webUrl(),
        (pagePath, baseUrl) => {
          const hreflangTags = generateHreflangTags(pagePath, baseUrl)
          
          // Should have exactly 8 hreflang tags (7 languages + x-default)
          return hreflangTags.length === 8
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateHreflangTags should include all required hreflang values', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('', 'order', 'about', 'contact'), { minLength: 0, maxLength: 2 })
          .map(segments => '/' + segments.filter(s => s).join('/')),
        fc.webUrl(),
        (pagePath, baseUrl) => {
          const hreflangTags = generateHreflangTags(pagePath, baseUrl)
          const hreflangValues = hreflangTags.map(tag => tag.hreflang)
          
          // All required hreflang values must be present
          return REQUIRED_HREFLANGS.every(hreflang => hreflangValues.includes(hreflang))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateHreflangCompleteness should return true for complete hreflang sets', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (baseUrl) => {
          const hreflangTags = generateHreflangTags('/', baseUrl)
          
          // Generated tags should always pass completeness validation
          return validateHreflangCompleteness(hreflangTags)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateHreflangCompleteness should return false when any language is missing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...REQUIRED_HREFLANGS),
        fc.webUrl(),
        (hreflangToRemove, baseUrl) => {
          const hreflangTags = generateHreflangTags('/', baseUrl)
          
          // Remove one hreflang tag
          const incompleteTags = hreflangTags.filter(tag => tag.hreflang !== hreflangToRemove)
          
          // Should return false when any required hreflang is missing
          return !validateHreflangCompleteness(incompleteTags)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('all hreflang tags should have rel="alternate"', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (baseUrl) => {
          const hreflangTags = generateHreflangTags('/', baseUrl)
          
          // All tags should have rel="alternate"
          return hreflangTags.every(tag => tag.rel === 'alternate')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('all hreflang tags should have valid href URLs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('', 'order', 'about'), { minLength: 0, maxLength: 2 })
          .map(segments => '/' + segments.filter(s => s).join('/')),
        fc.webUrl(),
        (pagePath, baseUrl) => {
          const hreflangTags = generateHreflangTags(pagePath, baseUrl)
          
          // All href values should be valid URLs
          return validateHreflangUrls(hreflangTags)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('x-default hreflang should point to the same URL as Indonesian version', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (baseUrl) => {
          const hreflangTags = generateHreflangTags('/', baseUrl)
          
          const xDefaultTag = hreflangTags.find(tag => tag.hreflang === 'x-default')
          const idTag = hreflangTags.find(tag => tag.hreflang === 'id-ID')
          
          // x-default should have the same href as Indonesian version (Requirements 6.2)
          return xDefaultTag !== undefined && 
                 idTag !== undefined && 
                 xDefaultTag.href === idTag.href
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * **Feature: seo-optimization, Property 15: Localized Meta Content**
 * *For any* language locale, the meta title and description SHALL be in the corresponding language
 * **Validates: Requirements 6.3**
 */
describe('Property 15: Localized Meta Content', () => {
  // Arbitrary generator for localized SEO meta with language-specific content
  const localizedSeoMetaArb = (locale: LocaleCode): fc.Arbitrary<LocalizedSeoMeta> => {
    switch (locale) {
      case 'ja':
        // Japanese content with hiragana/katakana/kanji
        return fc.record({
          title: fc.constantFrom(
            'ekalliptus - インドネシアデジタルエージェンシー',
            'デジタルサービス注文 - ekalliptus',
            'ウェブサイト開発サービス'
          ),
          description: fc.constantFrom(
            'ウェブサイト開発、WordPress、モバイルアプリ、マルチメディア編集を専門とするインドネシアのデジタルエージェンシー。',
            'ekalliptusデジタルサービスを注文 - Web開発、モバイルアプリ、WordPress、写真動画編集。'
          ),
          keywords: fc.option(fc.constant('デジタルエージェンシー、ウェブ開発'), { nil: undefined })
        })
      case 'ko':
        // Korean content with Hangul
        return fc.record({
          title: fc.constantFrom(
            'ekalliptus - 인도네시아 디지털 에이전시',
            '디지털 서비스 주문 - ekalliptus',
            '웹사이트 개발 서비스'
          ),
          description: fc.constantFrom(
            '웹사이트 개발, WordPress, 모바일 앱, 멀티미디어 편집 전문 인도네시아 디지털 에이전시.',
            'ekalliptus 디지털 서비스 주문 - 웹 개발, 모바일 앱, WordPress, 사진 비디오 편집.'
          ),
          keywords: fc.option(fc.constant('디지털 에이전시, 웹 개발'), { nil: undefined })
        })
      case 'ar':
        // Arabic content
        return fc.record({
          title: fc.constantFrom(
            'ekalliptus - وكالة رقمية إندونيسيا',
            'طلب الخدمات الرقمية - ekalliptus',
            'خدمة تطوير المواقع'
          ),
          description: fc.constantFrom(
            'وكالة رقمية إندونيسية متخصصة في تطوير المواقع، WordPress، التطبيقات المحمولة، وتحرير الوسائط المتعددة.',
            'اطلب خدمات ekalliptus الرقمية - تطوير الويب، التطبيقات المحمولة، WordPress، تحرير الصور والفيديو.'
          ),
          keywords: fc.option(fc.constant('وكالة رقمية، تطوير الويب'), { nil: undefined })
        })
      case 'ru':
        // Russian content with Cyrillic
        return fc.record({
          title: fc.constantFrom(
            'ekalliptus - Цифровое агентство Индонезия',
            'Заказ цифровых услуг - ekalliptus',
            'Услуга разработки веб-сайтов'
          ),
          description: fc.constantFrom(
            'Цифровое агентство Индонезии, специализирующееся на разработке веб-сайтов, WordPress, мобильных приложений и мультимедиа.',
            'Закажите цифровые услуги ekalliptus - Веб-разработка, мобильные приложения, WordPress, фото и видео монтаж.'
          ),
          keywords: fc.option(fc.constant('цифровое агентство, веб разработка'), { nil: undefined })
        })
      case 'tr':
        // Turkish content (Latin with special chars)
        return fc.record({
          title: fc.constantFrom(
            'ekalliptus - Endonezya Dijital Ajans',
            'Dijital Hizmet Siparişi - ekalliptus',
            'Web Sitesi Geliştirme Hizmeti'
          ),
          description: fc.constantFrom(
            'Web sitesi geliştirme, WordPress, mobil uygulamalar ve multimedya düzenleme konusunda uzmanlaşmış Endonezya dijital ajansı.',
            'ekalliptus dijital hizmetlerini sipariş edin - Web Geliştirme, Mobil Uygulama, WordPress, fotoğraf video düzenleme.'
          ),
          keywords: fc.option(fc.constant('dijital ajans, web geliştirme'), { nil: undefined })
        })
      case 'id':
        // Indonesian content
        return fc.record({
          title: fc.constantFrom(
            'ekalliptus - Digital Agency Indonesia',
            'Order Layanan Digital - ekalliptus',
            'Layanan Website Development'
          ),
          description: fc.constantFrom(
            'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing.',
            'Pesan layanan digital ekalliptus - Web Development, Mobile App, WordPress, editing foto video.'
          ),
          keywords: fc.option(fc.constant('digital agency indonesia, web development'), { nil: undefined })
        })
      case 'en':
      default:
        // English content
        return fc.record({
          title: fc.constantFrom(
            'ekalliptus - Digital Agency Indonesia',
            'Order Digital Services - ekalliptus',
            'Website Development Service'
          ),
          description: fc.constantFrom(
            'Indonesia digital agency specializing in website development, WordPress, mobile apps, and multimedia editing.',
            'Order ekalliptus digital services - Web Development, Mobile App, WordPress, photo video editing.'
          ),
          keywords: fc.option(fc.constant('digital agency indonesia, web development'), { nil: undefined })
        })
    }
  }

  it('validateLocalizedMetaContent should return true for content in the correct language', () => {
    const locales: LocaleCode[] = ['id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr']
    
    for (const locale of locales) {
      fc.assert(
        fc.property(
          localizedSeoMetaArb(locale),
          (meta) => {
            // Content generated for a specific locale should validate as that locale
            return validateLocalizedMetaContent(meta, locale)
          }
        ),
        { numRuns: 50 }
      )
    }
  })

  it('validateLocalizedMetaContent should return false for empty title', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<LocaleCode>('id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr'),
        (locale) => {
          const meta: LocalizedSeoMeta = {
            title: '',
            description: 'Valid description content'
          }
          
          // Empty title should fail validation
          return !validateLocalizedMetaContent(meta, locale)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('validateLocalizedMetaContent should return false for empty description', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<LocaleCode>('id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr'),
        (locale) => {
          const meta: LocalizedSeoMeta = {
            title: 'Valid title content',
            description: ''
          }
          
          // Empty description should fail validation
          return !validateLocalizedMetaContent(meta, locale)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('validateLocalizedMetaContent should return false for whitespace-only content', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<LocaleCode>('id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr'),
        fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 }).map(arr => arr.join('')),
        (locale, whitespace) => {
          const meta: LocalizedSeoMeta = {
            title: whitespace,
            description: whitespace
          }
          
          // Whitespace-only content should fail validation
          return !validateLocalizedMetaContent(meta, locale)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('Japanese content should contain Japanese characters', () => {
    fc.assert(
      fc.property(
        localizedSeoMetaArb('ja'),
        (meta) => {
          const content = meta.title + ' ' + meta.description
          // Japanese content should contain hiragana, katakana, or kanji
          return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(content)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('Korean content should contain Hangul characters', () => {
    fc.assert(
      fc.property(
        localizedSeoMetaArb('ko'),
        (meta) => {
          const content = meta.title + ' ' + meta.description
          // Korean content should contain Hangul characters
          return /[\uAC00-\uD7AF\u1100-\u11FF]/.test(content)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('Arabic content should contain Arabic characters', () => {
    fc.assert(
      fc.property(
        localizedSeoMetaArb('ar'),
        (meta) => {
          const content = meta.title + ' ' + meta.description
          // Arabic content should contain Arabic characters
          return /[\u0600-\u06FF\u0750-\u077F]/.test(content)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('Russian content should contain Cyrillic characters', () => {
    fc.assert(
      fc.property(
        localizedSeoMetaArb('ru'),
        (meta) => {
          const content = meta.title + ' ' + meta.description
          // Russian content should contain Cyrillic characters
          return /[\u0400-\u04FF]/.test(content)
        }
      ),
      { numRuns: 50 }
    )
  })
})
