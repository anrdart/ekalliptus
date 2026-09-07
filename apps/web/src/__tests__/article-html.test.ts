// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { sanitizeArticleHtml, serializeJsonLd } from '../lib/article-html'
import { indexablePages } from '../lib/locale-routing'

describe('published article safety and discovery', () => {
  it('removes active markup, events, encoded unsafe URLs', () => {
    const output = sanitizeArticleHtml('<script>alert(1)</script><svg onload="alert(1)"></svg><p onclick="x()" style="color:red">Safe <a href="jav&#x61;script:alert(1)">link</a><img src="x" onerror="x()"></p>')
    expect(output).not.toMatch(/script|svg|onclick|onerror|style=/)
    expect(output).toContain('<p>Safe ')
    expect(output).toContain('loading="lazy" decoding="async"')
  })
  it('preserves useful headings, citations, tables, images', () => {
    const output = sanitizeArticleHtml('<h2 id="sources">Sumber</h2><a href="https://web.dev/">web.dev</a><table><tr><td colspan="2">Data</td></tr></table><img src="/blog/example.svg" alt="Example" width="640" height="360">')
    expect(output).toContain('id="sources"')
    expect(output).toContain('href="https://web.dev/"')
    expect(output).toContain('colspan="2"')
    expect(output).toContain('alt="Example"')
  })
  it('prevents JSON-LD script termination without changing parsed content', () => {
    const data = { headline: '</script><img src=x onerror=alert(1)>' }
    expect(serializeJsonLd(data)).not.toContain('<')
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data)
  })
  it('includes the canonical blog collection in public sitemap pages', () => {
    expect(indexablePages).toContain('/id/blog')
  })
})
