import { canonicalUrl, indexablePages } from '../lib/locale-routing'
import { escapeXml } from '../lib/blog'

export const prerender = false

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexablePages.map(path => `\n  <url><loc>${escapeXml(canonicalUrl(path))}</loc></url>`).join('')}\n</urlset>`
  return new Response(body, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } })
}
