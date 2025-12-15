/**
 * Structured Data Composable for SEO
 * Generates JSON-LD schema.org structured data for ekalliptus.com
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1
 */

import type {
  OrganizationSchema,
  LocalBusinessSchema,
  WebSiteSchema,
  FAQPageSchema,
  FAQItem,
  ServiceSchema,
  BreadcrumbSchema,
  BreadcrumbItem,
  ContactPoint,
  PostalAddress,
  GeoCoordinates
} from '~/types/seo.types'
import { seoConfig } from '~/config/seo.config'

/**
 * Input type for FAQ items (simplified for consumers)
 */
export interface FAQInput {
  question: string
  answer: string
}

/**
 * Input type for Service items (simplified for consumers)
 */
export interface ServiceInput {
  name: string
  description: string
  serviceType?: string
}

/**
 * Input type for Breadcrumb items (simplified for consumers)
 */
export interface BreadcrumbInput {
  name: string
  url?: string
}

/**
 * Generates Organization schema for JSON-LD
 * Requirements: 3.1 - Organization schema with name, logo, url, contactPoint, and sameAs
 * 
 * @param overrides - Optional overrides for organization data
 * @returns OrganizationSchema object
 */
export function generateOrganizationSchema(overrides?: Partial<{
  name: string
  legalName: string
  url: string
  logo: string
  email: string
  telephone: string
  sameAs: string[]
}>): OrganizationSchema {
  const org = seoConfig.organization
  const siteUrl = seoConfig.siteUrl

  const contactPoint: ContactPoint = {
    '@type': 'ContactPoint',
    telephone: overrides?.telephone || org.telephone,
    contactType: 'customer service',
    email: overrides?.email || org.email,
    areaServed: 'ID',
    availableLanguage: seoConfig.supportedLocales
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: overrides?.name || org.name,
    legalName: overrides?.legalName || org.legalName,
    url: overrides?.url || siteUrl,
    logo: overrides?.logo || `${siteUrl}/ekalliptus_rounded.webp`,
    email: overrides?.email || org.email,
    telephone: overrides?.telephone || org.telephone,
    contactPoint,
    sameAs: overrides?.sameAs || org.socialProfiles,
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry
    }
  }
}

/**
 * Generates LocalBusiness schema for JSON-LD
 * Requirements: 7.1 - LocalBusiness schema with address, geo coordinates, and service area
 * 
 * @param overrides - Optional overrides for local business data
 * @returns LocalBusinessSchema object
 */
export function generateLocalBusinessSchema(overrides?: Partial<{
  name: string
  url: string
  telephone: string
  email: string
  areaServed: string
  priceRange: string
}>): LocalBusinessSchema {
  const org = seoConfig.organization
  const siteUrl = seoConfig.siteUrl

  const address: PostalAddress = {
    '@type': 'PostalAddress',
    streetAddress: org.address.streetAddress,
    addressLocality: org.address.addressLocality,
    addressRegion: org.address.addressRegion,
    postalCode: org.address.postalCode,
    addressCountry: org.address.addressCountry
  }

  const geo: GeoCoordinates = {
    '@type': 'GeoCoordinates',
    latitude: org.geo.latitude,
    longitude: org.geo.longitude
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: overrides?.name || org.name,
    url: overrides?.url || siteUrl,
    logo: `${siteUrl}/ekalliptus_rounded.webp`,
    image: `${siteUrl}/__og-image__/image/og.png`,
    address,
    geo,
    telephone: overrides?.telephone || org.telephone,
    email: overrides?.email || org.email,
    areaServed: overrides?.areaServed || 'Indonesia',
    priceRange: overrides?.priceRange || '$$'
  }
}

/**
 * Generates WebSite schema for JSON-LD with SearchAction
 * Requirements: 3.2 - WebSite schema with SearchAction for sitelinks searchbox
 * 
 * @param overrides - Optional overrides for website data
 * @returns WebSiteSchema object
 */
export function generateWebSiteSchema(overrides?: Partial<{
  name: string
  url: string
  searchTarget: string
}>): WebSiteSchema {
  const siteUrl = overrides?.url || seoConfig.siteUrl
  const siteName = overrides?.name || seoConfig.siteName

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: overrides?.searchTarget || `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}


/**
 * Generates FAQPage schema for JSON-LD
 * Requirements: 3.4 - FAQPage schema with all questions and answers
 * 
 * @param faqItems - Array of FAQ items with question and answer
 * @returns FAQPageSchema object
 */
export function generateFAQPageSchema(faqItems: FAQInput[]): FAQPageSchema {
  const mainEntity: FAQItem[] = faqItems.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity
  }
}

/**
 * Validates that FAQ schema contains all source FAQ items
 * @param schema - The generated FAQPage schema
 * @param sourceItems - The original FAQ items
 * @returns true if all items are present in schema
 */
export function validateFAQSchemaCompleteness(schema: FAQPageSchema, sourceItems: FAQInput[]): boolean {
  if (schema.mainEntity.length !== sourceItems.length) {
    return false
  }

  return sourceItems.every((sourceItem, index) => {
    const schemaItem = schema.mainEntity[index]
    return (
      schemaItem.name === sourceItem.question &&
      schemaItem.acceptedAnswer.text === sourceItem.answer
    )
  })
}

/**
 * Generates Service schema for JSON-LD
 * Requirements: 3.3 - Service schema for each service offered
 * 
 * @param service - Service input data
 * @param providerOverrides - Optional provider overrides
 * @returns ServiceSchema object
 */
export function generateServiceSchema(
  service: ServiceInput,
  providerOverrides?: Partial<{ name: string; url: string }>
): ServiceSchema {
  const org = seoConfig.organization
  const siteUrl = seoConfig.siteUrl

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: providerOverrides?.name || org.name,
      url: providerOverrides?.url || siteUrl
    },
    areaServed: 'Indonesia',
    serviceType: service.serviceType
  }
}

/**
 * Generates multiple Service schemas for an array of services
 * @param services - Array of service inputs
 * @returns Array of ServiceSchema objects
 */
export function generateServicesSchemas(services: ServiceInput[]): ServiceSchema[] {
  return services.map(service => generateServiceSchema(service))
}

/**
 * Validates that all services have corresponding schemas
 * @param schemas - Array of generated Service schemas
 * @param sourceServices - Original service inputs
 * @returns true if all services have schemas
 */
export function validateServiceSchemaCompleteness(
  schemas: ServiceSchema[],
  sourceServices: ServiceInput[]
): boolean {
  if (schemas.length !== sourceServices.length) {
    return false
  }

  return sourceServices.every((sourceService, index) => {
    const schema = schemas[index]
    return (
      schema.name === sourceService.name &&
      schema.description === sourceService.description
    )
  })
}

/**
 * Generates BreadcrumbList schema for JSON-LD
 * Requirements: 3.5 - BreadcrumbList schema showing navigation hierarchy
 * 
 * @param items - Array of breadcrumb items from home to current page
 * @param siteUrl - Base site URL (defaults to seoConfig.siteUrl)
 * @returns BreadcrumbSchema object
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbInput[],
  siteUrl?: string
): BreadcrumbSchema {
  const baseUrl = siteUrl || seoConfig.siteUrl

  const itemListElement: BreadcrumbItem[] = items.map((item, index) => {
    const breadcrumbItem: BreadcrumbItem = {
      '@type': 'ListItem',
      position: index + 1,
      name: item.name
    }

    // Add item URL for all items except the last one (current page)
    if (item.url !== undefined) {
      const itemUrl = item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
      breadcrumbItem.item = {
        '@type': 'WebPage',
        '@id': itemUrl
      }
    }

    return breadcrumbItem
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  }
}


/**
 * Validates that breadcrumb schema correctly reflects navigation hierarchy
 * @param schema - The generated BreadcrumbList schema
 * @param sourceItems - The original breadcrumb items
 * @returns true if hierarchy is correct
 */
export function validateBreadcrumbHierarchy(
  schema: BreadcrumbSchema,
  sourceItems: BreadcrumbInput[]
): boolean {
  if (schema.itemListElement.length !== sourceItems.length) {
    return false
  }

  // Check that positions are sequential starting from 1
  const positionsCorrect = schema.itemListElement.every(
    (item, index) => item.position === index + 1
  )

  if (!positionsCorrect) {
    return false
  }

  // Check that names match source items
  const namesMatch = schema.itemListElement.every(
    (item, index) => item.name === sourceItems[index].name
  )

  return namesMatch
}

/**
 * Validates that a JSON-LD object is valid JSON
 * Requirements: 3.6, 8.1 - JSON-LD syntax validity
 * 
 * @param schema - Any schema object to validate
 * @returns true if the schema can be serialized to valid JSON
 */
export function validateJsonLdSyntax(schema: unknown): boolean {
  try {
    const jsonString = JSON.stringify(schema)
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

/**
 * Converts a schema object to JSON-LD script tag content
 * @param schema - Schema object to convert
 * @returns JSON string for use in script tag
 */
export function schemaToJsonLd(schema: unknown): string {
  return JSON.stringify(schema)
}

/**
 * Nuxt composable for structured data management
 * Provides reactive schema generation for use in components
 */
export function useStructuredData() {
  return {
    generateOrganizationSchema,
    generateLocalBusinessSchema,
    generateWebSiteSchema,
    generateFAQPageSchema,
    generateServiceSchema,
    generateServicesSchemas,
    generateBreadcrumbSchema,
    validateJsonLdSyntax,
    validateFAQSchemaCompleteness,
    validateServiceSchemaCompleteness,
    validateBreadcrumbHierarchy,
    schemaToJsonLd
  }
}

export default useStructuredData
