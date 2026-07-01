import { fetchPublishedPosts } from '../../lib/supabase'

export const prerender = false

export async function GET() {
  const siteUrl = 'https://ekalliptus.com'

  // Fetch published posts from Supabase and map to sitemap entries
  const posts = await fetchPublishedPosts()

  const blogPages = [
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...posts
      .filter(post => post.locale === 'id')
      .map(post => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.update_date ? new Date(post.update_date).toISOString() : new Date(post.publish_date).toISOString(),
        changeFrequency: 'weekly',
        priority: post.featured ? 0.8 : 0.7,
      })),
  ]

  const sitemap = generateSitemap(blogPages)

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}

function generateSitemap(pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`
}
