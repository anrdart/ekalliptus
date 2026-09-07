import { parseFragment, serialize } from 'parse5'

const tags = new Set('p br hr h2 h3 h4 h5 h6 strong b em i u s del blockquote pre code ul ol li a img figure figcaption table thead tbody tfoot tr th td caption div span details summary sup sub'.split(' '))
const attrs = new Set('id title alt width height colspan rowspan scope start'.split(' '))

export function sanitizeArticleHtml(html: string): string {
  const fragment = parseFragment(html)
  function clean(parent: { childNodes: any[] }) {
    parent.childNodes = parent.childNodes.filter(node => node.nodeName === '#text' || tags.has(node.tagName))
    for (const node of parent.childNodes) {
      if (!node.tagName) continue
      node.attrs = node.attrs.filter((attr: { name: string; value: string }) => {
        if (attrs.has(attr.name)) return true
        if ((node.tagName === 'a' && attr.name === 'href') || (node.tagName === 'img' && attr.name === 'src')) {
          try {
            const url = new URL(attr.value, 'https://ekalliptus.com')
            return ['https:', 'http:'].includes(url.protocol) || (node.tagName === 'a' && ['mailto:', 'tel:'].includes(url.protocol))
          } catch { return false }
        }
        return false
      })
      if (node.tagName === 'img') node.attrs.push({ name: 'loading', value: 'lazy' }, { name: 'decoding', value: 'async' })
      clean(node)
    }
  }
  clean(fragment)
  return serialize(fragment)
}

export const serializeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')
