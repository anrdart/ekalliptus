# SEO & GEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement comprehensive SEO & GEO optimization for ekalliptus.com — fix critical bugs, overhaul schema markup, add 6 dedicated service landing pages, expand blog content, set up GA4 analytics, and add GEO signals (E-E-A-T, llms.txt, speakable schema) without changing existing design.

**Architecture:** Astro 6 + Cloudflare adapter, server-output mode. Multi-language (id/en/ja/ko/ru/ar/tr). Blog content stored in Supabase. All design styling reuses existing Tailwind classes and components (`glass-panel`, `neon-border`, `Layout`, `Navigation`, `ConsultationDialog`, `JsonLd`).

**Tech Stack:** Astro 6, TypeScript, Tailwind CSS, Supabase (blog content), Cloudflare Workers (deployment), Vitest (existing testing), GA4 (new).

**Reference spec:** `docs/superpowers/specs/2026-05-04-seo-geo-optimization-design.md`

---

## File Structure

**Modified files (7):**
- `src/layouts/Layout.astro` — slot fix, og:locale fix, new props (type/author/keywords/times), GA4, sitemap link, article meta
- `src/components/JsonLd.astro` — Organization/LocalBusiness/WebSite enhancements, HowTo, Person schemas
- `src/components/Navigation.astro` — add "Layanan" dropdown
- `src/pages/blog/[slug].astro` — pass new Layout props, fix image OG fallback, add speakable CSS classes
- `src/pages/index.astro` — title/description update + HowTo schema
- `public/robots.txt` — fix blocked URLs
- `src/lib/supabase.ts` — add `fetchPostsByTag` helper

**New files (13):**
- `src/pages/blog/tag/[tag].astro` — tag pages
- `src/pages/services/website.astro`
- `src/pages/services/mobile-app.astro`
- `src/pages/services/wordpress.astro`
- `src/pages/services/ui-ux.astro`
- `src/pages/services/multimedia.astro`
- `src/pages/services/maintenance.astro`
- `src/pages/about.astro`
- `src/content/blog/jasa-web-developer-freelance-indonesia.md`
- `src/content/blog/cara-membuat-website-company-profile.md`
- `src/content/blog/harga-jasa-ui-ux-design-indonesia.md`
- `src/content/blog/tips-optimasi-website-seo-untuk-umkm.md`
- `public/llms.txt`

**Updated content (5 markdown files):**
- All existing blog posts in `src/content/blog/*.md` — add `updateDate: 2026-05-04`

---

## Verification Strategy

This is mostly markup/content work. Verification per task:

1. **Build verification:** `bun run build` must succeed without errors
2. **Dev server check:** `bun run dev`, then visit affected URL, view-source, verify expected meta/HTML
3. **Schema validation:** After build, paste JSON-LD into [Google Rich Results Test](https://search.google.com/test/rich-results) (do this manually)
4. **Existing tests:** `bun run vitest --run` (only favicon test exists, must keep passing)

For HTML output checks during dev, use `curl http://localhost:4321/<path> | grep "<expected-string>"`.

---

# Phase 1: Foundation (Critical Bug Fixes)

## Task 1: Fix Layout.astro — slot, og:locale, new props, sitemap link, GA4

**Files:**
- Modify: `src/layouts/Layout.astro` (full rewrite)

- [ ] **Step 1: Replace Layout.astro with the corrected version**

```astro
---
import '../styles/global.css'

interface Props {
  title: string
  description?: string
  lang?: string
  dir?: 'ltr' | 'rtl'
  noindex?: boolean
  image?: string
  imageAlt?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  keywords?: string
}

const {
  title,
  description = 'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing.',
  lang = 'id',
  dir = 'ltr',
  noindex = false,
  image = '/og-image.png',
  imageAlt = 'Ekalliptus Digital — Indonesian Web & Mobile App Agency',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords
} = Astro.props

const siteUrl = 'https://ekalliptus.com'
const canonical = new URL(Astro.url.pathname, siteUrl).toString()
const ogImage = new URL(image, siteUrl).toString()

const ogLocaleMap: Record<string, string> = {
  id: 'id_ID', en: 'en_US', ja: 'ja_JP',
  ko: 'ko_KR', ru: 'ru_RU', ar: 'ar_SA', tr: 'tr_TR'
}
const ogLocale = ogLocaleMap[lang] ?? 'id_ID'
const ogLocaleAlternates = Object.values(ogLocaleMap).filter(l => l !== ogLocale)

const locales = ['id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr']
const path = Astro.url.pathname

function localePath(l: string) {
  const pathWithoutSlash = path.replace(/^\//, '')
  if (l === 'id') return `${siteUrl}/${pathWithoutSlash}`
  return `${siteUrl}/${l}/${pathWithoutSlash}`
}

const publishedYMD = publishedTime ? publishedTime.slice(0, 10).replace(/-/g, '/') : undefined
---

<!DOCTYPE html>
<html lang={lang} dir={dir} class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="description" content={description} />
    {keywords && <meta name="keywords" content={keywords} />}
    {author && <meta name="author" content={author} />}
    <meta name="format-detection" content="telephone=no" />
    <meta http-equiv="content-language" content={lang} />
    {noindex && <meta name="robots" content="noindex, nofollow" />}
    <meta name="theme-color" content="#0c1222" media="(prefers-color-scheme: dark)" />
    <meta name="theme-color" content="#f1f5f9" media="(prefers-color-scheme: light)" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="canonical" href={canonical} />
    <link rel="sitemap" type="application/xml" href="/sitemap-index.xml" />

    {locales.map(l => (
      <link rel="alternate" hreflang={l} href={localePath(l)} />
    ))}
    <link rel="alternate" hreflang="x-default" href={localePath('id')} />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'" />

    <title>{title}</title>

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonical} />
    <meta property="og:site_name" content="Ekalliptus Digital" />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={imageAlt} />
    <meta property="og:locale" content={ogLocale} />
    {ogLocaleAlternates.map(l => <meta property="og:locale:alternate" content={l} />)}

    {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
    {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
    {type === 'article' && author && <meta property="article:author" content={author} />}

    {type === 'article' && publishedYMD && <meta name="citation_title" content={title} />}
    {type === 'article' && author && <meta name="citation_author" content={author} />}
    {type === 'article' && publishedYMD && <meta name="citation_publication_date" content={publishedYMD} />}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
    <meta name="twitter:image:alt" content={imageAlt} />

    <slot name="head" />

    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-HQL55M3RTK"></script>
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-HQL55M3RTK');
    </script>

    <script is:inline src="/vendor/three.min.js" defer></script>
    <script is:inline src="/vendor/vanta.net.min.js" defer></script>

    <script is:inline>
      const theme = localStorage.getItem('ekal-theme') || 'dark'
      document.documentElement.classList.toggle('dark', theme === 'dark')
    </script>
  </head>
  <body class="bg-background text-foreground antialiased min-h-screen">
    <noscript>
      <div style="padding:2rem;text-align:center;font-family:system-ui,sans-serif;">
        <h1>Ekalliptus Digital</h1>
        <p>Javascript diperlukan untuk melihat website ini dengan baik.</p>
        <p>Hubungi kami: <a href="mailto:ekalliptus@gmail.com">ekalliptus@gmail.com</a> | <a href="https://wa.me/6281999900306">WhatsApp</a></p>
        <p><a href="/">Kembali ke Beranda</a> | <a href="/order">Order Layanan</a></p>
      </div>
    </noscript>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Verify build passes**

Run: `bun run build`
Expected: Build completes successfully without TypeScript errors.

- [ ] **Step 3: Verify HTML output**

Run: `bun run dev` in background, then `curl -s http://localhost:4321/ | grep -E 'og:locale|slot|gtag/js'`
Expected output contains:
- `<meta property="og:locale" content="id_ID" />`
- `<meta property="og:locale:alternate" content="en_US" />` (and others)
- `<script async src="https://www.googletagmanager.com/gtag/js?id=G-HQL55M3RTK">`

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "fix(seo): add head slot, fix og:locale, add GA4 + new layout props"
```

---

## Task 2: Fix robots.txt

**Files:**
- Modify: `public/robots.txt` (full rewrite)

- [ ] **Step 1: Replace robots.txt with corrected version**

```
# Robots.txt for ekalliptus.com

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /order-success
Disallow: /payment/

# Allow feeds (override any *.json blanket if added later)
Allow: /blog/feed.json
Allow: /blog/rss.xml

# Allow LLM access (GEO)
Allow: /llms.txt

Sitemap: https://ekalliptus.com/sitemap-index.xml
Sitemap: https://ekalliptus.com/blog/sitemap.xml
```

- [ ] **Step 2: Verify served correctly**

Run: `curl -s http://localhost:4321/robots.txt`
Expected: matches the file above; no `Disallow: /*.json$` rule.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "fix(seo): unblock /blog/feed.json and tighten robots.txt rules"
```

---

## Task 3: Fix blog/[slug].astro — pass new Layout props, fix image fallback

**Files:**
- Modify: `src/pages/blog/[slug].astro` (only the `<Layout>` opening tag and image logic)

- [ ] **Step 1: Update the Layout call and add image fallback logic**

Find this block (around line 80-100):

```ts
const metaTitle = post.data.seo?.metaTitle || post.data.title
const metaDescription = post.data.seo?.metaDescription || post.data.description
```

Replace with:

```ts
const metaTitle = post.data.seo?.metaTitle || post.data.title
const metaDescription = post.data.seo?.metaDescription || post.data.description

// SVG images don't work as og:image. Fallback to /og-image.png if SVG.
const ogImage = post.data.image && !post.data.image.endsWith('.svg')
  ? post.data.image
  : '/og-image.png'
const ogImageAlt = post.data.imageAlt || post.data.title

const articleKeywords = (post.data.tags || []).join(', ')
```

- [ ] **Step 2: Update the Layout opening tag**

Find this line:

```astro
<Layout title={metaTitle} description={metaDescription} lang={locale} dir={dir} noindex={post.data.seo?.noindex ?? false} image={post.data.image || '/og-image.png'} imageAlt={post.data.imageAlt || post.data.title}>
```

Replace with:

```astro
<Layout
  title={metaTitle}
  description={metaDescription}
  lang={locale}
  dir={dir}
  noindex={post.data.seo?.noindex ?? false}
  image={ogImage}
  imageAlt={ogImageAlt}
  type="article"
  publishedTime={post.data.publishDate.toISOString()}
  modifiedTime={(post.data.updateDate || post.data.publishDate).toISOString()}
  author={post.data.author}
  keywords={articleKeywords}
>
```

- [ ] **Step 3: Update blogPostSchema mainEntityOfPage**

Find:

```ts
mainEntityOfPage: canonical
```

Replace with:

```ts
mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
inLanguage: locale,
keywords: articleKeywords,
wordCount: (post.body_html || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).length,
articleSection: post.data.category,
speakable: {
  '@type': 'SpeakableSpecification',
  cssSelector: ['.article-intro', 'article h1', 'article h2']
}
```

- [ ] **Step 4: Add `.article-intro` class to lead description**

Find:

```astro
{post.data.description && (
  <p class="text-base sm:text-lg text-muted-foreground mb-6">{post.data.description}</p>
)}
```

Replace with:

```astro
{post.data.description && (
  <p class="article-intro text-base sm:text-lg text-muted-foreground mb-6">{post.data.description}</p>
)}
```

- [ ] **Step 5: Build and verify**

Run: `bun run build`
Expected: Build completes successfully.

- [ ] **Step 6: Commit**

```bash
git add src/pages/blog/[slug].astro
git commit -m "fix(seo): blog uses new Layout article props + speakable schema"
```

---

## Task 4: Update homepage title/description

**Files:**
- Modify: `src/pages/index.astro` (only the `<Layout>` opening tag)

- [ ] **Step 1: Update Layout call in index.astro**

Find:

```astro
<Layout 
  title="Ekalliptus Digital | Web & Mobile App" 
  description={t('index.intro.subtitle', locale)}
  lang={locale}
  dir={dir}
>
```

Replace with:

```astro
<Layout 
  title="Ekalliptus Digital | Jasa Website & Aplikasi Mobile Terbaik Indonesia"
  description="Jasa pembuatan website profesional, aplikasi mobile, WordPress & UI/UX design. Berbasis Tegal, melayani seluruh Indonesia. Konsultasi GRATIS!"
  lang={locale}
  dir={dir}
  keywords="jasa pembuatan website, jasa aplikasi mobile, web developer Indonesia, digital agency Tegal, jasa wordpress, ui ux design Indonesia"
>
```

- [ ] **Step 2: Verify**

Run: `bun run dev` then `curl -s http://localhost:4321/ | grep -E '<title>|description|keywords'`
Expected: title contains "Jasa Website & Aplikasi Mobile Terbaik Indonesia"

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(seo): keyword-rich title and description for homepage"
```

---

# Phase 2: Schema Overhaul

## Task 5: Update JsonLd.astro — enrich existing schemas + add HowTo, Person

**Files:**
- Modify: `src/components/JsonLd.astro` (full rewrite)

- [ ] **Step 1: Replace JsonLd.astro with the enriched version**

```astro
---
interface Props {
  locale?: string
  page?: 'home' | 'faq' | 'service'
  faqItems?: Array<{ question: string; answer: string }>
}

const { locale = 'id', page = 'home', faqItems = [] } = Astro.props

const siteUrl = 'https://ekalliptus.com'

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}#organization`,
  name: 'Ekalliptus Digital',
  url: siteUrl,
  logo: `${siteUrl}/ekalliptus_rounded.webp`,
  description: 'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing.',
  email: 'ekalliptus@gmail.com',
  telephone: '+6281999900306',
  foundingDate: '2023',
  numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 10 },
  knowsAbout: [
    'Web Development',
    'Mobile App Development',
    'WordPress Development',
    'UI/UX Design',
    'Photo & Video Editing',
    'Astro Framework',
    'React Native',
    'Flutter'
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tegal',
    addressRegion: 'Jawa Tengah',
    postalCode: '52100',
    addressCountry: 'ID'
  },
  sameAs: [
    'https://www.linkedin.com/company/ekalliptus',
    'https://github.com/ekalliptus',
    'https://www.instagram.com/ekalliptus'
  ]
}

const localBusiness = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${siteUrl}#localbusiness`,
  name: 'Ekalliptus Digital',
  url: siteUrl,
  image: `${siteUrl}/ekalliptus_rounded.webp`,
  telephone: '+6281999900306',
  email: 'ekalliptus@gmail.com',
  openingHours: 'Mo-Fr 09:00-17:00',
  currenciesAccepted: 'IDR',
  paymentAccepted: 'Cash, Bank Transfer, E-Wallet, Credit Card',
  hasMap: 'https://www.google.com/maps/place/Tegal',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tegal',
    addressRegion: 'Jawa Tengah',
    postalCode: '52100',
    addressCountry: 'ID'
  },
  priceRange: '$$',
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -6.8707,
    longitude: 109.1250
  },
  areaServed: [
    { '@type': 'Country', name: 'Indonesia' },
    { '@type': 'City', name: 'Tegal' },
    { '@type': 'AdministrativeArea', name: 'Jawa Tengah' }
  ],
  serviceType: [
    'Web Development',
    'Mobile App Development',
    'WordPress Development',
    'Photo & Video Editing',
    'UI/UX Design'
  ]
}

const webSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}#website`,
  name: 'Ekalliptus Digital',
  url: siteUrl,
  description: 'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing.',
  inLanguage: locale,
  publisher: { '@id': `${siteUrl}#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/blog?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
}

const teamPerson = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${siteUrl}#tim-ekalliptus`,
  name: 'Tim Ekalliptus',
  jobTitle: 'Digital Agency Team',
  worksFor: { '@id': `${siteUrl}#organization` },
  url: `${siteUrl}/about`
}

const services = [
  {
    '@type': 'Service',
    name: 'Website Development',
    description: 'Layanan pembuatan website company profile, e-commerce, dan aplikasi web custom dengan teknologi modern.',
    url: `${siteUrl}/services/website`,
    provider: { '@id': `${siteUrl}#organization` },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    offers: { '@type': 'Offer', priceCurrency: 'IDR', price: '1500000', availability: 'https://schema.org/InStock' }
  },
  {
    '@type': 'Service',
    name: 'Mobile App Development',
    description: 'Pengembangan aplikasi mobile cross-platform dengan React Native dan Flutter untuk iOS dan Android.',
    url: `${siteUrl}/services/mobile-app`,
    provider: { '@id': `${siteUrl}#organization` },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    offers: { '@type': 'Offer', priceCurrency: 'IDR', price: '5000000', availability: 'https://schema.org/InStock' }
  },
  {
    '@type': 'Service',
    name: 'WordPress Development',
    description: 'Pembuatan dan customisasi website WordPress dengan plugin custom, optimasi performa, dan integrasi sistem.',
    url: `${siteUrl}/services/wordpress`,
    provider: { '@id': `${siteUrl}#organization` },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    offers: { '@type': 'Offer', priceCurrency: 'IDR', price: '2000000', availability: 'https://schema.org/InStock' }
  },
  {
    '@type': 'Service',
    name: 'UI/UX Design',
    description: 'Desain antarmuka pengguna dan pengalaman pengguna yang intuitif, modern, dan user-centric.',
    url: `${siteUrl}/services/ui-ux`,
    provider: { '@id': `${siteUrl}#organization` },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    offers: { '@type': 'Offer', priceCurrency: 'IDR', price: '1000000', availability: 'https://schema.org/InStock' }
  },
  {
    '@type': 'Service',
    name: 'Photo & Video Editing',
    description: 'Layanan editing foto dan video profesional untuk kebutuhan bisnis, social media, dan marketing.',
    url: `${siteUrl}/services/multimedia`,
    provider: { '@id': `${siteUrl}#organization` },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    offers: { '@type': 'Offer', priceCurrency: 'IDR', price: '50000', availability: 'https://schema.org/InStock' }
  },
  {
    '@type': 'Service',
    name: 'Maintenance Website',
    description: 'Paket maintenance website rutin meliputi update, backup, monitoring keamanan, dan technical support.',
    url: `${siteUrl}/services/maintenance`,
    provider: { '@id': `${siteUrl}#organization` },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    offers: { '@type': 'Offer', priceCurrency: 'IDR', price: '500000', availability: 'https://schema.org/InStock' }
  }
]

const howToOrder = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Cara Order Layanan Ekalliptus Digital',
  description: 'Panduan langkah demi langkah untuk memesan layanan digital di Ekalliptus.',
  totalTime: 'PT15M',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Isi Form Order', text: 'Pilih layanan dan isi form order dengan detail kebutuhan project Anda.' },
    { '@type': 'HowToStep', position: 2, name: 'Konsultasi & Briefing', text: 'Tim kami akan menghubungi Anda untuk konsultasi dan menyusun brief project.' },
    { '@type': 'HowToStep', position: 3, name: 'Pengerjaan Project', text: 'Project dikerjakan sesuai timeline yang disepakati dengan update berkala.' },
    { '@type': 'HowToStep', position: 4, name: 'Review & Handover', text: 'Review hasil, revisi jika perlu, lalu handover beserta dokumentasi lengkap.' }
  ]
}

const faqSchema = faqItems.length > 0 ? {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer }
  }))
} : null

const schemas = [
  JSON.stringify(organization),
  JSON.stringify(localBusiness),
  JSON.stringify(webSite),
  JSON.stringify(teamPerson),
  JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Layanan Ekalliptus Digital', itemListElement: services.map((s, i) => ({ ...s, position: i + 1 })) }),
  ...(page === 'home' ? [JSON.stringify(howToOrder)] : []),
  ...(faqSchema ? [JSON.stringify(faqSchema)] : [])
]
---

{schemas.map(schema => (
  <script type="application/ld+json" set:html={schema} />
))}
```

- [ ] **Step 2: Build and verify**

Run: `bun run build`
Expected: Build completes successfully.

- [ ] **Step 3: Verify schema HTML output**

Run: `bun run dev` then `curl -s http://localhost:4321/ | grep -c "application/ld+json"`
Expected: returns at least 6 (organization, localBusiness, webSite, teamPerson, services ItemList, howTo, faq).

- [ ] **Step 4: Commit**

```bash
git add src/components/JsonLd.astro
git commit -m "feat(seo): enrich schemas with HowTo, Person, Offer, openingHours"
```

---

# Phase 3: Tag Pages + Navigation

## Task 6: Add `fetchPostsByTag` helper to supabase.ts

**Files:**
- Modify: `src/lib/supabase.ts` (add new function after `fetchPostBySlug`)

- [ ] **Step 1: Add new function**

Find the line with `export async function fetchPostBySlug(...)` and add this function after the closing brace of `fetchPostBySlug`:

```ts
export async function fetchPostsByTag(tag: string, locale: string = 'id'): Promise<BlogPost[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('locale', locale)
    .contains('tags', [tag])
    .order('publish_date', { ascending: false })

  if (error) {
    console.error('fetchPostsByTag error:', error)
    return []
  }

  return (data || []).map((p: any) => ({
    id: p.slug,
    slug: p.slug,
    locale: p.locale,
    title: p.title,
    description: p.description,
    body_html: p.body_html,
    publish_date: p.publish_date,
    update_date: p.update_date,
    category: p.category,
    tags: p.tags ?? [],
    author: p.author,
    image: p.image ?? null,
    image_alt: p.image_alt ?? null,
    featured: p.featured ?? false,
    seo_meta_title: p.seo_meta_title ?? null,
    seo_meta_description: p.seo_meta_description ?? null,
    seo_noindex: p.seo_noindex ?? null,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }))
}
```

- [ ] **Step 2: Verify build passes**

Run: `bun run build`
Expected: Build completes successfully.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat(blog): add fetchPostsByTag helper"
```

---

## Task 7: Create blog tag pages

**Files:**
- Create: `src/pages/blog/tag/[tag].astro`

- [ ] **Step 1: Create the tag page**

```astro
---
import Layout from '../../../layouts/Layout.astro'
import Navigation from '../../../components/Navigation.astro'
import VantaBackground from '../../../components/VantaBackground.astro'
import PreLoader from '../../../components/PreLoader.astro'
import { fetchPostsByTag } from '../../../lib/supabase'
import { t, getLocaleFromRequest, getDir } from '../../../i18n'
import { Calendar, User, ArrowLeft } from 'lucide-astro'

export const prerender = false

const locale = getLocaleFromRequest(Astro.request)
const dir = getDir(locale)
const tag = decodeURIComponent(Astro.params.tag as string)
const posts = await fetchPostsByTag(tag, 'id')

const siteUrl = 'https://ekalliptus.com'
const canonical = new URL(Astro.url.pathname, siteUrl).toString()

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `Artikel dengan tag "${tag}"`,
  url: canonical,
  description: `Daftar artikel di blog Ekalliptus Digital dengan tag ${tag}.`,
  isPartOf: { '@type': 'Blog', name: 'Ekalliptus Digital Blog', url: `${siteUrl}/blog` }
}
---

<Layout
  title={`Artikel Tag "${tag}" | Ekalliptus Digital Blog`}
  description={`Kumpulan artikel dengan tag ${tag} di Ekalliptus Digital. Web development, mobile app, WordPress, dan multimedia editing.`}
  lang={locale}
  dir={dir}
  keywords={tag}
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(collectionSchema)} />
  </Fragment>

  <VantaBackground />
  <PreLoader />
  <Navigation t={(key: string) => t(key, locale)} currentLang={locale} />

  <main class="relative z-0 flex min-h-screen flex-col pt-14 sm:pt-16 md:pt-20">
    <div class="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <nav class="text-sm mb-6" aria-label="Breadcrumb">
        <a href="/" class="text-muted-foreground hover:text-foreground">Home</a>
        <span class="mx-2 text-muted-foreground">/</span>
        <a href="/blog" class="text-muted-foreground hover:text-foreground">Blog</a>
        <span class="mx-2 text-muted-foreground">/</span>
        <span class="text-foreground">Tag: {tag}</span>
      </nav>

      <header class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Artikel dengan tag <span class="text-primary">#{tag}</span>
        </h1>
        <p class="text-muted-foreground">
          Ditemukan {posts.length} artikel dengan tag ini.
        </p>
      </header>

      {posts.length === 0 ? (
        <div class="glass-panel rounded-2xl p-8 text-center">
          <p class="text-muted-foreground mb-4">Belum ada artikel dengan tag ini.</p>
          <a href="/blog" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
            <ArrowLeft class="h-4 w-4" /> Kembali ke Blog
          </a>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post: any) => (
            <article class="group rounded-2xl glass-panel bg-card/10 border border-border/20 overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
              {post.image && (
                <a href={`/blog/${post.slug}`} class="block aspect-video overflow-hidden">
                  <img src={post.image} alt={post.image_alt || post.title} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
                </a>
              )}
              <div class="p-5 sm:p-6">
                <span class="glass-pill rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-primary border-primary/30">
                  {post.category}
                </span>
                <h2 class="text-lg sm:text-xl font-semibold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors leading-snug">
                  <a href={`/blog/${post.slug}`}>{post.title}</a>
                </h2>
                <p class="text-sm text-muted-foreground mb-4 line-clamp-2">{post.description}</p>
                <div class="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/10">
                  <div class="flex items-center gap-1.5">
                    <Calendar class="h-3.5 w-3.5" />
                    <time datetime={new Date(post.publish_date).toISOString()}>
                      {new Date(post.publish_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </time>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <User class="h-3.5 w-3.5" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div class="mt-10">
        <a href="/blog" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
          <ArrowLeft class="h-4 w-4" /> Kembali ke Blog
        </a>
      </div>
    </div>
  </main>
</Layout>
```

- [ ] **Step 2: Update existing blog/[slug].astro tag links**

In `src/pages/blog/[slug].astro`, find:

```astro
<a href={`/blog?tag=${tag}`} class="glass-pill rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-border/10">#{tag}</a>
```

Replace with:

```astro
<a href={`/blog/tag/${encodeURIComponent(tag)}`} class="glass-pill rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-border/10">#{tag}</a>
```

- [ ] **Step 3: Build and verify**

Run: `bun run build` then `bun run dev` and test e.g. `curl -s "http://localhost:4321/blog/tag/wordpress"` returns HTML with `<h1>` containing "wordpress".

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/tag/[tag].astro src/pages/blog/[slug].astro
git commit -m "feat(seo): add /blog/tag/[tag] pages, fix tag links 404"
```

---

## Task 8: Update Navigation.astro — add "Layanan" dropdown

**Files:**
- Modify: `src/components/Navigation.astro`

- [ ] **Step 1: Update sectionLinks array**

In `src/components/Navigation.astro`, find:

```ts
const sectionLinks = [
  { key: 'home', hash: '#home' },
  { key: 'services', hash: '#services' },
  { key: 'blog', href: '/blog', external: true },
  { key: 'about', hash: '#about' },
  { key: 'contact', hash: '#contact' }
]
```

Replace with:

```ts
const sectionLinks = [
  { key: 'home', hash: '#home' },
  { key: 'services', hash: '#services', dropdown: true },
  { key: 'blog', href: '/blog', external: true },
  { key: 'about', href: '/about', external: true },
  { key: 'contact', hash: '#contact' }
]

const serviceItems = [
  { name: 'Website Development', href: '/services/website' },
  { name: 'Mobile App', href: '/services/mobile-app' },
  { name: 'WordPress', href: '/services/wordpress' },
  { name: 'UI/UX Design', href: '/services/ui-ux' },
  { name: 'Photo & Video', href: '/services/multimedia' },
  { name: 'Maintenance', href: '/services/maintenance' }
]
```

- [ ] **Step 2: Update desktop nav rendering**

Find this block (the `<div class="hidden items-center gap-1 md:flex" id="desktop-nav">` block):

```astro
<div class="hidden items-center gap-1 md:flex" id="desktop-nav">
  {sectionLinks.map((item) => (
    item.external ? (
      <a
        href={item.href}
        class="nav-link cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
      >
        {t(`nav.${item.key}`)}
      </a>
    ) : isHomePage ? (
      <button
        type="button"
        data-hash={item.hash}
        class="nav-link cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
      >
        {t(`nav.${item.key}`)}
      </button>
    ) : (
      <a
        href={`/${item.hash}`}
        class="nav-link cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
      >
        {t(`nav.${item.key}`)}
      </a>
    )
  ))}
</div>
```

Replace with:

```astro
<div class="hidden items-center gap-1 md:flex" id="desktop-nav">
  {sectionLinks.map((item) => (
    item.dropdown ? (
      <div class="relative group">
        <button
          type="button"
          class="nav-link cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
          data-hash={item.hash}
        >
          {t(`nav.${item.key}`)}
        </button>
        <div class="absolute left-1/2 top-full -translate-x-1/2 mt-2 w-56 rounded-2xl glass-panel border border-border/20 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {serviceItems.map(s => (
            <a href={s.href} class="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/10 hover:text-foreground transition">
              {s.name}
            </a>
          ))}
        </div>
      </div>
    ) : item.external ? (
      <a
        href={item.href}
        class="nav-link cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
      >
        {t(`nav.${item.key}`)}
      </a>
    ) : isHomePage ? (
      <button
        type="button"
        data-hash={item.hash}
        class="nav-link cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
      >
        {t(`nav.${item.key}`)}
      </button>
    ) : (
      <a
        href={`/${item.hash}`}
        class="nav-link cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
      >
        {t(`nav.${item.key}`)}
      </a>
    )
  ))}
</div>
```

- [ ] **Step 3: Update mobile nav to show service items**

Find the mobile `<nav class="flex flex-col gap-1">` block, and update the mapping similarly. After the existing `sectionLinks.map` block, add inside the mobile menu (before the `<div class="my-2 border-t border-border"></div>` after the language section):

```astro
{sectionLinks.map((item) => (
  item.dropdown ? (
    <>
      {isHomePage ? (
        <button
          type="button"
          data-hash={item.hash}
          class="nav-link cursor-interactive rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground active:bg-accent/80"
        >
          {t(`nav.${item.key}`)}
        </button>
      ) : (
        <a
          href={`/${item.hash}`}
          class="nav-link cursor-interactive rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground active:bg-accent/80"
        >
          {t(`nav.${item.key}`)}
        </a>
      )}
      <div class="ml-4 flex flex-col gap-1">
        {serviceItems.map(s => (
          <a href={s.href} class="rounded-lg px-3 py-2 text-xs text-foreground/70 hover:bg-accent hover:text-foreground transition">
            {s.name}
          </a>
        ))}
      </div>
    </>
  ) : item.external ? (
    <a
      href={item.href}
      class="nav-link cursor-interactive rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground active:bg-accent/80"
    >
      {t(`nav.${item.key}`)}
    </a>
  ) : isHomePage ? (
    <button
      type="button"
      data-hash={item.hash}
      class="nav-link cursor-interactive rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground active:bg-accent/80"
    >
      {t(`nav.${item.key}`)}
    </button>
  ) : (
    <a
      href={`/${item.hash}`}
      class="nav-link cursor-interactive rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground active:bg-accent/80"
    >
      {t(`nav.${item.key}`)}
    </a>
  )
))}
```

(Replace the existing inner mobile mapping with this new mapping.)

- [ ] **Step 4: Build and verify**

Run: `bun run build && bun run dev`
Manually open `http://localhost:4321/`, hover over "Layanan" — dropdown shows 6 services.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navigation.astro
git commit -m "feat(nav): add Layanan dropdown for service pages"
```

---

# Phase 4: Service Landing Pages

All 6 service pages share the same structure. Each has its own keywords, copy, and FAQ.

## Task 9: Create `/services/website` page

**Files:**
- Create: `src/pages/services/website.astro`

- [ ] **Step 1: Create the file**

```astro
---
import Layout from '../../layouts/Layout.astro'
import Navigation from '../../components/Navigation.astro'
import VantaBackground from '../../components/VantaBackground.astro'
import PreLoader from '../../components/PreLoader.astro'
import ConsultationDialog from '../../components/ConsultationDialog.astro'
import { t, getLocaleFromRequest, getDir } from '../../i18n'
import { Check, ArrowRight, Code, Globe, Zap, Shield } from 'lucide-astro'

const locale = getLocaleFromRequest(Astro.request)
const dir = getDir(locale)

const siteUrl = 'https://ekalliptus.com'
const canonical = new URL(Astro.url.pathname, siteUrl).toString()

const faqs = [
  { question: 'Berapa biaya pembuatan website company profile?', answer: 'Mulai Rp 1,5 juta untuk website company profile responsif dengan 5-10 halaman, free domain 1 tahun, dan hosting Indonesia.' },
  { question: 'Berapa lama proses pembuatan website?', answer: 'Website company profile 7-14 hari, e-commerce 14-21 hari, web app custom 21-45 hari kerja.' },
  { question: 'Apakah website mobile-friendly?', answer: 'Ya, semua website kami responsif dan dioptimasi untuk mobile, tablet, dan desktop secara default.' },
  { question: 'Apakah termasuk SEO optimization?', answer: 'Ya, basic SEO (meta tags, sitemap, robots.txt, schema markup, performance) sudah included dalam paket.' },
  { question: 'Apakah ada garansi?', answer: 'Garansi 30 hari untuk bug fixing dan free maintenance 3 bulan pertama untuk update keamanan.' },
  { question: 'Bisa request fitur custom?', answer: 'Tentu. Setiap project bisa di-customize sesuai kebutuhan bisnis Anda. Konsultasi gratis untuk diskusi requirement.' }
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Jasa Pembuatan Website Profesional',
  serviceType: 'Web Development',
  description: 'Jasa pembuatan website profesional, company profile, e-commerce, landing page, dan web application custom di Indonesia.',
  provider: { '@id': `${siteUrl}#organization` },
  areaServed: [
    { '@type': 'Country', name: 'Indonesia' },
    { '@type': 'City', name: 'Tegal' }
  ],
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'IDR',
    lowPrice: '500000',
    highPrice: '15000000',
    availability: 'https://schema.org/InStock'
  },
  url: canonical
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Layanan', item: `${siteUrl}/services/website` },
    { '@type': 'ListItem', position: 3, name: 'Website Development', item: canonical }
  ]
}
---

<Layout
  title="Jasa Pembuatan Website Profesional Indonesia | Mulai Rp 1,5 Juta - Ekalliptus"
  description="Jasa pembuatan website profesional Indonesia: company profile, e-commerce, landing page, web app custom. Mulai Rp 1,5 juta. Free konsultasi & garansi 30 hari."
  lang={locale}
  dir={dir}
  keywords="jasa pembuatan website, web developer Indonesia, website company profile, jasa website murah, website e-commerce, jasa landing page"
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(serviceSchema)} />
    <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />
    <script type="application/ld+json" set:html={JSON.stringify(breadcrumbSchema)} />
  </Fragment>

  <VantaBackground />
  <PreLoader />
  <Navigation t={(key: string) => t(key, locale)} currentLang={locale} />

  <main class="relative z-0 flex min-h-screen flex-col pt-14 sm:pt-16 md:pt-20">
    <div class="container mx-auto max-w-6xl px-4 py-8 sm:py-12">

      <nav class="text-sm mb-6" aria-label="Breadcrumb">
        <a href="/" class="text-muted-foreground hover:text-foreground">Home</a>
        <span class="mx-2 text-muted-foreground">/</span>
        <span class="text-foreground">Jasa Pembuatan Website</span>
      </nav>

      <header class="mb-12 text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Jasa Pembuatan Website Profesional Indonesia</h1>
        <p class="article-intro text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          <strong>Jasa pembuatan website</strong> adalah layanan pengembangan situs web profesional yang dirancang untuk membantu bisnis hadir secara digital. Ekalliptus Digital menyediakan jasa pembuatan website company profile, e-commerce, landing page, dan web application custom untuk bisnis di seluruh Indonesia, dengan harga mulai <strong>Rp 1,5 juta</strong> dan garansi 30 hari.
        </p>
      </header>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Apa yang Anda Dapatkan</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20">
            <div class="rounded-full bg-primary/10 p-3 w-fit mb-4"><Globe class="h-5 w-5 text-primary" /></div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Responsive Design</h3>
            <p class="text-sm text-muted-foreground">Tampilan optimal di semua perangkat: mobile, tablet, dan desktop.</p>
          </div>
          <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20">
            <div class="rounded-full bg-primary/10 p-3 w-fit mb-4"><Zap class="h-5 w-5 text-primary" /></div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Fast Loading</h3>
            <p class="text-sm text-muted-foreground">Performa tinggi dengan optimasi Core Web Vitals dan CDN global.</p>
          </div>
          <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20">
            <div class="rounded-full bg-primary/10 p-3 w-fit mb-4"><Code class="h-5 w-5 text-primary" /></div>
            <h3 class="text-lg font-semibold text-foreground mb-2">SEO Ready</h3>
            <p class="text-sm text-muted-foreground">Schema markup, sitemap, dan meta tags built-in untuk ranking Google.</p>
          </div>
          <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20">
            <div class="rounded-full bg-primary/10 p-3 w-fit mb-4"><Shield class="h-5 w-5 text-primary" /></div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Secure & Reliable</h3>
            <p class="text-sm text-muted-foreground">SSL, backup berkala, dan monitoring keamanan 24/7.</p>
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Paket & Harga Website</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-panel rounded-2xl p-6 bg-card/10 border border-border/20">
            <h3 class="text-xl font-bold text-foreground mb-2">Landing Page</h3>
            <p class="text-2xl font-bold text-primary mb-4">Rp 500rb - 1,5jt</p>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> Single page focused</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> Lead capture form</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> Mobile-optimized</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> 3-7 hari pengerjaan</li>
            </ul>
          </div>
          <div class="glass-panel neon-border rounded-2xl p-6 bg-card/10">
            <h3 class="text-xl font-bold text-foreground mb-2">Company Profile</h3>
            <p class="text-2xl font-bold text-primary mb-4">Rp 1,5jt - 3jt</p>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> 5-10 halaman</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> Free domain & hosting 1 tahun</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> Basic SEO + Analytics</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> 7-14 hari pengerjaan</li>
            </ul>
          </div>
          <div class="glass-panel rounded-2xl p-6 bg-card/10 border border-border/20">
            <h3 class="text-xl font-bold text-foreground mb-2">E-Commerce</h3>
            <p class="text-2xl font-bold text-primary mb-4">Rp 3jt - 8jt</p>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> Product catalog & cart</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> Payment gateway integration</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> Stock management</li>
              <li class="flex gap-2"><Check class="h-4 w-4 text-primary flex-shrink-0" /> 14-21 hari pengerjaan</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Teknologi yang Kami Gunakan</h2>
        <div class="glass-panel rounded-2xl p-6 bg-card/10 border border-border/20 text-center">
          <p class="text-muted-foreground mb-4">Stack modern untuk performa & maintainability terbaik:</p>
          <div class="flex flex-wrap gap-2 justify-center">
            {['Astro', 'Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Node.js', 'PHP Laravel', 'WordPress', 'Supabase', 'PostgreSQL'].map(tech => (
              <span class="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Proses Kerja</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { num: 1, title: 'Konsultasi', desc: 'Diskusi kebutuhan dan target bisnis Anda' },
            { num: 2, title: 'Design Mockup', desc: 'Wireframe & UI/UX design dengan revisi gratis' },
            { num: 3, title: 'Development', desc: 'Coding dan testing sampai siap launch' },
            { num: 4, title: 'Launch', desc: 'Deploy, handover dokumentasi, dan garansi 30 hari' }
          ].map(step => (
            <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20 text-center">
              <div class="rounded-full bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center font-bold mx-auto mb-3">{step.num}</div>
              <h3 class="font-semibold text-foreground mb-2">{step.title}</h3>
              <p class="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">FAQ</h2>
        <div class="space-y-3">
          {faqs.map(faq => (
            <details class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20 group">
              <summary class="font-semibold text-foreground cursor-pointer flex items-center justify-between">
                {faq.question}
                <span class="text-primary group-open:rotate-180 transition">▼</span>
              </summary>
              <p class="text-sm text-muted-foreground mt-3">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Artikel Terkait</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/blog/jasa-pembuatan-website-tegal" class="glass-panel rounded-2xl p-6 bg-card/10 border border-border/20 hover:border-primary/30 transition group">
            <h3 class="font-semibold text-foreground mb-2 group-hover:text-primary transition">Jasa Pembuatan Website Tegal: Harga & Portfolio 2026</h3>
            <p class="text-sm text-muted-foreground">Panduan lengkap layanan website di Tegal dan sekitarnya →</p>
          </a>
          <a href="/blog/wordpress-custom-vs-template" class="glass-panel rounded-2xl p-6 bg-card/10 border border-border/20 hover:border-primary/30 transition group">
            <h3 class="font-semibold text-foreground mb-2 group-hover:text-primary transition">WordPress Custom vs Template: Mana yang Lebih Baik?</h3>
            <p class="text-sm text-muted-foreground">Perbandingan custom development vs theme premium →</p>
          </a>
        </div>
      </section>

      <section class="mb-12 text-center">
        <div class="glass-panel neon-border rounded-2xl sm:rounded-3xl p-8 bg-card/5">
          <h2 class="text-2xl sm:text-3xl font-bold text-foreground mb-3">Siap Memulai Project Website Anda?</h2>
          <p class="text-muted-foreground mb-6">Konsultasi GRATIS — diskusi kebutuhan, dapatkan proposal custom dalam 24 jam.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/order" class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
              Order Sekarang <ArrowRight class="h-4 w-4" />
            </a>
            <a href="https://wa.me/6281999900306" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-card/30">
              WhatsApp Konsultasi
            </a>
          </div>
        </div>
      </section>

    </div>

    <ConsultationDialog t={(key: string) => t(key, locale)} />
  </main>
</Layout>
```

- [ ] **Step 2: Build and verify**

Run: `bun run build && bun run dev`, then `curl -s http://localhost:4321/services/website | grep -E "Jasa Pembuatan Website|FAQPage"`
Expected: contains H1 and FAQPage schema.

- [ ] **Step 3: Commit**

```bash
git add src/pages/services/website.astro
git commit -m "feat(seo): add /services/website landing page with schemas"
```

---

## Task 10: Create `/services/mobile-app` page

**Files:**
- Create: `src/pages/services/mobile-app.astro`

- [ ] **Step 1: Create the file**

Use the SAME template as Task 9, but replace these specific values:

**Frontmatter changes:**
- Replace `faqs` array with:
```ts
const faqs = [
  { question: 'Berapa biaya pembuatan aplikasi mobile?', answer: 'Mulai Rp 5 juta untuk MVP, Rp 15-50 juta untuk e-commerce, Rp 50-200+ juta untuk enterprise. Cross-platform 40-60% lebih hemat dari native.' },
  { question: 'React Native atau Flutter, mana yang lebih baik?', answer: 'Keduanya bagus untuk cross-platform. React Native: ekosistem JavaScript besar. Flutter: performa lebih dekat ke native, single codebase lebih konsisten. Kami merekomendasikan sesuai kebutuhan project.' },
  { question: 'Apakah aplikasi bisa di-publish ke Play Store dan App Store?', answer: 'Ya, kami handle proses publishing termasuk setup developer account jika belum ada. Biaya developer account ditanggung klien (Apple $99/tahun, Google $25 sekali bayar).' },
  { question: 'Berapa lama proses development?', answer: 'MVP 2-4 minggu, e-commerce 1-3 bulan, social media app 3-6 bulan, enterprise app 4-12 bulan tergantung kompleksitas.' },
  { question: 'Apakah include backend API?', answer: 'Ya, kami develop backend API dengan Node.js/Supabase termasuk autentikasi, database, dan REST/GraphQL endpoints.' },
  { question: 'Apakah ada maintenance setelah launch?', answer: 'Ya, paket maintenance bulanan untuk bug fixing, OS updates, dan feature additions tersedia mulai Rp 1 juta/bulan.' }
]
```

- Replace `serviceSchema.name` with `'Jasa Pembuatan Aplikasi Mobile'`
- Replace `serviceSchema.serviceType` with `'Mobile App Development'`
- Replace `serviceSchema.description` with `'Jasa pembuatan aplikasi mobile cross-platform Android & iOS dengan React Native dan Flutter di Indonesia.'`
- Replace `serviceSchema.offers` `lowPrice: '5000000', highPrice: '200000000'`
- Replace breadcrumb name to `'Mobile App Development'`

**Layout props:**
- title: `"Jasa Pembuatan Aplikasi Mobile Android & iOS | Mulai Rp 5 Juta - Ekalliptus"`
- description: `"Jasa pembuatan aplikasi mobile Android & iOS dengan React Native dan Flutter. Cross-platform, hemat biaya. Mulai Rp 5 juta untuk MVP. Konsultasi gratis."`
- keywords: `"jasa pembuatan aplikasi mobile, react native developer Indonesia, flutter developer, jasa app android, jasa app iOS, mobile app developer"`

**H1:** `"Jasa Pembuatan Aplikasi Mobile Android & iOS"`

**Lead paragraph:**
> "**Jasa pembuatan aplikasi mobile** adalah layanan pengembangan software untuk perangkat smartphone Android dan iOS. Ekalliptus Digital menyediakan jasa pembuatan aplikasi mobile cross-platform menggunakan **React Native dan Flutter** untuk bisnis di Indonesia, mulai dari **Rp 5 juta untuk MVP** hingga aplikasi enterprise. Cross-platform = satu codebase, dua platform, hemat 40-60% dari native development."

**Pricing cards:**
- MVP: Rp 5jt - 15jt — Splash, login, basic features, 2-4 minggu
- E-Commerce App: Rp 15jt - 50jt — Catalog, cart, payment, shipping, 1-3 bulan
- Enterprise: Rp 50jt+ — Custom features, admin dashboard, integrasi sistem, 4-12 bulan

**Tech stack pills:** `['React Native', 'Flutter', 'Expo', 'Firebase', 'Supabase', 'TypeScript', 'Node.js', 'Redux', 'GraphQL', 'REST API']`

**Process steps:** Same 4 steps (Konsultasi, Design Mockup, Development, Launch & Publish to Stores)

**Related articles:**
- `/blog/biaya-pembuatan-aplikasi-android-ios` — "Biaya Pembuatan Aplikasi Android & iOS di Indonesia"
- `/blog/jasa-pembuatan-website-tegal` — "Jasa Pembuatan Website Tegal: Harga & Portfolio"

- [ ] **Step 2: Build and verify**

Run: `bun run build && curl -s http://localhost:4321/services/mobile-app | grep "Aplikasi Mobile"`
Expected: H1 and content appear.

- [ ] **Step 3: Commit**

```bash
git add src/pages/services/mobile-app.astro
git commit -m "feat(seo): add /services/mobile-app landing page"
```

---

## Task 11: Create `/services/wordpress` page

**Files:**
- Create: `src/pages/services/wordpress.astro`

- [ ] **Step 1: Create using same template structure**

**Layout props:**
- title: `"Jasa WordPress Developer Indonesia | Custom & Maintenance - Ekalliptus"`
- description: `"Jasa WordPress developer Indonesia: custom theme, plugin development, optimasi performa, dan maintenance bulanan. Mulai Rp 2 juta. Garansi 30 hari."`
- keywords: `"jasa wordpress developer, wordpress custom development, jasa wordpress indonesia, maintenance wordpress, optimasi wordpress, woocommerce developer"`

**H1:** `"Jasa WordPress Developer Indonesia"`

**Lead paragraph:**
> "**Jasa WordPress developer** adalah layanan pengembangan website berbasis WordPress yang mencakup pembuatan custom theme, plugin development, optimasi performa, dan maintenance rutin. Ekalliptus Digital menyediakan jasa WordPress developer profesional di Indonesia dengan harga mulai **Rp 2 juta** untuk custom WordPress site, plus paket WooCommerce e-commerce dan maintenance bulanan."

**FAQ:**
```ts
const faqs = [
  { question: 'Apakah lebih baik WordPress custom atau pakai theme premium?', answer: 'Theme premium cocok untuk budget terbatas dan kebutuhan standard. Custom development cocok untuk identitas brand unik, fitur spesifik, dan performa optimal. Kami bantu pilih sesuai kebutuhan.' },
  { question: 'Berapa biaya WordPress custom development?', answer: 'Mulai Rp 2 juta untuk WordPress dengan theme premium customized, Rp 5-15 juta untuk custom theme dari nol, Rp 10-30 juta untuk WooCommerce e-commerce.' },
  { question: 'Apakah include hosting dan domain?', answer: 'Ya, paket sudah include domain .com (1 tahun) dan hosting Indonesia (1 tahun pertama).' },
  { question: 'Bisa migrasi WordPress dari hosting lain?', answer: 'Ya, kami handle migrasi WordPress termasuk database, files, theme, dan plugins tanpa downtime.' },
  { question: 'Apakah include SEO plugin setup?', answer: 'Ya, Yoast SEO atau Rank Math di-setup dengan konfigurasi optimal untuk SEO Indonesia.' },
  { question: 'Apakah ada maintenance bulanan?', answer: 'Ya, paket maintenance WordPress mulai Rp 500rb/bulan: update core, plugin, theme, backup, monitoring keamanan.' }
]
```

**Pricing cards:**
- WordPress Theme: Rp 2jt - 5jt — Theme premium customized, 7-14 hari
- WordPress Custom: Rp 5jt - 15jt — Custom theme dari nol, ACF, 14-30 hari
- WooCommerce: Rp 10jt - 30jt — Toko online lengkap, payment gateway, kurir, 21-45 hari

**Tech stack:** `['WordPress', 'WooCommerce', 'PHP', 'MySQL', 'ACF Pro', 'Elementor', 'Gutenberg', 'Yoast SEO', 'Rank Math', 'WP-Optimize']`

**Schema serviceType:** `'WordPress Development'`
**Schema offers:** `lowPrice: '2000000', highPrice: '30000000'`

**Related articles:**
- `/blog/wordpress-custom-vs-template` — "WordPress Custom vs Template: Mana yang Lebih Baik?"
- `/blog/website-maintenance-rutin` — "5 Tanda Website Anda Butuh Redesign & Maintenance Rutin"

- [ ] **Step 2: Build, verify, commit**

```bash
bun run build && git add src/pages/services/wordpress.astro && git commit -m "feat(seo): add /services/wordpress landing page"
```

---

## Task 12: Create `/services/ui-ux` page

**Files:**
- Create: `src/pages/services/ui-ux.astro`

- [ ] **Step 1: Create using same template**

**Layout props:**
- title: `"Jasa UI/UX Design Indonesia | Figma Designer Profesional - Ekalliptus"`
- description: `"Jasa UI/UX design profesional di Indonesia: wireframe, mockup, prototype, design system. Untuk website & aplikasi mobile. Mulai Rp 1 juta."`
- keywords: `"jasa ui ux design Indonesia, figma designer, jasa desain aplikasi, ui ux freelance, design system, mockup design"`

**H1:** `"Jasa UI/UX Design Indonesia"`

**Lead paragraph:**
> "**Jasa UI/UX design** adalah layanan desain antarmuka pengguna (User Interface) dan pengalaman pengguna (User Experience) untuk aplikasi mobile dan website. Ekalliptus Digital menyediakan jasa UI/UX design profesional dengan **Figma**, dari wireframe hingga design system lengkap, untuk bisnis di Indonesia mulai **Rp 1 juta**."

**FAQ:**
```ts
const faqs = [
  { question: 'Apa bedanya UI dan UX design?', answer: 'UI (User Interface) fokus pada visual design — warna, layout, tipografi. UX (User Experience) fokus pada flow dan kemudahan pengguna mencapai tujuan. Keduanya saling melengkapi untuk hasil optimal.' },
  { question: 'Tools apa yang digunakan?', answer: 'Kami menggunakan Figma sebagai primary tool, plus Adobe XD, Sketch, Maze (testing), dan FigJam (whiteboarding) untuk kebutuhan tertentu.' },
  { question: 'Berapa lama proses UI/UX design?', answer: 'Wireframe 2-3 hari, mockup detail 5-7 hari, design system lengkap 10-14 hari. Tergantung jumlah halaman dan kompleksitas.' },
  { question: 'Apakah hasil design bisa di-handover ke developer?', answer: 'Ya, kami siapkan Figma file dengan auto-layout, components, design tokens, dan spec untuk dev handover yang clean dan maintainable.' },
  { question: 'Apakah include user research?', answer: 'Untuk paket lengkap, ya — termasuk competitor analysis, user persona, dan usability testing. Untuk paket basic, fokus pada visual design.' },
  { question: 'Bisa revisi berapa kali?', answer: '3x revisi gratis di setiap fase (wireframe, mockup, prototype). Revisi tambahan dapat di-arrange dengan biaya yang reasonable.' }
]
```

**Pricing cards:**
- Wireframe Only: Rp 1jt - 2,5jt — 5-10 screens, low-fidelity, 3-5 hari
- UI Mockup: Rp 2,5jt - 7jt — High-fidelity design, prototype, 7-14 hari
- Full UI/UX + Design System: Rp 7jt+ — User research, design tokens, components, 14-30 hari

**Tech stack:** `['Figma', 'Adobe XD', 'Sketch', 'Maze', 'FigJam', 'Principle', 'Lottie', 'Material Design', 'iOS HIG', 'Tailwind UI']`

**Schema serviceType:** `'UI/UX Design'`
**Schema offers:** `lowPrice: '1000000', highPrice: '20000000'`

**Related articles:**
- `/blog/harga-jasa-ui-ux-design-indonesia` — "Harga Jasa UI/UX Design di Indonesia: Panduan Lengkap"
- `/blog/cara-membuat-website-company-profile` — "Cara Membuat Website Company Profile yang Profesional"

- [ ] **Step 2: Build, verify, commit**

```bash
bun run build && git add src/pages/services/ui-ux.astro && git commit -m "feat(seo): add /services/ui-ux landing page"
```

---

## Task 13: Create `/services/multimedia` page

**Files:**
- Create: `src/pages/services/multimedia.astro`

- [ ] **Step 1: Create using same template**

**Layout props:**
- title: `"Jasa Editing Foto & Video Profesional Indonesia | TikTok, Reels - Ekalliptus"`
- description: `"Jasa editing foto produk dan video profesional untuk konten TikTok, Instagram Reels, YouTube. Mulai Rp 50rb per video. Promo 10 video gratis 1."`
- keywords: `"jasa editing video profesional, editing video tiktok, jasa foto produk, editing instagram reels, jasa multimedia editing, content creator"`

**H1:** `"Jasa Editing Foto & Video Profesional"`

**Lead paragraph:**
> "**Jasa editing foto dan video profesional** adalah layanan editing konten multimedia untuk kebutuhan bisnis, social media, dan marketing. Ekalliptus Digital menyediakan jasa editing untuk konten **TikTok, Instagram Reels, YouTube Shorts**, dan foto produk e-commerce, dengan harga mulai **Rp 50rb per video** dan paket promo 10 video gratis 1."

**FAQ:**
```ts
const faqs = [
  { question: 'Berapa biaya editing video TikTok/Reels?', answer: 'Mulai Rp 50rb per video (durasi <60 detik) dengan transisi standar. Paket bulanan 10 video Rp 450rb (gratis 1 video). Custom effect dan motion graphics ada extra fee.' },
  { question: 'Berapa lama proses editing?', answer: 'Single video 1-2 hari kerja, paket bulanan dijadwalkan delivery 2x seminggu, urgent (24 jam) ada surcharge 50%.' },
  { question: 'Format file apa yang disupport?', answer: 'Input: MP4, MOV, AVI, JPG, PNG, RAW. Output: MP4 (1080p/4K), JPG/PNG, sesuai kebutuhan platform.' },
  { question: 'Apakah include music dan SFX?', answer: 'Ya, royalty-free music dari Epidemic Sound dan SFX. Untuk music branded/copyright butuh license terpisah.' },
  { question: 'Bisa request style editing tertentu?', answer: 'Tentu — kami bisa match style dengan referensi yang Anda kasih, atau buat style guide untuk konsistensi konten.' },
  { question: 'Bisa dapat raw file project?', answer: 'Ya, file project Premiere Pro/Final Cut bisa di-handover dengan biaya tambahan untuk klien yang ingin self-edit ke depannya.' }
]
```

**Pricing cards:**
- Single Video: Rp 50rb - 150rb — <60 detik, transisi & musik, 1-2 hari
- Paket Bulanan: Rp 450rb - 1,5jt — 10 video/bulan, gratis 1, motion graphics
- Foto Produk: Rp 25rb - 100rb/foto — Background removal, color correction, retouch

**Tech stack:** `['Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'After Effects', 'Photoshop', 'Lightroom', 'CapCut', 'Epidemic Sound']`

**Schema serviceType:** `'Photo & Video Editing'`
**Schema offers:** `lowPrice: '25000', highPrice: '5000000'`

**Related articles:**
- `/blog/jasa-editing-video-konten-sosial` — "Jasa Editing Video Konten TikTok & Instagram Reels"

- [ ] **Step 2: Build, verify, commit**

```bash
bun run build && git add src/pages/services/multimedia.astro && git commit -m "feat(seo): add /services/multimedia landing page"
```

---

## Task 14: Create `/services/maintenance` page

**Files:**
- Create: `src/pages/services/maintenance.astro`

- [ ] **Step 1: Create using same template**

**Layout props:**
- title: `"Jasa Maintenance Website Bulanan | Update, Backup, Monitoring - Ekalliptus"`
- description: `"Jasa maintenance website bulanan: update, backup berkala, monitoring keamanan, technical support. Mulai Rp 500rb/bulan. Untuk WordPress, custom site, e-commerce."`
- keywords: `"jasa maintenance website, pemeliharaan website bulanan, maintenance wordpress, update website, backup website, monitoring keamanan website"`

**H1:** `"Jasa Maintenance Website Bulanan"`

**Lead paragraph:**
> "**Jasa maintenance website** adalah layanan pemeliharaan rutin yang mencakup update sistem, backup berkala, monitoring keamanan, dan technical support. Ekalliptus Digital menyediakan paket **maintenance bulanan untuk WordPress, custom website, dan e-commerce** mulai dari **Rp 500rb per bulan**, mencegah downtime dan menjaga performa website Anda tetap optimal."

**FAQ:**
```ts
const faqs = [
  { question: 'Apa saja yang dilakukan dalam maintenance website?', answer: 'Update core/plugin/theme, backup mingguan, monitoring keamanan dan uptime, optimasi performa, fix bug minor, technical support via WhatsApp/email.' },
  { question: 'Berapa kali backup dilakukan?', answer: 'Backup harian otomatis (incremental) + backup mingguan full. File backup tersimpan di cloud terpisah dengan retention 30 hari.' },
  { question: 'Apakah include penambahan content?', answer: 'Untuk paket Standard tidak. Paket Premium include penambahan 5 halaman/post baru per bulan.' },
  { question: 'Bagaimana jika website saya hack?', answer: 'Kami handle restore dari backup, identifikasi root cause, patch keamanan, dan re-harden site. Termasuk dalam semua paket tanpa biaya tambahan.' },
  { question: 'Apakah bisa cancel kapan saja?', answer: 'Ya, paket bulanan tanpa kontrak jangka panjang. Cancel anytime dengan notice 7 hari.' },
  { question: 'Maintenance untuk website non-WordPress?', answer: 'Tentu — kami support custom website (Astro, Next.js, Laravel), hosting management, dan database maintenance.' }
]
```

**Pricing cards:**
- Basic: Rp 500rb/bulan — Update, backup mingguan, monitoring uptime, support email
- Standard: Rp 1jt/bulan — Backup harian, security scan, performance optimization, WhatsApp support
- Premium: Rp 2jt/bulan — Semua Standard + content updates 5 halaman/bulan, priority response

**Tech stack:** `['UpdraftPlus', 'Wordfence', 'Sucuri', 'Cloudflare', 'UptimeRobot', 'GTmetrix', 'Google Search Console', 'New Relic']`

**Schema serviceType:** `'Website Maintenance'`
**Schema offers:** `lowPrice: '500000', highPrice: '2000000'`

**Related articles:**
- `/blog/website-maintenance-rutin` — "5 Tanda Website Anda Butuh Redesign & Maintenance Rutin"
- `/blog/wordpress-custom-vs-template` — "WordPress Custom vs Template: Mana yang Lebih Baik?"

- [ ] **Step 2: Build, verify, commit**

```bash
bun run build && git add src/pages/services/maintenance.astro && git commit -m "feat(seo): add /services/maintenance landing page"
```

---

# Phase 5: About Page

## Task 15: Create `/about` page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create the file**

```astro
---
import Layout from '../layouts/Layout.astro'
import Navigation from '../components/Navigation.astro'
import VantaBackground from '../components/VantaBackground.astro'
import PreLoader from '../components/PreLoader.astro'
import JsonLd from '../components/JsonLd.astro'
import { t, getLocaleFromRequest, getDir } from '../i18n'
import { ArrowRight, Award, Users, Clock, Heart } from 'lucide-astro'

const locale = getLocaleFromRequest(Astro.request)
const dir = getDir(locale)

const siteUrl = 'https://ekalliptus.com'
const canonical = new URL(Astro.url.pathname, siteUrl).toString()

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: canonical,
  name: 'Tentang Ekalliptus Digital',
  description: 'Cerita dan profil Ekalliptus Digital — digital agency Indonesia yang berbasis di Tegal, Jawa Tengah.',
  mainEntity: { '@id': `${siteUrl}#organization` }
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Tentang', item: canonical }
  ]
}
---

<Layout
  title="Tentang Ekalliptus Digital | Digital Agency Indonesia Berbasis Tegal"
  description="Profil Ekalliptus Digital — digital agency Indonesia spesialis web, mobile app, WordPress, UI/UX. Berbasis di Tegal, Jawa Tengah, melayani klien seluruh Indonesia."
  lang={locale}
  dir={dir}
  keywords="tentang ekalliptus, profil digital agency Indonesia, agency Tegal, web developer Tegal"
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(aboutSchema)} />
    <script type="application/ld+json" set:html={JSON.stringify(breadcrumbSchema)} />
  </Fragment>

  <JsonLd locale={locale} page="home" />
  <VantaBackground />
  <PreLoader />
  <Navigation t={(key: string) => t(key, locale)} currentLang={locale} />

  <main class="relative z-0 flex min-h-screen flex-col pt-14 sm:pt-16 md:pt-20">
    <div class="container mx-auto max-w-5xl px-4 py-8 sm:py-12">

      <nav class="text-sm mb-6" aria-label="Breadcrumb">
        <a href="/" class="text-muted-foreground hover:text-foreground">Home</a>
        <span class="mx-2 text-muted-foreground">/</span>
        <span class="text-foreground">Tentang</span>
      </nav>

      <header class="text-center mb-12">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Tentang Ekalliptus Digital</h1>
        <p class="article-intro text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          <strong>Ekalliptus Digital</strong> adalah digital agency Indonesia yang berbasis di <strong>Tegal, Jawa Tengah</strong>, didirikan pada tahun 2023. Kami spesialis dalam pembuatan website, aplikasi mobile, WordPress development, UI/UX design, dan multimedia editing untuk bisnis di seluruh Indonesia.
        </p>
      </header>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Misi Kami</h2>
        <div class="glass-panel rounded-2xl p-6 sm:p-8 bg-card/10 border border-border/20">
          <p class="text-muted-foreground leading-relaxed text-base sm:text-lg">
            Membantu UMKM dan bisnis Indonesia bertransformasi digital dengan teknologi modern yang <strong>terjangkau, berkualitas, dan reliable</strong>. Kami percaya setiap bisnis — besar atau kecil — pantas memiliki kehadiran digital profesional tanpa harus membayar harga selangit.
          </p>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Apa yang Membedakan Kami</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20">
            <div class="rounded-full bg-primary/10 p-3 w-fit mb-3"><Award class="h-5 w-5 text-primary" /></div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Tim Lokal Tegal</h3>
            <p class="text-sm text-muted-foreground">Berbasis di Tegal — bisa meeting offline, memahami pasar lokal, support cepat dalam Bahasa Indonesia.</p>
          </div>
          <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20">
            <div class="rounded-full bg-primary/10 p-3 w-fit mb-3"><Users class="h-5 w-5 text-primary" /></div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Layanan Nasional</h3>
            <p class="text-sm text-muted-foreground">Klien dari Aceh sampai Papua. Komunikasi via WhatsApp, Zoom, Google Meet — kerja remote tanpa kompromi kualitas.</p>
          </div>
          <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20">
            <div class="rounded-full bg-primary/10 p-3 w-fit mb-3"><Clock class="h-5 w-5 text-primary" /></div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Garansi 30 Hari</h3>
            <p class="text-sm text-muted-foreground">Setiap project dilengkapi garansi 30 hari untuk bug fixing dan free maintenance 3 bulan pertama.</p>
          </div>
          <div class="glass-panel rounded-2xl p-5 bg-card/10 border border-border/20">
            <div class="rounded-full bg-primary/10 p-3 w-fit mb-3"><Heart class="h-5 w-5 text-primary" /></div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Harga Transparan</h3>
            <p class="text-sm text-muted-foreground">Tidak ada biaya tersembunyi. Semua scope, timeline, dan deliverable di-blackitam-putih sejak awal.</p>
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Keahlian Kami</h2>
        <div class="glass-panel rounded-2xl p-6 bg-card/10 border border-border/20">
          <p class="text-muted-foreground mb-4">Stack teknologi yang kami kuasai dan gunakan:</p>
          <div class="flex flex-wrap gap-2">
            {['Astro', 'Next.js', 'React', 'Vue.js', 'React Native', 'Flutter', 'TypeScript', 'Node.js', 'PHP Laravel', 'WordPress', 'WooCommerce', 'Tailwind CSS', 'Figma', 'Supabase', 'PostgreSQL', 'MySQL', 'Cloudflare Workers', 'Vercel', 'Adobe Premiere', 'After Effects'].map(tech => (
              <span class="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">Hubungi Kami</h2>
        <div class="glass-panel rounded-2xl p-6 bg-card/10 border border-border/20">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-foreground mb-3">Alamat</h3>
              <p class="text-sm text-muted-foreground">
                Ekalliptus Digital<br />
                Tegal, Jawa Tengah 52100<br />
                Indonesia
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-3">Kontak</h3>
              <ul class="space-y-1 text-sm text-muted-foreground">
                <li><strong>Email:</strong> <a href="mailto:ekalliptus@gmail.com" class="text-primary hover:underline">ekalliptus@gmail.com</a></li>
                <li><strong>WhatsApp:</strong> <a href="https://wa.me/6281999900306" class="text-primary hover:underline">+62 819-9990-0306</a></li>
                <li><strong>Jam Kerja:</strong> Senin-Jumat 09:00-17:00 WIB</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="text-center">
        <a href="/order" class="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          Mulai Project Anda <ArrowRight class="h-4 w-4" />
        </a>
      </section>

    </div>
  </main>
</Layout>
```

- [ ] **Step 2: Build, verify**

Run: `bun run build && curl -s http://localhost:4321/about | grep "Tentang Ekalliptus"`
Expected: H1 appears.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(seo): add /about page with Organization schema (E-E-A-T signals)"
```

---

# Phase 6: Blog Content Expansion

## Task 16: Add updateDate to existing 5 blog posts

**Files:**
- Modify: 5 markdown files in `src/content/blog/`

- [ ] **Step 1: Update each existing blog post frontmatter**

For each of these files:
- `src/content/blog/jasa-pembuatan-website-tegal.md`
- `src/content/blog/biaya-pembuatan-aplikasi-android-ios.md`
- `src/content/blog/wordpress-custom-vs-template.md`
- `src/content/blog/jasa-editing-video-konten-sosial.md`
- `src/content/blog/website-maintenance-rutin.md`

Add this line to frontmatter (right after `publishDate:`):

```yaml
updateDate: 2026-05-04
```

- [ ] **Step 2: Run blog migration to sync to Supabase**

Run: `bun run migrate:blog`
Expected: All blog posts updated in Supabase with new `update_date`.

- [ ] **Step 3: Commit**

```bash
git add src/content/blog/*.md
git commit -m "feat(seo): add updateDate to existing blog posts (freshness signal)"
```

---

## Task 17: Create blog article — `jasa-web-developer-freelance-indonesia.md`

**Files:**
- Create: `src/content/blog/jasa-web-developer-freelance-indonesia.md`

- [ ] **Step 1: Create the article**

```markdown
---
title: 'Jasa Web Developer Freelance vs Agency: Mana yang Tepat untuk Bisnis Anda?'
description: 'Perbandingan lengkap antara jasa web developer freelance dan digital agency. Pilih yang sesuai budget, kompleksitas project, dan kebutuhan bisnis Anda.'
publishDate: 2026-05-04
updateDate: 2026-05-04
category: 'Web Development'
tags: ['web developer', 'freelance', 'digital agency', 'jasa website', 'bisnis']
author: 'Tim Ekalliptus'
locale: 'id'
featured: false
image: '/blog/web-developer-freelance.svg'
imageAlt: 'Jasa Web Developer Freelance vs Agency Indonesia'
seo:
  metaTitle: 'Jasa Web Developer Freelance vs Agency | Panduan Memilih 2026'
  metaDescription: 'Perbandingan freelance web developer vs agency: budget, kualitas, timeline. Tips memilih yang tepat untuk bisnis Anda. Konsultasi gratis di Ekalliptus.'
---

## Web Developer Freelance vs Digital Agency: Dilema Klasik

Saat memutuskan untuk membuat website, pertanyaan pertama yang muncul biasanya: "Pakai web developer freelance atau pakai jasa agency?" Keduanya punya kelebihan dan kekurangan masing-masing yang sangat dipengaruhi oleh kebutuhan project, budget, dan ekspektasi Anda.

Artikel ini akan membahas tuntas perbandingan **jasa web developer freelance** dan **digital agency** di Indonesia, lengkap dengan tips memilih yang sesuai dengan kebutuhan bisnis Anda.

---

## Apa Itu Web Developer Freelance?

Web developer freelance adalah individu yang menawarkan jasa pengembangan website secara independen, biasanya bekerja remote dan menangani satu project end-to-end sendirian.

### Kelebihan Freelance

- **Harga lebih terjangkau** — overhead lebih rendah, harga 30-50% lebih murah dari agency
- **Komunikasi langsung** — tidak ada layer manajer atau account executive
- **Fleksibel** — bisa diajak diskusi tengah malam atau weekend
- **Personal touch** — satu orang yang handle, kontinuitas pemahaman project terjaga

### Kekurangan Freelance

- **Bandwidth terbatas** — hanya bisa handle 1-2 project paralel
- **Skill scope terbatas** — biasanya jago di 1-2 area (frontend ATAU backend)
- **Risiko menghilang** — jika sakit, sibuk, atau ada masalah personal, project bisa macet
- **Tidak ada backup** — kalau dia tidak available, tidak ada yang bisa replace

---

## Apa Itu Digital Agency?

Digital agency adalah tim profesional dengan struktur organisasi: project manager, designer, developer, QA tester, dll. Setiap project dikerjakan kolaboratif oleh beberapa orang.

### Kelebihan Agency

- **Tim multi-disiplin** — designer, developer, QA, copywriter dalam satu atap
- **Process terstruktur** — ada SOP, milestone, dan dokumentasi yang clear
- **Kapasitas besar** — bisa handle multiple project paralel atau project besar
- **Backup tim** — kalau satu orang sakit, ada yang ambil alih
- **Garansi & support** — biasanya ada SLA dan after-sales support yang formal

### Kekurangan Agency

- **Harga lebih mahal** — overhead operasional lebih tinggi (kantor, gaji tim, tools)
- **Komunikasi lewat layer** — dari klien → AE → PM → developer
- **Less flexible** — proses revisi formal, perlu raise tiket
- **Minimum project size** — banyak agency tidak ambil project di bawah harga tertentu

---

## Perbandingan Detail: Freelance vs Agency

| Aspek | Freelance | Agency |
|-------|-----------|--------|
| **Harga rata-rata** | Rp 1-15 juta | Rp 5-100+ juta |
| **Timeline** | Sering molor | Lebih terkontrol |
| **Komunikasi** | Langsung | Via PM/AE |
| **Skill range** | Spesialis | Generalis (tim) |
| **Cocok untuk** | Project kecil-menengah | Project besar/kompleks |
| **Risiko** | Lebih tinggi | Lebih rendah |
| **Garansi** | Informal | Formal SLA |

---

## Kapan Sebaiknya Pakai Freelance?

Pilih web developer freelance jika:

1. **Budget terbatas** (di bawah Rp 5 juta)
2. **Project sederhana** — landing page, company profile basic
3. **Timeline fleksibel** — tidak ada deadline ketat
4. **Sudah punya designer atau copywriter sendiri**
5. **Bisa terlibat aktif dalam project management**

---

## Kapan Sebaiknya Pakai Agency?

Pilih digital agency jika:

1. **Project kompleks** — e-commerce, web app dengan banyak fitur
2. **Butuh tim lengkap** — design, dev, QA, copywriting
3. **Deadline ketat** — perlu kapasitas dan reliability
4. **Tidak punya internal team** — butuh end-to-end service
5. **Maintenance jangka panjang** — butuh support yang konsisten

---

## Tips Memilih Web Developer atau Agency yang Tepat

### 1. Cek Portfolio dengan Teliti
Bukan cuma lihat screenshot — coba akses websitenya, cek performa, struktur kode (jika bisa).

### 2. Minta Referensi Klien
Tanyakan ke klien lama mereka: kepuasan, ketepatan deadline, after-sales support.

### 3. Pastikan Ada Kontrak Formal
Apa pun pilihannya, **selalu ada kontrak tertulis** — scope, timeline, milestone, payment, garansi.

### 4. Cek Stack Teknologi
Pastikan technology yang digunakan masih actively maintained (jangan pakai jQuery/AngularJS legacy untuk project baru).

### 5. Diskusi Maintenance & Handover
Tanya bagaimana setelah project selesai — siapa yang maintain? Apakah source code di-handover?

---

## Hybrid Approach: Freelance + Agency

Beberapa bisnis pilih hybrid model:
- **Pakai agency** untuk core development & launch
- **Pakai freelance** untuk maintenance & feature updates

Pendekatan ini menggabungkan reliability agency dengan fleksibilitas freelance.

---

## Pengalaman Ekalliptus Digital

Sebagai **digital agency yang dimulai dari freelance**, kami memahami kebutuhan klien dari kedua sisi. Kami menawarkan:

- **Harga sekompetitif freelance** — tim kecil, overhead minimal
- **Reliability seperti agency** — SOP, garansi, backup tim
- **Komunikasi langsung** — tidak ada layer berlapis

Untuk panduan lebih lengkap tentang layanan kami, lihat [jasa pembuatan website profesional](/services/website) atau baca [panduan harga website Tegal](/blog/jasa-pembuatan-website-tegal).

---

## Kesimpulan

Pilihan antara **web developer freelance vs digital agency** tergantung pada:

1. **Ukuran project** — kecil → freelance, besar → agency
2. **Budget** — terbatas → freelance, fleksibel → agency
3. **Risk tolerance** — tinggi → freelance, rendah → agency
4. **Timeline** — fleksibel → freelance, ketat → agency

Tidak ada jawaban benar atau salah — yang ada hanyalah **pilihan yang paling cocok** dengan kebutuhan dan situasi Anda.

---

## Konsultasi Gratis

Bingung pilih yang mana? Konsultasikan kebutuhan website Anda dengan tim Ekalliptus secara GRATIS:

- **WhatsApp:** [+62 819-9990-0306](https://wa.me/6281999900306)
- **Email:** ekalliptus@gmail.com
- **Order langsung:** [Klik di sini](/order)

Kami akan analisis kebutuhan Anda dan rekomendasikan solusi terbaik — tanpa kewajiban.
```

- [ ] **Step 2: Run migration**

Run: `bun run migrate:blog`

- [ ] **Step 3: Commit**

```bash
git add src/content/blog/jasa-web-developer-freelance-indonesia.md
git commit -m "feat(blog): add 'web developer freelance vs agency' article"
```

---

## Task 18: Create blog article — `cara-membuat-website-company-profile.md`

**Files:**
- Create: `src/content/blog/cara-membuat-website-company-profile.md`

- [ ] **Step 1: Create the article**

```markdown
---
title: 'Cara Membuat Website Company Profile yang Profesional (Panduan 2026)'
description: 'Panduan lengkap cara membuat website company profile yang profesional, SEO-friendly, dan berkonversi tinggi untuk bisnis Anda di tahun 2026.'
publishDate: 2026-05-04
updateDate: 2026-05-04
category: 'Tips & Tutorial'
tags: ['company profile', 'website bisnis', 'tutorial website', 'web development', 'umkm']
author: 'Tim Ekalliptus'
locale: 'id'
featured: false
image: '/blog/cara-membuat-website-company-profile.svg'
imageAlt: 'Cara Membuat Website Company Profile Profesional'
seo:
  metaTitle: 'Cara Membuat Website Company Profile Profesional 2026 | Panduan Lengkap'
  metaDescription: 'Tutorial lengkap cara membuat website company profile profesional. Mulai dari planning, design, development sampai launch. Panduan step-by-step 2026.'
---

## Apa Itu Website Company Profile?

**Website company profile** adalah situs web resmi yang merepresentasikan identitas, profil, dan layanan sebuah perusahaan secara digital. Berbeda dengan landing page (fokus konversi tunggal) atau e-commerce (fokus penjualan online), company profile berfungsi sebagai **etalase digital 24/7** yang membangun kredibilitas dan kepercayaan.

Di tahun 2026, memiliki website company profile profesional bukan lagi pilihan — ini adalah **standard minimum** untuk bisnis yang serius berkembang.

---

## Komponen Wajib Website Company Profile

Berdasarkan best practice yang teruji, sebuah website company profile profesional minimal harus memiliki:

### 1. Halaman Beranda (Home)
- Hero section dengan value proposition
- CTA (Call to Action) jelas
- Highlight layanan/produk utama
- Social proof (testimoni/logo klien)

### 2. Halaman Tentang Kami (About)
- Cerita perusahaan (founding story)
- Misi dan visi
- Tim utama
- Pencapaian/milestone

### 3. Halaman Layanan (Services)
- Detail tiap layanan
- Pricing (jika applicable)
- Proses kerja
- FAQ

### 4. Halaman Portfolio
- Showcase project terbaik
- Case study singkat
- Hasil yang dicapai

### 5. Halaman Kontak
- Form kontak
- Alamat fisik (untuk SEO lokal)
- Telepon/WhatsApp
- Google Maps embed

### 6. Halaman Blog (Optional tapi Recommended)
- Artikel insight & tips
- Boost SEO secara signifikan

---

## Langkah-Langkah Membuat Website Company Profile

### Langkah 1: Planning & Riset (1-2 minggu)

**Yang perlu disiapkan:**
- Tujuan website (lead generation? brand building? online catalog?)
- Target audience persona
- Kompetitor analysis (3-5 kompetitor)
- Sitemap dan struktur navigasi
- Wireframe halaman utama

**Tips:** Buat dokumen "Website Brief" yang berisi semua keputusan di atas. Ini akan jadi bible selama project.

### Langkah 2: Pilih Platform/Stack

Tiga opsi populer:

| Platform | Cocok untuk | Estimasi Biaya |
|----------|-------------|----------------|
| **WordPress** | UMKM, butuh self-edit | Rp 2-5 juta |
| **Custom Development** | Brand premium, butuh performa max | Rp 5-15 juta |
| **No-code (Webflow/Framer)** | Designer-led, simple site | Rp 3-10 juta |

Untuk panduan lebih detail, baca [WordPress custom vs template](/blog/wordpress-custom-vs-template).

### Langkah 3: Design & Mockup (1-2 minggu)

- Buat design system (warna, tipografi, spacing)
- Wireframe semua halaman utama
- High-fidelity mockup di Figma
- Review & revisi (3 ronde maksimal)

**Tips:** Mobile-first design — 70%+ traffic dari mobile.

### Langkah 4: Development (2-4 minggu)

- Setup hosting & domain
- Implementasi front-end (HTML/CSS/JS)
- Integrasi CMS (jika WordPress)
- Form integration
- Speed optimization

### Langkah 5: Content Population

- Copywriting profesional (penting!)
- Foto produk/team yang berkualitas
- Optimize untuk SEO (heading, meta, alt text)

### Langkah 6: Testing

Cek minimal:
- Cross-browser (Chrome, Safari, Firefox, Edge)
- Cross-device (iPhone, Android, tablet, desktop)
- Speed test (PageSpeed Insights, GTmetrix)
- Form submission
- Broken links

### Langkah 7: Launch & Submit

- Deploy ke production
- Setup Google Analytics + Search Console
- Submit sitemap ke Google
- Setup Google Business Profile (untuk SEO lokal)

---

## Faktor Kunci Website Company Profile yang Berkualitas

### 1. Loading Speed di Bawah 3 Detik
Google penalti website lambat. Target: First Contentful Paint < 1.8s, Largest Contentful Paint < 2.5s.

### 2. Mobile-Responsive Sempurna
Bukan cuma "muat di mobile" — tapi user experience yang setara dengan desktop.

### 3. SEO On-Page Solid
- Meta title & description tiap halaman
- Heading hierarchy yang benar (H1 → H2 → H3)
- Schema markup (Organization, LocalBusiness)
- Internal linking yang strategis

Untuk panduan SEO lebih dalam, baca [10 tips optimasi website SEO untuk UMKM](/blog/tips-optimasi-website-seo-untuk-umkm).

### 4. Security Built-in
- SSL certificate (HTTPS)
- Security headers (CSP, X-Frame-Options)
- Backup berkala
- Update reguler

### 5. Konten yang Berbicara
- Copywriting yang clear, benefit-focused
- Storytelling, bukan list spec
- CTA yang spesifik

---

## Berapa Biaya Membuat Website Company Profile?

| Tier | Biaya | Cocok untuk |
|------|-------|-------------|
| **Basic** | Rp 1,5 - 3 juta | UMKM, profesional individu |
| **Standard** | Rp 3 - 7 juta | Bisnis menengah, perlu CMS |
| **Premium** | Rp 7 - 15 juta | Brand premium, custom design |
| **Enterprise** | Rp 15 juta+ | Multi-bahasa, integrasi sistem |

Untuk pricing detail di Tegal dan Indonesia, lihat [jasa pembuatan website Tegal](/blog/jasa-pembuatan-website-tegal).

---

## Kesalahan Umum yang Harus Dihindari

1. **Pakai template terlalu generik** — kelihatan murahan
2. **Konten copy-paste dari kompetitor** — penalti SEO + tidak unik
3. **Lupa mobile optimization** — kehilangan 70% audience
4. **Lupa setup Analytics** — tidak ada data untuk improve
5. **Skip security** — risiko hack tinggi
6. **Lupa maintenance** — website akan deteriorate

Lihat [tanda website butuh redesign & maintenance](/blog/website-maintenance-rutin) untuk indikator kapan website Anda butuh refresh.

---

## Self-Made vs Pakai Jasa: Mana Lebih Worth It?

**Self-made** (pakai Wix, WordPress sendiri):
- ✅ Murah (Rp 500rb - 1jt setahun)
- ❌ Time investment besar
- ❌ Hasil mungkin amatir
- ❌ Skill SEO/design terbatas

**Pakai jasa profesional:**
- ❌ Investasi awal lebih besar
- ✅ Fokus ke bisnis, bukan teknis
- ✅ Hasil profesional
- ✅ Maintenance & support

ROI biasanya berpihak ke pakai jasa profesional jika website ini akan jadi key asset bisnis.

---

## Konsultasi Gratis Pembuatan Website Company Profile

Siap memulai? Tim Ekalliptus Digital siap membantu Anda:

- **Konsultasi gratis** — diskusi kebutuhan tanpa kewajiban
- **Design custom** — bukan template generik
- **Garansi 30 hari** + maintenance 3 bulan
- **Harga transparan** — mulai Rp 1,5 juta

**Hubungi kami:**
- WhatsApp: [+62 819-9990-0306](https://wa.me/6281999900306)
- Email: ekalliptus@gmail.com
- [Order online](/order)

---

*Dipublikasikan oleh Tim Ekalliptus Digital — 4 Mei 2026*
```

- [ ] **Step 2: Run migration**

Run: `bun run migrate:blog`

- [ ] **Step 3: Commit**

```bash
git add src/content/blog/cara-membuat-website-company-profile.md
git commit -m "feat(blog): add 'cara membuat website company profile' article"
```

---

## Task 19: Create blog article — `harga-jasa-ui-ux-design-indonesia.md`

**Files:**
- Create: `src/content/blog/harga-jasa-ui-ux-design-indonesia.md`

- [ ] **Step 1: Create the article**

```markdown
---
title: 'Harga Jasa UI/UX Design di Indonesia: Panduan Lengkap 2026'
description: 'Berapa harga jasa UI/UX design di Indonesia? Panduan lengkap pricing wireframe, mockup, prototype, dan design system. Bonus: tips memilih designer yang tepat.'
publishDate: 2026-05-04
updateDate: 2026-05-04
category: 'Tips & Tutorial'
tags: ['ui ux design', 'harga jasa design', 'figma', 'design system', 'biaya design']
author: 'Tim Ekalliptus'
locale: 'id'
featured: false
image: '/blog/harga-jasa-ui-ux.svg'
imageAlt: 'Harga Jasa UI/UX Design di Indonesia 2026'
seo:
  metaTitle: 'Harga Jasa UI/UX Design Indonesia 2026 | Mulai Rp 1 Juta'
  metaDescription: 'Panduan lengkap harga jasa UI/UX design di Indonesia 2026. Detail pricing per fase: wireframe, mockup, prototype, design system. Konsultasi gratis.'
---

## Berapa Sebenarnya Harga Jasa UI/UX Design di Indonesia?

Pertanyaan ini paling sering ditanyakan oleh business owner dan startup founder. Jawabannya **bervariasi luas** — mulai Rp 500 ribu untuk wireframe sederhana hingga ratusan juta untuk design system enterprise.

Artikel ini akan membahas detail breakdown harga jasa UI/UX design di Indonesia tahun 2026, plus tips memilih designer yang tepat sesuai budget dan kebutuhan Anda.

---

## Faktor yang Mempengaruhi Harga UI/UX Design

### 1. Scope Pekerjaan

| Scope | Estimasi Harga |
|-------|----------------|
| Wireframe only (low-fidelity) | Rp 500rb - 2,5 juta |
| Mockup UI (high-fidelity) | Rp 2,5 juta - 7 juta |
| Mockup + Prototype interaktif | Rp 5 juta - 12 juta |
| Full UI/UX + Design System | Rp 10 juta - 30 juta |
| Design system enterprise | Rp 30 juta+ |

### 2. Jumlah Halaman/Screen

Pricing biasanya per-screen atau per-flow:

| Jumlah Screen | Estimasi |
|---------------|----------|
| 1-5 screens (landing/simple app) | Rp 500rb - 2 juta |
| 5-15 screens (app standard) | Rp 2 - 7 juta |
| 15-30 screens (complex app) | Rp 7 - 15 juta |
| 30+ screens (enterprise) | Rp 15 juta+ |

### 3. Tipe Designer

| Tipe | Range Harga | Karakteristik |
|------|-------------|---------------|
| **Junior Freelance** | Rp 500rb - 2 juta | <2 tahun pengalaman |
| **Mid-level Freelance** | Rp 2 - 7 juta | 2-5 tahun, portfolio solid |
| **Senior Freelance** | Rp 7 - 20 juta | 5+ tahun, ekspertise spesifik |
| **Agency Junior** | Rp 5 - 15 juta | Tim dengan QA |
| **Agency Senior** | Rp 15 - 50+ juta | Strategy + design |

### 4. Industri Project

Industri tertentu butuh design lebih spesialized → harga lebih mahal:

- **Healthcare/Medical:** +20-30% (compliance, accessibility)
- **Finance/Fintech:** +30-50% (security UX, regulatory)
- **E-commerce kompleks:** +20% (conversion optimization)
- **B2B SaaS:** +15-25% (complex flows)

---

## Breakdown Harga per Fase Design

### Fase 1: Discovery & Research (Rp 1 - 5 juta)
- Stakeholder interview
- Competitor analysis
- User persona development
- User journey mapping

### Fase 2: Information Architecture (Rp 500rb - 3 juta)
- Sitemap
- User flow diagrams
- Wireframe rendah-fidelity

### Fase 3: UI Design (Rp 2 - 15 juta)
- Mood board & style exploration
- High-fidelity mockup
- Component library
- 3 ronde revisi

### Fase 4: Prototyping (Rp 1 - 5 juta)
- Interactive prototype di Figma
- Micro-interactions
- Animation references

### Fase 5: Design System (Rp 3 - 20 juta)
- Design tokens
- Component library lengkap
- Dokumentasi design
- Dev handoff specs

### Fase 6: Usability Testing (Rp 2 - 10 juta)
- Test plan
- 5-10 user testing
- Iteration berdasarkan feedback

---

## Pricing Model: Fixed vs Hourly vs Retainer

### Fixed Price
- **Cocok untuk:** project dengan scope clear
- **Range:** Rp 1 - 50 juta tergantung scope
- **Pro:** budget predictable
- **Contra:** scope harus rigid

### Hourly Rate
- **Junior:** Rp 100rb - 250rb/jam
- **Mid-level:** Rp 250rb - 500rb/jam
- **Senior:** Rp 500rb - 1,5 juta/jam
- **Cocok untuk:** project agile, scope berubah

### Monthly Retainer
- **Range:** Rp 5 - 25 juta/bulan
- **Cocok untuk:** ongoing design work, team sebagai partner

---

## Tips Memilih Designer UI/UX yang Tepat

### 1. Lihat Portfolio, Bukan Cuma Dribbble Shot
Dribbble shows pretty visuals — minta lihat **case study** lengkap: problem, process, solution, results.

### 2. Cek Skill Beyond Visual
- UX research methodology
- Design system thinking
- Dev handoff fluency
- A/B testing & data-driven design

### 3. Communication Match Penting
Pastikan designer bisa **explain decision** dengan reasoning, bukan cuma "ini bagus aja".

### 4. Tools yang Digunakan
Default modern: **Figma**. Hati-hati designer yang masih utama Sketch atau Adobe XD (legacy).

### 5. Tanya Tentang Process
Designer profesional punya process clear: discovery → wireframe → mockup → prototype → handoff.

### 6. Cek Reference Klien
Bukan testimoni di website mereka — minta kontak klien lama untuk validasi.

---

## Hidden Costs yang Sering Terlewat

Hati-hati biaya tambahan yang tidak ter-budget:

1. **Stock photo/illustrations** — Rp 100rb - 1 juta
2. **Custom icon set** — Rp 500rb - 3 juta
3. **Mascot/illustration custom** — Rp 1 - 10 juta
4. **Animation/Lottie** — Rp 500rb - 5 juta
5. **Revisi tambahan** — biasanya per ronde Rp 500rb - 2 juta
6. **Source file handover** — kadang ada extra fee

**Tips:** Pastikan semua ini di-clarify di kontrak.

---

## Worth It atau Tidak Investasi UI/UX Design?

ROI UI/UX yang baik biasanya datang dari:

- **Conversion rate naik 20-50%** dari website yang well-designed
- **User retention naik 30%+** dari app dengan UX yang baik
- **Reduced development time** — design jelas = developer tidak rework
- **Brand perception** — design baik = brand premium

Forrester Research: **setiap $1 investasi UX returns $100** (ROI 9,900%).

---

## Pricing Ekalliptus Digital

Untuk transparansi, berikut pricing kami:

| Paket | Harga | Include |
|-------|-------|---------|
| **Wireframe Only** | Rp 1 - 2,5 juta | 5-10 screens, low-fidelity |
| **UI Mockup** | Rp 2,5 - 7 juta | High-fidelity, prototype |
| **Full UI/UX + Design System** | Rp 7 juta+ | Research, design tokens, components |

Lihat [layanan UI/UX design](/services/ui-ux) untuk detail lengkap, atau baca [panduan cara membuat website company profile](/blog/cara-membuat-website-company-profile) untuk konteks design dalam project website.

---

## Konsultasi Gratis

Bingung dengan budget UI/UX yang tepat untuk project Anda? Konsultasikan gratis:

- **WhatsApp:** [+62 819-9990-0306](https://wa.me/6281999900306)
- **Email:** ekalliptus@gmail.com
- [Order online](/order)

Kami berikan **estimasi harga akurat** berdasarkan kebutuhan spesifik project Anda — tanpa kewajiban.

---

*Dipublikasikan oleh Tim Ekalliptus Digital — 4 Mei 2026*
```

- [ ] **Step 2: Run migration & commit**

```bash
bun run migrate:blog
git add src/content/blog/harga-jasa-ui-ux-design-indonesia.md
git commit -m "feat(blog): add 'harga jasa UI/UX design Indonesia' article"
```

---

## Task 20: Create blog article — `tips-optimasi-website-seo-untuk-umkm.md`

**Files:**
- Create: `src/content/blog/tips-optimasi-website-seo-untuk-umkm.md`

- [ ] **Step 1: Create the article**

```markdown
---
title: '10 Tips Optimasi Website SEO untuk UMKM Indonesia'
description: 'Panduan praktis 10 tips optimasi website SEO untuk UMKM Indonesia. Boost ranking Google, dapat lebih banyak customer organik tanpa biaya iklan.'
publishDate: 2026-05-04
updateDate: 2026-05-04
category: 'Tips & Tutorial'
tags: ['seo', 'umkm', 'optimasi website', 'google ranking', 'digital marketing']
author: 'Tim Ekalliptus'
locale: 'id'
featured: false
image: '/blog/tips-seo-umkm.svg'
imageAlt: 'Tips Optimasi Website SEO untuk UMKM Indonesia'
seo:
  metaTitle: '10 Tips Optimasi Website SEO untuk UMKM Indonesia 2026 | Gratis'
  metaDescription: '10 tips praktis optimasi website SEO untuk UMKM Indonesia: keyword, meta tags, schema, mobile-friendly, dan local SEO. Tanpa biaya iklan.'
---

## Mengapa SEO Penting untuk UMKM?

Bagi UMKM Indonesia, **SEO (Search Engine Optimization)** adalah salah satu strategi marketing paling cost-effective. Berbeda dengan iklan berbayar yang berhenti saat budget habis, SEO memberikan **traffic organik berkelanjutan** selama website terus dioptimasi.

Faktanya: **75% pengguna tidak pernah scroll ke halaman 2 Google**. Jika website UMKM Anda tidak ada di halaman 1 untuk keyword penting, bisnis Anda invisible bagi calon customer yang sedang cari produk/jasa Anda.

Artikel ini berisi **10 tips praktis** yang bisa langsung Anda implementasikan untuk meningkatkan ranking website UMKM Anda di Google.

---

## Tip 1: Riset Keyword yang Relevan

**Apa yang harus dilakukan:**
- Gunakan tools gratis: Google Keyword Planner, Ubersuggest, AnswerThePublic
- Cari keyword dengan intent komersial (search volume tinggi, competition rendah)
- Fokus ke **long-tail keywords**: "jasa pembuatan website tegal" lebih winnable dari "jasa website"

**Contoh untuk UMKM lokal:**
- "[Layanan Anda] [Kota Anda]" — misal: "katering pernikahan Tegal"
- "[Produk Anda] terdekat" — misal: "toko sepatu terdekat Tegal"
- "[Pertanyaan customer]" — misal: "berapa harga jasa cuci AC"

---

## Tip 2: Optimasi Title & Meta Description

Setiap halaman butuh:

**Title Tag (50-60 karakter):**
```
Jasa Cuci AC Tegal | Service Cepat - Mulai Rp 50rb
```

**Meta Description (150-160 karakter):**
```
Jasa cuci AC Tegal profesional, panggilan cepat 30 menit. Mulai Rp 50rb. 
Service AC split, cassette, central. Hubungi 0819-9990-0306.
```

**Tips:** Sertakan keyword di awal, value proposition jelas, dan CTA.

---

## Tip 3: Struktur Heading yang Benar

Hierarki heading membantu Google paham konten:

```
H1: Topik utama halaman (1x per halaman)
└── H2: Sub-topik
    └── H3: Detail sub-topik
        └── H4: Detail lebih dalam
```

**Hindari:**
- Lebih dari 1 H1 per halaman
- Skip dari H1 langsung ke H4
- Heading yang kosong/tidak deskriptif

---

## Tip 4: Optimasi Gambar

Gambar yang ter-optimize:
1. **Ukuran file kecil** — kompres ke WebP/JPG <100KB
2. **Alt text deskriptif** — `alt="jasa cuci AC tegal teknisi sedang membersihkan unit"` bukan `alt="image1"`
3. **Filename SEO-friendly** — `cuci-ac-tegal.jpg` bukan `IMG_3421.jpg`
4. **Lazy loading** — `loading="lazy"` untuk gambar di bawah fold

Tools: TinyPNG, Squoosh, ImageOptim.

---

## Tip 5: Mobile-Friendly Wajib Hukumnya

Google menggunakan **mobile-first indexing** — versi mobile website Anda yang dipakai untuk ranking.

**Cek dengan:**
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- Buka website di handphone — apakah teks readable, tombol bisa di-tap, tidak ada horizontal scroll?

**Fix umum:**
- Gunakan responsive design (media queries)
- Font minimum 16px
- Spacing tombol minimum 44x44px
- Hindari pop-up yang full screen di mobile

---

## Tip 6: Optimasi Loading Speed

Target: **PageSpeed score >85, LCP <2.5s, CLS <0.1**

**Quick wins:**
- Compress gambar (Tip 4)
- Aktifkan lazy loading
- Pakai CDN (Cloudflare gratis)
- Minify CSS & JS
- Gunakan font system atau preload custom font
- Cache browser (cache-control headers)

Test di [PageSpeed Insights](https://pagespeed.web.dev) — tools resmi Google.

---

## Tip 7: Buat Konten Bernilai (Blog Strategy)

Blog meningkatkan SEO secara signifikan:

**Strategi konten UMKM:**
1. **Tutorial** — "Cara memilih ... yang tepat"
2. **Listicle** — "10 tips ..." (artikel ini contohnya)
3. **Comparison** — "[Produk A] vs [Produk B]: Mana lebih baik?"
4. **Local content** — "Best ... di [Kota]" — winnable secara lokal

**Frekuensi:** Minimal 1-2 artikel/bulan dengan kualitas tinggi.

Untuk inspirasi, lihat artikel [cara membuat website company profile](/blog/cara-membuat-website-company-profile).

---

## Tip 8: Local SEO untuk UMKM

Kunci memenangkan keyword lokal:

### Google Business Profile (Wajib!)
- Daftar di [Google Business Profile](https://business.google.com)
- Lengkapi semua info: alamat, telepon, jam buka, foto, layanan
- Konsisten NAP (Name, Address, Phone) di semua channel
- Minta review dari customer puas

### Local Schema Markup
Tambahkan structured data `LocalBusiness`:

```json
{
  "@type": "LocalBusiness",
  "name": "Nama Bisnis",
  "address": "...",
  "telephone": "...",
  "areaServed": "Kota Anda"
}
```

### Konten Lokal
- Halaman "Daftar Layanan di [Kota]"
- Blog "[Topik] di [Kota]"
- Backlink dari direktori lokal

Untuk panduan jasa lokal, baca [jasa pembuatan website Tegal](/blog/jasa-pembuatan-website-tegal).

---

## Tip 9: Internal Linking yang Strategis

Internal links membantu Google paham struktur dan distribusi page authority.

**Best practices:**
- Setiap halaman penting dapat link dari minimal 3 halaman lain
- Anchor text deskriptif: "[harga jasa UI/UX design](/blog/harga-jasa-ui-ux-design-indonesia)" bukan "[klik di sini](#)"
- Hubungkan blog post terkait
- Hubungkan halaman service ke artikel blog yang relevan

---

## Tip 10: Build Backlink Berkualitas

Backlink dari website lain ke website Anda = **suara kepercayaan** di mata Google.

**Cara mendapat backlink (white-hat):**
1. **Guest post** di blog/website seindustri
2. **Daftar di direktori bisnis** lokal Indonesia (Tokopedia, Bukalapak listing, dll)
3. **Liputan media** — kirim press release jika ada milestone
4. **Partnership** dengan bisnis komplementer
5. **Konten yang shareable** — infografis, study, listicle viral

**Hindari:**
- Beli backlink (penalti Google)
- Comment spam di blog
- Link farm

---

## Bonus: Setup Google Analytics & Search Console

Tanpa data, Anda tidak bisa improve.

### Google Analytics 4 (GA4)
- Track traffic, source, behavior
- Identify halaman terpopuler
- Pantau goal conversion

### Google Search Console
- Lihat keyword apa yang membawa traffic
- Identifikasi error indexing
- Submit sitemap
- Monitor Core Web Vitals

Setup gratis dan **mandatory** untuk SEO serius.

---

## Tools SEO Gratis yang Recommended

| Tool | Fungsi |
|------|--------|
| Google Search Console | Pantau performa di Google |
| Google Analytics 4 | Analisis traffic |
| PageSpeed Insights | Cek speed |
| Ubersuggest (free tier) | Riset keyword |
| Ahrefs Webmaster Tools | Backlink analysis |
| Screaming Frog (free 500 URLs) | Site audit |
| AnswerThePublic | Question-based keyword |

---

## Kesalahan SEO yang Harus Dihindari UMKM

1. **Keyword stuffing** — pakai keyword berlebihan = penalti
2. **Duplicate content** — copas dari kompetitor = ranking turun
3. **Broken links** — halaman 404 banyak = signal buruk
4. **No SSL** — HTTPS wajib di 2026
5. **Hidden text** — text putih di background putih = penalti

---

## Realistic Timeline: Berapa Lama SEO Membuahkan Hasil?

- **1-3 bulan:** indexing, fixing issues teknis
- **3-6 bulan:** mulai ranking di posisi 50-100
- **6-12 bulan:** mulai masuk halaman 1-2
- **12+ bulan:** stabilisasi posisi top 10

**SEO = marathon, bukan sprint.** Konsistensi key.

---

## Butuh Bantuan Optimasi SEO Website Anda?

Tidak punya waktu/tenaga implementasi SEO sendiri? Tim Ekalliptus Digital menyediakan layanan SEO untuk UMKM Indonesia:

- [Maintenance website](/services/maintenance) include monthly SEO checkup
- [Pembuatan website](/services/website) sudah include basic SEO setup
- Konsultasi SEO gratis via WhatsApp

**Hubungi kami:**
- WhatsApp: [+62 819-9990-0306](https://wa.me/6281999900306)
- Email: ekalliptus@gmail.com
- [Order online](/order)

---

*Dipublikasikan oleh Tim Ekalliptus Digital — 4 Mei 2026*
```

- [ ] **Step 2: Run migration & commit**

```bash
bun run migrate:blog
git add src/content/blog/tips-optimasi-website-seo-untuk-umkm.md
git commit -m "feat(blog): add '10 tips optimasi website SEO untuk UMKM' article"
```

---

# Phase 7: GEO Files + GA4 Custom Events

## Task 21: Create `llms.txt`

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Create the file**

```
# Ekalliptus Digital
> Jasa website, aplikasi mobile, WordPress, dan multimedia editing di Indonesia.
> Berbasis di Tegal, Jawa Tengah. Melayani seluruh Indonesia.
> Didirikan tahun 2023.

## About
Ekalliptus Digital adalah digital agency Indonesia yang spesialis dalam web development, mobile app development, WordPress, UI/UX design, dan multimedia editing. Kami melayani UMKM hingga enterprise di seluruh Indonesia dengan harga terjangkau dan kualitas profesional.

## Services
- Website Development: https://ekalliptus.com/services/website
- Mobile App Development: https://ekalliptus.com/services/mobile-app
- WordPress Development: https://ekalliptus.com/services/wordpress
- UI/UX Design: https://ekalliptus.com/services/ui-ux
- Photo & Video Editing: https://ekalliptus.com/services/multimedia
- Website Maintenance: https://ekalliptus.com/services/maintenance

## Pricing
- Landing Page: starting Rp 500,000
- Company Profile Website: starting Rp 1,500,000
- E-Commerce Website: starting Rp 3,000,000
- Mobile App MVP: starting Rp 5,000,000
- WordPress Custom: starting Rp 2,000,000
- UI/UX Design: starting Rp 1,000,000
- Video Editing: starting Rp 50,000 per video
- Website Maintenance: starting Rp 500,000 per month

## Blog
- Blog Index: https://ekalliptus.com/blog
- RSS Feed: https://ekalliptus.com/blog/rss.xml
- Sitemap: https://ekalliptus.com/sitemap-index.xml

## Contact
- Email: ekalliptus@gmail.com
- WhatsApp: +62 819-9990-0306
- Phone: +62 819-9990-0306
- Location: Tegal, Jawa Tengah 52100, Indonesia
- Hours: Monday-Friday 09:00-17:00 WIB

## Tech Stack
- Frontend: Astro, Next.js, React, Vue.js, Tailwind CSS
- Mobile: React Native, Flutter, Expo
- Backend: Node.js, PHP Laravel, Supabase
- Database: PostgreSQL, MySQL
- CMS: WordPress, WooCommerce
- Design: Figma, Adobe Creative Cloud
- Deployment: Cloudflare, Vercel, Netlify

## Optional
- Privacy Policy: https://ekalliptus.com/privacy-policy
- Terms of Service: https://ekalliptus.com/terms-of-service
- About: https://ekalliptus.com/about
```

- [ ] **Step 2: Verify served**

Run: `bun run dev` then `curl -s http://localhost:4321/llms.txt | head -5`
Expected: Returns the file content.

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat(geo): add llms.txt for AI engine discoverability"
```

---

## Task 22: Add GA4 custom events to ConsultationDialog and CTA buttons

**Files:**
- Modify: `src/components/ConsultationDialog.astro`
- Modify: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Add gtag event helper to a global script**

Append this to the inline script at the end of `src/components/ConsultationDialog.astro` (find the existing `<script>` block and add):

```js
// GA4 Custom Events
function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}

// Attach to all consultation buttons
document.querySelectorAll('[data-track="consultation"]').forEach(btn => {
  btn.addEventListener('click', () => trackEvent('consultation_click', { source: 'button' }))
})

// Attach to all WhatsApp links
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  link.addEventListener('click', () => trackEvent('whatsapp_click', { source: window.location.pathname }))
})

// Attach to all order buttons
document.querySelectorAll('[data-track="order"]').forEach(btn => {
  btn.addEventListener('click', () => trackEvent('order_click', { source: 'button' }))
})
```

- [ ] **Step 2: Add `data-track` attributes to relevant buttons**

In `src/pages/index.astro`, find any button/link with text containing "Konsultasi" or "Order" and add `data-track="consultation"` or `data-track="order"`.

For example:
```astro
<a href="/order" data-track="order" class="...">Order Sekarang</a>
```

(In `ConsultationDialog.astro`, the consultation button should already exist — add `data-track="consultation"`.)

- [ ] **Step 3: Add scroll depth tracker for blog posts**

In `src/pages/blog/[slug].astro`, find the existing `<script is:inline>` block (the reading progress one) and add at the end:

```js
// GA4 Blog Scroll Tracking
let scrollMilestone = 0
const scrollThresholds = [25, 50, 75, 90]
window.addEventListener('scroll', () => {
  const scrollPct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
  for (const threshold of scrollThresholds) {
    if (scrollPct >= threshold && scrollMilestone < threshold) {
      scrollMilestone = threshold
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'blog_scroll', { percent: threshold, slug: window.location.pathname })
      }
    }
  }
}, { passive: true })
```

- [ ] **Step 4: Build and verify**

Run: `bun run build`
Expected: Build completes successfully.

- [ ] **Step 5: Commit**

```bash
git add src/components/ConsultationDialog.astro src/pages/blog/[slug].astro src/pages/index.astro
git commit -m "feat(analytics): add GA4 custom events for CTAs and blog scroll depth"
```

---

# Phase 8: Final Verification

## Task 23: Run full verification suite

- [ ] **Step 1: Run existing tests**

Run: `bun run vitest --run`
Expected: All tests pass (only favicon test exists).

- [ ] **Step 2: Full build**

Run: `bun run build`
Expected: Build completes successfully without warnings.

- [ ] **Step 3: Type check**

Run: `bun run astro check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Manual verification checklist**

Start dev server: `bun run dev`

Verify each URL returns 200 + correct content:
- [ ] `http://localhost:4321/` — homepage with new title
- [ ] `http://localhost:4321/about` — about page
- [ ] `http://localhost:4321/services/website` — service page with FAQPage schema
- [ ] `http://localhost:4321/services/mobile-app`
- [ ] `http://localhost:4321/services/wordpress`
- [ ] `http://localhost:4321/services/ui-ux`
- [ ] `http://localhost:4321/services/multimedia`
- [ ] `http://localhost:4321/services/maintenance`
- [ ] `http://localhost:4321/blog` — blog listing
- [ ] `http://localhost:4321/blog/jasa-web-developer-freelance-indonesia` — new article
- [ ] `http://localhost:4321/blog/cara-membuat-website-company-profile`
- [ ] `http://localhost:4321/blog/harga-jasa-ui-ux-design-indonesia`
- [ ] `http://localhost:4321/blog/tips-optimasi-website-seo-untuk-umkm`
- [ ] `http://localhost:4321/blog/tag/wordpress` — tag page
- [ ] `http://localhost:4321/llms.txt`
- [ ] `http://localhost:4321/robots.txt`

For each blog post page, view-source and verify:
- `<meta property="og:type" content="article">`
- `<meta property="article:published_time" content="...">`
- `<meta name="author" content="...">`
- JSON-LD BlogPosting schema is in `<head>`

- [ ] **Step 5: Schema validation**

Manually paste homepage HTML into [Google Rich Results Test](https://search.google.com/test/rich-results) → expect Organization, LocalBusiness, WebSite, ItemList, HowTo, FAQPage detected.

For one blog article: expect BlogPosting, BreadcrumbList, Article detected.

For one service page: expect Service, FAQPage, BreadcrumbList detected.

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git status
# fix any issues, then:
git add -A
git commit -m "fix(seo): post-verification fixes"
```

---

# Self-Review

## Spec Coverage Check

| Spec Section | Tasks Covering It |
|--------------|-------------------|
| 1.1 Slot head fix | Task 1 |
| 1.2 og:locale fix | Task 1 |
| 1.3 Tag pages | Tasks 6, 7 |
| 1.4 Layout props/sitemap link | Task 1 |
| 1.5 robots.txt fix | Task 2 |
| 1.6 Homepage title/desc | Task 4 |
| 2.1 Schema improvements | Task 5 |
| 2.2 HowTo + Offer | Task 5 |
| 2.3 Service schemas | Tasks 9-14 |
| 2.4 Blog listing schema | (already in blog.astro, kept as-is) |
| 2.5 Person schema | Task 5 |
| 3.1 Keyword strategy | Tasks 4, 9-14, 17-20 |
| 3.2 Blog article meta | Task 3 |
| 3.3 Internal linking | Tasks 9-14, 17-20 |
| 4.1-4.4 Service pages | Tasks 9-14 + Task 8 (nav) |
| 5.1-5.2 New blog articles | Tasks 17-20 |
| 5.3 Existing article updates | Task 16 |
| 5.4 Image fallback | Task 3 |
| 5.5 Supabase sync | Tasks 16-20 (each runs migrate:blog) |
| 6.1 About page | Task 15 |
| 6.2 AI-readable content | Tasks 9-14 (lead paragraphs), 17-20 |
| 6.3 Speakable schema | Task 3 |
| 6.4 NAP consistency | Task 15 (about page sets canonical NAP), Task 5 (JsonLd) |
| 6.5 Citation meta tags | Task 1 |
| 6.6 llms.txt | Task 21 |
| 7.1 GSC fixes | Tasks 1, 2, 7, 9-14 |
| 7.2 GA4 setup | Task 1 |
| 7.3 GA4 custom events | Task 22 |

**No gaps identified.**

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-04-seo-geo-optimization-plan.md`. Total: 23 tasks across 8 phases.**
