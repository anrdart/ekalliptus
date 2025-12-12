# Design Document: SEO Optimization

## Overview

Dokumen ini menjelaskan arsitektur dan implementasi untuk optimasi SEO komprehensif pada website ekalliptus.id menggunakan Nuxt 3. Implementasi akan memanfaatkan fitur bawaan Nuxt untuk SSR, module @nuxtjs/seo untuk manajemen SEO otomatis, dan custom composables untuk structured data. Fokus utama adalah meningkatkan indexability, rich snippets, dan Core Web Vitals tanpa mengubah UI/UX design.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nuxt 3 Application                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   SEO Module    │  │  Sitemap Module │  │  Robots Module  │  │
│  │  (@nuxtjs/seo)  │  │(@nuxtjs/sitemap)│  │(@nuxtjs/robots) │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│  ┌────────▼────────────────────▼────────────────────▼────────┐  │
│  │                    nuxt.config.ts                          │  │
│  │  - App head configuration                                  │  │
│  │  - Module configuration                                    │  │
│  │  - i18n SEO settings                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Composables Layer                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                   │ │
│  │  │  useSeoMeta()   │  │useSchemaOrg()   │                   │ │
│  │  │  (Nuxt built-in)│  │(structured data)│                   │ │
│  │  └─────────────────┘  └─────────────────┘                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      Pages Layer                             │ │
│  │  index.vue │ order.vue │ privacy-policy.vue │ terms.vue     │ │
│  │  (Page-specific SEO meta and structured data)               │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Generated Output                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ sitemap.xml  │  │  robots.txt  │  │  HTML + Meta │          │
│  │  (dynamic)   │  │  (generated) │  │  (SSR)       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Nuxt Config SEO Enhancement

```typescript
// nuxt.config.ts - SEO configuration interface
interface SeoConfig {
  site: {
    url: string
    name: string
    description: string
    defaultLocale: string
  }
  ogImage: {
    defaults: {
      width: number
      height: number
    }
  }
}
```

### 2. Structured Data Composable

```typescript
// composables/useStructuredData.ts
interface OrganizationSchema {
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  contactPoint: ContactPoint
  sameAs: string[]
}

interface LocalBusinessSchema {
  '@type': 'LocalBusiness'
  name: string
  address: PostalAddress
  geo: GeoCoordinates
  telephone: string
  email: string
  areaServed: string
}

interface FAQPageSchema {
  '@type': 'FAQPage'
  mainEntity: FAQItem[]
}

interface ServiceSchema {
  '@type': 'Service'
  name: string
  description: string
  provider: OrganizationReference
  areaServed: string
}

interface BreadcrumbSchema {
  '@type': 'BreadcrumbList'
  itemListElement: BreadcrumbItem[]
}
```

### 3. SEO Meta Interface

```typescript
// types/seo.ts
interface PageSeoMeta {
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
```

## Data Models

### SEO Configuration Data

```typescript
// config/seo.config.ts
export const seoConfig = {
  siteName: 'ekalliptus',
  siteUrl: 'https://ekalliptus.id',
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
      title: 'ekalliptus - Digital Agency Indonesia | Web Development & Mobile App',
      description: 'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing. Transformasi bisnis Anda dengan teknologi terdepan.',
      keywords: 'digital agency indonesia, web development, wordpress, mobile app, website development indonesia, jasa pembuatan website'
    },
    order: {
      title: 'Order Layanan Digital - ekalliptus',
      description: 'Pesan layanan digital ekalliptus - Web Development, Mobile App, WordPress, editing foto video. Dapatkan penawaran terbaik untuk proyek Anda.',
      keywords: 'order layanan digital, pesan website, jasa website murah, order web development'
    }
  }
}
```

### Service Schema Data

```typescript
// config/services.schema.ts
export const servicesSchema = [
  {
    name: 'Website Development',
    description: 'Jasa pembuatan website profesional, responsif, dan SEO-friendly untuk bisnis Indonesia',
    serviceType: 'WebDevelopment'
  },
  {
    name: 'WordPress Development', 
    description: 'Kustomisasi WordPress dengan tema dan plugin sesuai kebutuhan bisnis',
    serviceType: 'WebDevelopment'
  },
  {
    name: 'Mobile App Development',
    description: 'Pengembangan aplikasi mobile Android dan iOS dengan React Native dan Flutter',
    serviceType: 'MobileAppDevelopment'
  },
  {
    name: 'Photo & Video Editing',
    description: 'Editing foto dan video profesional untuk konten marketing dan social media',
    serviceType: 'MediaEditing'
  },
  {
    name: 'Service HP & Laptop',
    description: 'Perbaikan dan maintenance perangkat HP dan laptop dengan teknisi berpengalaman',
    serviceType: 'DeviceRepair'
  }
]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified after removing redundancies:

### Property 1: Hreflang Completeness
*For any* rendered page, the HTML output SHALL contain hreflang link tags for all 7 supported languages (id, en, ja, ko, ru, ar, tr) plus x-default
**Validates: Requirements 1.4, 6.1**

### Property 2: Canonical Self-Reference
*For any* page URL, the canonical link tag SHALL reference the same URL as the current page
**Validates: Requirements 1.5**

### Property 3: Title Length Bounds
*For any* page SEO configuration, the generated title tag SHALL have length between 50-60 characters
**Validates: Requirements 2.1**

### Property 4: Description Length Bounds
*For any* page SEO configuration, the generated meta description SHALL have length between 150-160 characters
**Validates: Requirements 2.2**

### Property 5: Open Graph Tag Completeness
*For any* rendered page, the HTML output SHALL contain all required Open Graph tags (og:title, og:description, og:image, og:url, og:type, og:locale)
**Validates: Requirements 2.3**

### Property 6: Twitter Card Tag Completeness
*For any* rendered page, the HTML output SHALL contain all required Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
**Validates: Requirements 2.4**

### Property 7: FAQ Schema Completeness
*For any* set of FAQ items, the generated FAQPage schema SHALL contain all questions and answers from the source data
**Validates: Requirements 3.4**

### Property 8: Service Schema Completeness
*For any* set of services, the generated structured data SHALL contain a Service schema for each service
**Validates: Requirements 3.3**

### Property 9: Breadcrumb Schema Hierarchy
*For any* page path, the BreadcrumbList schema SHALL correctly reflect the navigation hierarchy from home to current page
**Validates: Requirements 3.5**

### Property 10: Single H1 Per Page
*For any* rendered page, there SHALL be exactly one H1 tag in the HTML output
**Validates: Requirements 4.5**

### Property 11: JSON-LD Syntax Validity
*For any* structured data object, the JSON-LD output SHALL be valid JSON that can be parsed without errors
**Validates: Requirements 3.6, 8.1**

### Property 12: No Duplicate Meta Tags
*For any* rendered page, there SHALL be no duplicate meta tags with the same name or property attribute
**Validates: Requirements 8.2**

### Property 13: Sitemap XML Validity
*For any* generated sitemap content, the XML SHALL be valid and parseable
**Validates: Requirements 8.3**

### Property 14: Sitemap Page Inclusion
*For any* set of public pages, the generated sitemap SHALL contain URLs for all pages with valid lastmod dates
**Validates: Requirements 1.2**

### Property 15: Localized Meta Content
*For any* language locale, the meta title and description SHALL be in the corresponding language
**Validates: Requirements 6.3**

## Error Handling

### Meta Tag Generation Errors
- If title exceeds 60 characters, truncate with ellipsis at word boundary
- If description exceeds 160 characters, truncate with ellipsis at word boundary
- If OG image is missing, use default branded image

### Structured Data Errors
- If required schema property is missing, log warning and omit schema
- If JSON-LD fails validation, exclude from output and log error
- Provide fallback values for optional properties

### Sitemap Generation Errors
- If page route is invalid, skip and log warning
- If lastmod date is invalid, use current date
- Validate XML before writing to file

### i18n SEO Errors
- If translation is missing, fall back to Indonesian (default locale)
- If hreflang URL is invalid, omit that language variant
- Log missing translations for monitoring

## Testing Strategy

### Unit Testing (Vitest)
- Test SEO config validation functions
- Test meta tag generation utilities
- Test structured data schema builders
- Test sitemap URL generation

### Property-Based Testing (fast-check)
- Test title/description length constraints across random inputs
- Test hreflang tag generation for all locale combinations
- Test JSON-LD validity for random schema data
- Test sitemap XML validity for random page sets
- Test meta tag uniqueness across random page configurations

### Integration Testing
- Test full page render includes all SEO elements
- Test sitemap generation includes all routes
- Test robots.txt serves correct content
- Test structured data appears in rendered HTML

### Manual Validation
- Google Rich Results Test for structured data
- Google Search Console for indexing status
- PageSpeed Insights for Core Web Vitals
- Social media debuggers for OG/Twitter cards
