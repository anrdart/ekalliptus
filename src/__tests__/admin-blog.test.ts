import { describe, it, expect } from 'vitest'
import { slugify } from '../lib/admin/blog'

describe('blog slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Cara Membuat Website')).toBe('cara-membuat-website')
  })
  it('strips diacritics', () => {
    expect(slugify('Tegàl ínformatika')).toBe('tegal-informatika')
  })
  it('removes punctuation', () => {
    expect(slugify('Tips & Trick: SEO!')).toBe('tips-trick-seo')
  })
  it('collapses multiple dashes', () => {
    expect(slugify('a---b')).toBe('a-b')
  })
})
