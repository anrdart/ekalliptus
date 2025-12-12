# Implementation Plan

- [x] 1. Setup SEO Infrastructure and Configuration





  - [x] 1.1 Install and configure Nuxt SEO modules (@nuxtjs/seo, @nuxtjs/sitemap, @nuxtjs/robots)


    - Add modules to package.json and nuxt.config.ts
    - Configure site URL, name, and default locale
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Create SEO configuration file with site-wide settings

    - Create `config/seo.config.ts` with organization data, page meta, and social profiles
    - Define TypeScript interfaces for SEO types
    - _Requirements: 2.1, 2.2, 7.1, 7.2_

  - [x] 1.3 Write property test for title length bounds

    - **Property 3: Title Length Bounds**
    - **Validates: Requirements 2.1**

  - [x] 1.4 Write property test for description length bounds
    - **Property 4: Description Length Bounds**
    - **Validates: Requirements 2.2**

- [x] 2. Implement Global Meta Tags and Head Configuration





  - [x] 2.1 Update nuxt.config.ts with comprehensive head configuration


    - Add geo meta tags (geo.region, geo.placename, geo.position)
    - Configure font preconnect and preload hints
    - Add content-language meta tag
    - _Requirements: 5.1, 5.4, 7.3, 7.4_
  - [x] 2.2 Create app.vue SEO enhancements with useHead and useSeoMeta


    - Set default OG tags and Twitter Card tags
    - Configure canonical URL generation
    - _Requirements: 2.3, 2.4, 1.5_
  - [x] 2.3 Write property test for Open Graph tag completeness


    - **Property 5: Open Graph Tag Completeness**
    - **Validates: Requirements 2.3**
  - [x] 2.4 Write property test for Twitter Card tag completeness

    - **Property 6: Twitter Card Tag Completeness**
    - **Validates: Requirements 2.4**
  - [x] 2.5 Write property test for canonical self-reference

    - **Property 2: Canonical Self-Reference**
    - **Validates: Requirements 1.5**

- [x] 3. Implement Structured Data Composable



  - [x] 3.1 Create composables/useStructuredData.ts with schema generators


    - Implement generateOrganizationSchema function
    - Implement generateLocalBusinessSchema function
    - Implement generateWebSiteSchema function
    - _Requirements: 3.1, 3.2, 7.1_

  - [x] 3.2 Add FAQ and Service schema generators
    - Implement generateFAQPageSchema function
    - Implement generateServiceSchema function
    - Implement generateBreadcrumbSchema function
    - _Requirements: 3.3, 3.4, 3.5_
  - [x] 3.3 Write property test for JSON-LD syntax validity


    - **Property 11: JSON-LD Syntax Validity**
    - **Validates: Requirements 3.6, 8.1**
  - [x] 3.4 Write property test for FAQ schema completeness

    - **Property 7: FAQ Schema Completeness**
    - **Validates: Requirements 3.4**

  - [x] 3.5 Write property test for Service schema completeness
    - **Property 8: Service Schema Completeness**
    - **Validates: Requirements 3.3**

  - [x] 3.6 Write property test for Breadcrumb schema hierarchy

    - **Property 9: Breadcrumb Schema Hierarchy**
    - **Validates: Requirements 3.5**


- [x] 4. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Homepage SEO Optimization





  - [x] 5.1 Update pages/index.vue with comprehensive SEO meta


    - Add optimized title and description with target keywords
    - Add all OG and Twitter Card tags
    - Ensure single H1 tag with primary keyword
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.5_

  - [x] 5.2 Add structured data to homepage

    - Inject Organization schema
    - Inject LocalBusiness schema
    - Inject WebSite schema with SearchAction
    - Inject BreadcrumbList schema
    - _Requirements: 3.1, 3.2, 3.5, 7.1_

  - [x] 5.3 Add FAQ structured data to FAQ component

    - Inject FAQPage schema with all FAQ items
    - _Requirements: 3.4_

  - [x] 5.4 Add Service structured data to Services component

    - Inject Service schema for each service card
    - _Requirements: 3.3_

  - [x] 5.5 Write property test for single H1 per page

    - **Property 10: Single H1 Per Page**
    - **Validates: Requirements 4.5**

- [x] 6. Implement Other Pages SEO Optimization





  - [x] 6.1 Update pages/order.vue with SEO meta


    - Add optimized title and description targeting order keywords
    - Add OG and Twitter Card tags
    - Add BreadcrumbList schema
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.5, 4.2_

  - [x] 6.2 Update pages/privacy-policy.vue with noindex meta

    - Add robots noindex,nofollow meta tag
    - Add basic meta tags for completeness
    - _Requirements: 4.3_

  - [x] 6.3 Update pages/terms-of-service.vue with noindex meta

    - Add robots noindex,nofollow meta tag
    - Add basic meta tags for completeness
    - _Requirements: 4.4_

  - [x] 6.4 Write property test for no duplicate meta tags

    - **Property 12: No Duplicate Meta Tags**
    - **Validates: Requirements 8.2**

- [x] 7. Implement International SEO (i18n)





  - [x] 7.1 Configure i18n module for SEO with hreflang


    - Update nuxt.config.ts i18n settings for SEO
    - Configure baseUrl for hreflang generation
    - Add x-default hreflang for Indonesian
    - _Requirements: 1.4, 6.1, 6.2_

  - [x] 7.2 Create localized meta content for all languages

    - Update translation files with SEO meta for each locale
    - Ensure title and description are properly translated
    - _Requirements: 6.3_


  - [x] 7.3 Write property test for hreflang completeness
    - **Property 1: Hreflang Completeness**
    - **Validates: Requirements 1.4, 6.1**
  - [x] 7.4 Write property test for localized meta content


    - **Property 15: Localized Meta Content**
    - **Validates: Requirements 6.3**

- [x] 8. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Dynamic Sitemap Generation



  - [x] 9.1 Configure @nuxtjs/sitemap module


    - Set sitemap URL and default changefreq/priority
    - Configure sitemap sources for all pages
    - Add i18n alternate links to sitemap entries
    - _Requirements: 1.2, 6.4_

  - [x] 9.2 Update public/sitemap.xml to be dynamically generated

    - Remove static sitemap.xml (will be auto-generated)
    - Configure lastmod dates based on content updates
    - _Requirements: 1.2_

  - [x] 9.3 Write property test for sitemap XML validity

    - **Property 13: Sitemap XML Validity**
    - **Validates: Requirements 8.3**

  - [x] 9.4 Write property test for sitemap page inclusion

    - **Property 14: Sitemap Page Inclusion**
    - **Validates: Requirements 1.2**

- [x] 10. Implement Robots.txt Configuration






  - [x] 10.1 Configure @nuxtjs/robots module

    - Set up allow/disallow rules
    - Add sitemap reference
    - Configure crawl-delay for different bots
    - _Requirements: 1.3, 8.4_

- [x] 11. Create OG Image for Social Sharing






  - [x] 11.1 Create branded OG image (1200x630px)

    - Design OG image with ekalliptus branding
    - Save as public/og-image.webp
    - _Requirements: 2.5_

- [x] 12. Performance Optimization for SEO





  - [x] 12.1 Optimize font loading


    - Add font-display: swap to Google Fonts
    - Add preconnect hints for font domains
    - _Requirements: 5.1_

  - [x] 12.2 Optimize image attributes

    - Add width, height, alt attributes to all images
    - Ensure images use WebP format where possible
    - _Requirements: 5.2_

  - [x] 12.3 Optimize script loading

    - Add defer attribute to non-critical scripts
    - Move Vanta.js scripts to defer loading
    - _Requirements: 5.3_

- [x] 13. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
