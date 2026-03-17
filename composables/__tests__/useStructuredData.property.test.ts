/**
 * Property-Based Tests for Structured Data Composable
 * Tests correctness properties using fast-check
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
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
  type FAQInput,
  type ServiceInput,
  type BreadcrumbInput
} from '../useStructuredData'

/**
 * Arbitrary generator for FAQ items
 */
const faqInputArb: fc.Arbitrary<FAQInput> = fc.record({
  question: fc.string({ minLength: 5, maxLength: 200 }),
  answer: fc.string({ minLength: 10, maxLength: 500 })
})

/**
 * Arbitrary generator for Service items
 */
const serviceInputArb: fc.Arbitrary<ServiceInput> = fc.record({
  name: fc.string({ minLength: 3, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 300 }),
  serviceType: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined })
})

/**
 * Arbitrary generator for Breadcrumb items
 */
const breadcrumbInputArb: fc.Arbitrary<BreadcrumbInput> = fc.record({
  name: fc.string({ minLength: 2, maxLength: 50 }),
  url: fc.option(
    fc.stringMatching(/^\/[a-z0-9-]*$/),
    { nil: undefined }
  )
})


/**
 * **Feature: seo-optimization, Property 11: JSON-LD Syntax Validity**
 * *For any* structured data object, the JSON-LD output SHALL be valid JSON that can be parsed without errors
 * **Validates: Requirements 3.6, 8.1**
 */
describe('Property 11: JSON-LD Syntax Validity', () => {
  it('generateOrganizationSchema should produce valid JSON-LD', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          legalName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          url: fc.option(fc.webUrl(), { nil: undefined }),
          logo: fc.option(fc.webUrl(), { nil: undefined }),
          email: fc.option(fc.emailAddress(), { nil: undefined }),
          telephone: fc.option(fc.string({ minLength: 5, maxLength: 20 }), { nil: undefined }),
          sameAs: fc.option(fc.array(fc.webUrl(), { minLength: 0, maxLength: 5 }), { nil: undefined })
        }),
        (overrides) => {
          const schema = generateOrganizationSchema(overrides)
          return validateJsonLdSyntax(schema)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateLocalBusinessSchema should produce valid JSON-LD', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          url: fc.option(fc.webUrl(), { nil: undefined }),
          telephone: fc.option(fc.string({ minLength: 5, maxLength: 20 }), { nil: undefined }),
          email: fc.option(fc.emailAddress(), { nil: undefined }),
          areaServed: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
          priceRange: fc.option(fc.constantFrom('$', '$$', '$$$', '$$$$'), { nil: undefined })
        }),
        (overrides) => {
          const schema = generateLocalBusinessSchema(overrides)
          return validateJsonLdSyntax(schema)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateWebSiteSchema should produce valid JSON-LD', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          url: fc.option(fc.webUrl(), { nil: undefined }),
          searchTarget: fc.option(fc.webUrl(), { nil: undefined })
        }),
        (overrides) => {
          const schema = generateWebSiteSchema(overrides)
          return validateJsonLdSyntax(schema)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateFAQPageSchema should produce valid JSON-LD', () => {
    fc.assert(
      fc.property(
        fc.array(faqInputArb, { minLength: 0, maxLength: 20 }),
        (faqItems) => {
          const schema = generateFAQPageSchema(faqItems)
          return validateJsonLdSyntax(schema)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateServiceSchema should produce valid JSON-LD', () => {
    fc.assert(
      fc.property(
        serviceInputArb,
        (service) => {
          const schema = generateServiceSchema(service)
          return validateJsonLdSyntax(schema)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateBreadcrumbSchema should produce valid JSON-LD', () => {
    fc.assert(
      fc.property(
        fc.array(breadcrumbInputArb, { minLength: 1, maxLength: 5 }),
        (items) => {
          const schema = generateBreadcrumbSchema(items)
          return validateJsonLdSyntax(schema)
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * **Feature: seo-optimization, Property 7: FAQ Schema Completeness**
 * *For any* set of FAQ items, the generated FAQPage schema SHALL contain all questions and answers from the source data
 * **Validates: Requirements 3.4**
 */
describe('Property 7: FAQ Schema Completeness', () => {
  it('generateFAQPageSchema should include all FAQ items from source', () => {
    fc.assert(
      fc.property(
        fc.array(faqInputArb, { minLength: 1, maxLength: 20 }),
        (faqItems) => {
          const schema = generateFAQPageSchema(faqItems)
          
          // Schema should have same number of items as source
          if (schema.mainEntity.length !== faqItems.length) {
            return false
          }
          
          // Each item should match source
          return validateFAQSchemaCompleteness(schema, faqItems)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateFAQPageSchema should preserve question text exactly', () => {
    fc.assert(
      fc.property(
        fc.array(faqInputArb, { minLength: 1, maxLength: 10 }),
        (faqItems) => {
          const schema = generateFAQPageSchema(faqItems)
          
          return faqItems.every((item, index) => 
            schema.mainEntity[index].name === item.question
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateFAQPageSchema should preserve answer text exactly', () => {
    fc.assert(
      fc.property(
        fc.array(faqInputArb, { minLength: 1, maxLength: 10 }),
        (faqItems) => {
          const schema = generateFAQPageSchema(faqItems)
          
          return faqItems.every((item, index) => 
            schema.mainEntity[index].acceptedAnswer.text === item.answer
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateFAQPageSchema should handle empty FAQ list', () => {
    const schema = generateFAQPageSchema([])
    expect(schema.mainEntity).toHaveLength(0)
    expect(schema['@type']).toBe('FAQPage')
    expect(validateJsonLdSyntax(schema)).toBe(true)
  })
})

/**
 * **Feature: seo-optimization, Property 8: Service Schema Completeness**
 * *For any* set of services, the generated structured data SHALL contain a Service schema for each service
 * **Validates: Requirements 3.3**
 */
describe('Property 8: Service Schema Completeness', () => {
  it('generateServicesSchemas should produce schema for each service', () => {
    fc.assert(
      fc.property(
        fc.array(serviceInputArb, { minLength: 1, maxLength: 10 }),
        (services) => {
          const schemas = generateServicesSchemas(services)
          
          // Should have same number of schemas as services
          return schemas.length === services.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateServicesSchemas should preserve service names exactly', () => {
    fc.assert(
      fc.property(
        fc.array(serviceInputArb, { minLength: 1, maxLength: 10 }),
        (services) => {
          const schemas = generateServicesSchemas(services)
          
          return services.every((service, index) => 
            schemas[index].name === service.name
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateServicesSchemas should preserve service descriptions exactly', () => {
    fc.assert(
      fc.property(
        fc.array(serviceInputArb, { minLength: 1, maxLength: 10 }),
        (services) => {
          const schemas = generateServicesSchemas(services)
          
          return services.every((service, index) => 
            schemas[index].description === service.description
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateServiceSchemaCompleteness should correctly validate schemas', () => {
    fc.assert(
      fc.property(
        fc.array(serviceInputArb, { minLength: 1, maxLength: 10 }),
        (services) => {
          const schemas = generateServicesSchemas(services)
          return validateServiceSchemaCompleteness(schemas, services)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateServiceSchema should include provider information', () => {
    fc.assert(
      fc.property(
        serviceInputArb,
        (service) => {
          const schema = generateServiceSchema(service)
          
          return (
            schema.provider !== undefined &&
            schema.provider['@type'] === 'Organization' &&
            typeof schema.provider.name === 'string' &&
            schema.provider.name.length > 0
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * **Feature: seo-optimization, Property 9: Breadcrumb Schema Hierarchy**
 * *For any* page path, the BreadcrumbList schema SHALL correctly reflect the navigation hierarchy from home to current page
 * **Validates: Requirements 3.5**
 */
describe('Property 9: Breadcrumb Schema Hierarchy', () => {
  it('generateBreadcrumbSchema should produce sequential positions starting from 1', () => {
    fc.assert(
      fc.property(
        fc.array(breadcrumbInputArb, { minLength: 1, maxLength: 5 }),
        (items) => {
          const schema = generateBreadcrumbSchema(items)
          
          // Positions should be sequential starting from 1
          return schema.itemListElement.every(
            (item, index) => item.position === index + 1
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateBreadcrumbSchema should preserve item names in order', () => {
    fc.assert(
      fc.property(
        fc.array(breadcrumbInputArb, { minLength: 1, maxLength: 5 }),
        (items) => {
          const schema = generateBreadcrumbSchema(items)
          
          return items.every(
            (item, index) => schema.itemListElement[index].name === item.name
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateBreadcrumbSchema should have same number of items as source', () => {
    fc.assert(
      fc.property(
        fc.array(breadcrumbInputArb, { minLength: 1, maxLength: 5 }),
        (items) => {
          const schema = generateBreadcrumbSchema(items)
          return schema.itemListElement.length === items.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('validateBreadcrumbHierarchy should correctly validate schemas', () => {
    fc.assert(
      fc.property(
        fc.array(breadcrumbInputArb, { minLength: 1, maxLength: 5 }),
        (items) => {
          const schema = generateBreadcrumbSchema(items)
          return validateBreadcrumbHierarchy(schema, items)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateBreadcrumbSchema should include URLs when provided', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 50 }),
            url: fc.stringMatching(/^\/[a-z0-9-]*$/)
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.webUrl(),
        (items, siteUrl) => {
          const schema = generateBreadcrumbSchema(items, siteUrl)
          
          return items.every((item, index) => {
            const schemaItem = schema.itemListElement[index]
            if (item.url) {
              return schemaItem.item !== undefined && schemaItem.item['@id'].includes(item.url)
            }
            return true
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateBreadcrumbSchema should have correct @type for all items', () => {
    fc.assert(
      fc.property(
        fc.array(breadcrumbInputArb, { minLength: 1, maxLength: 5 }),
        (items) => {
          const schema = generateBreadcrumbSchema(items)
          
          return schema.itemListElement.every(
            item => item['@type'] === 'ListItem'
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generateBreadcrumbSchema should have correct schema type', () => {
    fc.assert(
      fc.property(
        fc.array(breadcrumbInputArb, { minLength: 1, maxLength: 5 }),
        (items) => {
          const schema = generateBreadcrumbSchema(items)
          
          return (
            schema['@context'] === 'https://schema.org' &&
            schema['@type'] === 'BreadcrumbList'
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
