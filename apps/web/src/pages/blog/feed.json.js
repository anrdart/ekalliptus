import { fetchPublishedPosts } from '../../lib/supabase'

export const prerender = false

export async function GET(context) {
  const siteUrl = 'https://ekalliptus.com'

  // Fetch published posts from Supabase and map to JSON Feed format
  const posts = await fetchPublishedPosts()

  const feedPosts = posts
    .filter(post => post.locale === 'id')
    .sort((a, b) => new Date(b.publish_date).valueOf() - new Date(a.publish_date).valueOf())
    .slice(0, 20)
    .map(post => ({
      id: `${siteUrl}/blog/${post.slug}`,
      url: `${siteUrl}/blog/${post.slug}`,
      title: post.title,
      content_html: post.description,
      summary: post.description,
      image: post.image ? `${siteUrl}${post.image}` : undefined,
      date_published: new Date(post.publish_date).toISOString(),
      date_modified: post.update_date ? new Date(post.update_date).toISOString() : new Date(post.publish_date).toISOString(),
      authors: [{ name: post.author }],
      tags: [post.category, ...(post.tags || [])],
      language: post.locale,
    }))

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Ekalliptus Digital Blog',
    description: 'Artikel & insight tentang web development, mobile app, WordPress, dan multimedia editing',
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/blog/feed.json`,
    icon: `${siteUrl}/ekalliptus_rounded.webp`,
    authors: [
      {
        name: 'Ekalliptus Digital',
        url: siteUrl,
        avatar: `${siteUrl}/ekalliptus_rounded.webp`,
      },
    ],
    language: 'id',
    items: feedPosts,
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
