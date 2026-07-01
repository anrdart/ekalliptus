import { fetchPublishedPosts } from '../../lib/supabase'

export const prerender = false

export async function GET(context) {
  const siteUrl = 'https://ekalliptus.com'

  // Fetch published posts from Supabase and map to RSS items
  const posts = await fetchPublishedPosts()
  const rssPosts = posts
    .filter(post => post.locale === 'id')
    .sort((a, b) => new Date(b.publish_date).valueOf() - new Date(a.publish_date).valueOf())
    .slice(0, 20)

  const body = generateRss(rssPosts, siteUrl)

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}

function generateRss(posts, siteUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Ekalliptus Digital Blog</title>
    <description>Artikel & insight tentang web development, mobile app, WordPress, dan multimedia editing</description>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
      .map(post => `
      <item>
        <title>${post.title}</title>
        <link>${siteUrl}/blog/${post.slug}</link>
        <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
        <description>${post.description}</description>
        <content:encoded><![CDATA[${generatePostContent(post, siteUrl)}]]></content:encoded>
        <category>${post.category}</category>
        ${post.tags.map(tag => `<category>${tag}</category>`).join('')}
        <pubDate>${new Date(post.publish_date).toUTCString()}</pubDate>
        ${post.update_date ? `<lastBuildDate>${new Date(post.update_date).toUTCString()}</lastBuildDate>` : ''}
        <author>${post.author}</author>
      </item>`).join('')}
  </channel>
</rss>`
}

function generatePostContent(post, siteUrl) {
  const bodyHtml = post.body_html || ''
  const imageUrl = post.image ? `${siteUrl}${post.image}` : ''
  const imageTag = imageUrl ? `<img src="${imageUrl}" alt="${post.image_alt || post.title}" />` : ''
  const excerptHtml = post.description ? `<p>${post.description}</p>` : ''
  const content = bodyHtml ? bodyHtml : excerptHtml

  return `
    ${content}
    ${imageTag}
    <p>Baca selengkapnya di: <a href="${siteUrl}/blog/${post.slug}">${post.title}</a></p>
  `.trim()
}
