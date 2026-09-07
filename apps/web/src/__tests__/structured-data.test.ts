import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolveAuthor } from '../data/authors'

const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

describe('structured data invariants', () => {
  it('keeps the root graph factual and unsupported actions absent', () => {
    const jsonLd = source('../components/JsonLd.astro')
    expect(jsonLd).toContain("areaServed: { '@type': 'Country', name: 'Indonesia' }")
    expect(jsonLd).not.toMatch(/SearchAction|HowTo|offers:|Global/)
  })

  it('uses stable organization identity for every stored author value', () => {
    expect(resolveAuthor('Tim Ekalliptus')).toEqual(resolveAuthor(null))
    expect(resolveAuthor('Tim Ekalliptus').id).toBe('https://ekalliptus.com#organization')
  })

  it('uses organization ids and native absolute image resolution for posts', () => {
    const post = source('../pages/blog/[slug].astro')
    expect(post).toContain("author: { '@type': 'Organization', '@id': author.id, name: author.name, url: author.url }")
    expect(post).toContain("publisher: { '@type': 'Organization', '@id': author.id, name: author.name, url: author.url }")
    expect(post).toContain('new URL(ogImage, siteUrl).toString()')
    expect(post).not.toContain("'@type': 'Person'")
  })
})
