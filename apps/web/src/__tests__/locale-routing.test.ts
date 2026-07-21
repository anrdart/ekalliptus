import { describe, expect, it } from 'vitest'
import {
  alternateLinks,
  canonicalUrl,
  localizedPath,
  routePolicy,
  stripLocale,
} from '../lib/locale-routing'

describe('locale URL helpers', () => {
  it('prefixes supported locales without duplicating prefixes', () => {
    expect(localizedPath('/', 'id')).toBe('/id')
    expect(localizedPath('/about?from=nav#team', 'en')).toBe('/en/about?from=nav#team')
    expect(localizedPath('/id/services/website/', 'ja')).toBe('/ja/services/website/')
  })

  it('strips only supported locale path segments', () => {
    expect(stripLocale('/id')).toEqual({ locale: 'id', pathname: '/' })
    expect(stripLocale('/en/about/')).toEqual({ locale: 'en', pathname: '/about/' })
    expect(stripLocale('/images/logo.webp')).toEqual({ locale: null, pathname: '/images/logo.webp' })
  })
})

describe('route policy', () => {
  it('keeps blog, article, and tag routes Indonesian-only', () => {
    expect(routePolicy('/id/blog/example')).toMatchObject({ locale: 'id', renderPathname: '/blog/example', indexable: true })
    expect(routePolicy('/en/blog')).toMatchObject({ status: 404, indexable: false })
    expect(routePolicy('/ja/blog/tag/astro')).toMatchObject({ status: 404, indexable: false })
  })

  it('indexes Indonesian HTML and conservatively noindexes translated UI', () => {
    expect(routePolicy('/id/services/website')).toMatchObject({ status: 200, indexable: true })
    expect(routePolicy('/en/services/website')).toMatchObject({ status: 200, indexable: false })
  })

  it('redirects legacy HTML routes to Indonesian URLs but bypasses machine and asset routes', () => {
    expect(routePolicy('/about')).toMatchObject({ status: 302, location: '/id/about' })
    expect(routePolicy('/api/order')).toMatchObject({ action: 'bypass' })
    expect(routePolicy('/robots.txt')).toMatchObject({ action: 'bypass' })
    expect(routePolicy('/sitemap-index.xml')).toMatchObject({ action: 'bypass' })
    expect(routePolicy('/blog/rss.xml')).toMatchObject({ action: 'bypass' })
    expect(routePolicy('/favicon.ico')).toMatchObject({ action: 'bypass' })
  })
})

describe('SEO URL generation', () => {
  it('uses the public prefixed pathname for a self canonical', () => {
    expect(canonicalUrl('/id/about?ignored=1')).toBe('https://ekalliptus.com/id/about')
  })

  it('emits no alternates until a route is proven complete', () => {
    expect(alternateLinks('/id/about')).toEqual([])
    expect(alternateLinks('/en/about')).toEqual([])
  })
})
