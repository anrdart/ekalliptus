# SEO & GEO Optimization Design — Ekalliptus Digital

**Date:** 2026-05-04  
**Approach:** Full Stack SEO (technical fixes + schema + service pages + content + GEO)  
**Target:** Lokal (Tegal/Jawa Tengah) + Nasional Indonesia  
**Priority:** SEO Google first, GEO as complement  
**Constraint:** Tidak mengubah design yang sudah ada

---

## 1. Critical Bug Fixes & Technical SEO Foundation

### 1.1 Fix `<slot name="head">` di Layout.astro

**Problem:** `blog/[slug].astro` menginjeksi JSON-LD BlogPosting & BreadcrumbList via `<Fragment slot="head">` tapi `Layout.astro` tidak mendefinisikan `<slot name="head">` di dalam `<head>`. Schema-schema ini **tidak pernah di-render** — Google tidak melihatnya sama sekali.

**Fix:** Tambahkan `<slot name="head" />` di dalam `<head>` Layout.astro, sebelum closing `</head>`.

### 1.2 Fix `og:locale` format

**Problem:** Logic sekarang:
```
`${lang.replace('-', '_')}_${lang === 'id' ? 'ID' : lang.toUpperCase()}`
```
Menghasilkan `en_EN`, `ja_JA`, `ko_KO` — semua salah.

**Fix:** Hardcode mapping yang benar di Layout.astro:
```ts
const ogLocaleMap: Record<string, string> = {
  id: 'id_ID', en: 'en_US', ja: 'ja_JP',
  ko: 'ko_KR', ru: 'ru_RU', ar: 'ar_SA', tr: 'tr_TR'
}
const ogLocale = ogLocaleMap[lang] ?? 'id_ID'
const ogLocaleAlternates = Object.values(ogLocaleMap).filter(l => l !== ogLocale)
```

Tambah juga `og:locale:alternate` untuk semua bahasa lain.

### 1.3 Fix Tag Pages 404

**Problem:** Tag links di blog artikel mengarah ke `/blog?tag=X` tapi tidak ada routing atau filtering berdasarkan URL params. Google crawl URL ini dan dapat 404.

**Fix:** Buat `src/pages/blog/tag/[tag].astro` sebagai dedicated tag pages dengan konten artikel yang di-filter per tag. Ini sekaligus SEO benefit (additional indexable pages).

### 1.4 Perbaikan Layout.astro Tambahan

- Tambah `<link rel="sitemap" type="application/xml" href="/sitemap-index.xml" />` di head
- Tambah props baru opsional ke Layout interface:
  - `type?: 'website' | 'article'` → untuk `og:type`
  - `publishedTime?: string` → untuk `article:published_time`
  - `modifiedTime?: string` → untuk `article:modified_time`  
  - `author?: string` → untuk `meta name="author"` dan `article:author`
  - `keywords?: string` → untuk `meta name="keywords"`
- Tambah `article:*` meta tags ketika `type === 'article'`

### 1.5 Fix robots.txt

**Problem:** `Disallow: /*.json$` memblokir `/blog/feed.json` yang valid dan seharusnya di-crawl. `Disallow: /*.md$` tidak diperlukan.

**Robots.txt baru:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /order-success
Disallow: /payment/
Allow: /blog/feed.json
Allow: /blog/rss.xml

Sitemap: https://ekalliptus.com/sitemap-index.xml
Sitemap: https://ekalliptus.com/blog/sitemap.xml
```

### 1.6 Homepage Title & Description

| | Before | After |
|--|--------|-------|
| **Title** | "Ekalliptus Digital \| Web & Mobile App" | "Ekalliptus Digital \| Jasa Website & Aplikasi Mobile Terbaik Indonesia" |
| **Description** | Generic subtitle dari i18n | "Jasa pembuatan website profesional, aplikasi mobile, WordPress & UI/UX design. Berbasis Tegal, melayani seluruh Indonesia. Konsultasi GRATIS!" |

---

## 2. Schema & Structured Data Overhaul

### 2.1 Improvement Schemas yang Sudah Ada (JsonLd.astro)

**Organization:**
- Tambah `foundingDate`, `numberOfEmployees: "1-10"`, `knowsAbout` array

**LocalBusiness:**
- Tambah `openingHours: "Mo-Fr 09:00-17:00"`, `currenciesAccepted: "IDR"`, `paymentAccepted`, `hasMap` (Google Maps URL Tegal)

**WebSite:**
- Tambah `potentialAction` SearchAction untuk sitelinks searchbox

**BlogPosting** (di `blog/[slug].astro`, setelah slot fix):
- Tambah `wordCount`, `inLanguage`, `keywords`
- Fix `mainEntityOfPage`: dari string ke `{"@type":"WebPage","@id":canonical}`
- Tambah `speakable` property untuk intro paragraph

### 2.2 Schema Baru di Homepage

**HowTo:** Untuk section "Proses Order" (langkah 1-4 yang sudah ada di halaman):
```json
{
  "@type": "HowTo",
  "name": "Cara Order Layanan Ekalliptus Digital",
  "step": [
    {"@type": "HowToStep", "position": 1, "name": "Isi Form Order", "text": "Pilih layanan dan isi form order dengan detail kebutuhan project Anda."},
    {"@type": "HowToStep", "position": 2, "name": "Konsultasi & Briefing", "text": "Tim kami akan menghubungi Anda untuk konsultasi dan menyusun brief project."},
    {"@type": "HowToStep", "position": 3, "name": "Pengerjaan Project", "text": "Project dikerjakan sesuai timeline yang disepakati dengan update berkala."},
    {"@type": "HowToStep", "position": 4, "name": "Review & Handover", "text": "Review hasil, revisi jika perlu, lalu handover beserta dokumentasi."}
  ]
}
```

**Offer/ItemList:** Untuk setiap layanan dengan `price`, `priceCurrency: "IDR"`, `areaServed: "ID"`

### 2.3 Schema Baru di Service Pages

Setiap service page memiliki:
- `Service` schema dengan `offers`, `areaServed` (country ID + city Tegal)
- `FAQPage` schema dari FAQ section halaman tersebut

### 2.4 Schema Blog Listing (blog.astro)

Ganti `Blog` menjadi `CollectionPage` yang lebih spesifik + tetap include `Blog` schema.

### 2.5 Person Schema untuk Author

Tambah `Person` schema global di JsonLd.astro:
```json
{
  "@type": "Person",
  "name": "Tim Ekalliptus",
  "jobTitle": "Digital Agency Team",
  "worksFor": {"@type": "Organization", "name": "Ekalliptus Digital"}
}
```

---

## 3. Meta Optimization

### 3.1 Keyword Strategy per Halaman

| Halaman | Primary Keyword | Secondary Keywords |
|---------|----------------|-------------------|
| Homepage | jasa web developer Indonesia | digital agency Tegal, jasa website murah Indonesia |
| /services/website | jasa pembuatan website profesional | company profile website, web development Indonesia |
| /services/mobile-app | jasa pembuatan aplikasi mobile | react native developer Indonesia, flutter developer |
| /services/wordpress | jasa wordpress developer Indonesia | wordpress custom development, maintenance wordpress |
| /services/ui-ux | jasa ui ux design Indonesia | desain aplikasi profesional, figma designer |
| /services/multimedia | jasa editing video profesional | editing video tiktok, jasa foto produk |
| /services/maintenance | jasa maintenance website | pemeliharaan website bulanan, update website |
| /blog/jasa-pembuatan-website-tegal | jasa pembuatan website Tegal | website company profile Tegal, harga website Tegal 2026 |
| /blog/biaya-pembuatan-aplikasi | biaya buat aplikasi Android iOS | harga react native, flutter developer Indonesia |

### 3.2 blog/[slug].astro Meta Tambahan

Tambah ke Layout call di slug page:
- `type="article"`
- `publishedTime={post.data.publishDate.toISOString()}`
- `modifiedTime={(post.data.updateDate || post.data.publishDate).toISOString()}`
- `author={post.data.author}`
- `keywords={post.data.tags.join(', ')}`

### 3.3 Internal Linking Plan

- Homepage → semua 6 service pages (via navbar dropdown + footer)
- Setiap blog artikel → 1 related service page
- Setiap service page → 2 related blog articles
- Blog articles → related blog articles (section "Artikel Terkait" di bagian bawah)

---

## 4. Dedicated Service Landing Pages

### 4.1 Halaman Baru (6 pages)

| File | URL | H1 |
|------|-----|----|
| `src/pages/services/website.astro` | `/services/website` | Jasa Pembuatan Website Profesional Indonesia |
| `src/pages/services/mobile-app.astro` | `/services/mobile-app` | Jasa Pembuatan Aplikasi Mobile Android & iOS |
| `src/pages/services/wordpress.astro` | `/services/wordpress` | Jasa WordPress Developer Indonesia |
| `src/pages/services/ui-ux.astro` | `/services/ui-ux` | Jasa UI/UX Design Indonesia |
| `src/pages/services/multimedia.astro` | `/services/multimedia` | Jasa Editing Foto & Video Profesional |
| `src/pages/services/maintenance.astro` | `/services/maintenance` | Jasa Maintenance Website Bulanan |

### 4.2 Template Konten Tiap Service Page

```
H1: [Nama Layanan]
├── Lead paragraph (150-200 kata, keyword-dense, definitif)
├── Section "Apa yang Anda Dapatkan" — feature list (existing glass-panel design)
├── Section "Paket & Harga" — pricing cards
├── Section "Teknologi yang Kami Gunakan" — tech stack list
├── Section "Proses Kerja" — HowTo schema (4-5 langkah)
├── Section "FAQ" — 5-6 Q&A (FAQPage schema)
├── Section "Artikel Terkait" — 2 blog links (internal linking)
└── CTA "Konsultasi Gratis" → ConsultationDialog (reuse existing component)
```

Semua styling menggunakan komponen dan kelas existing (`glass-panel`, `neon-border`, Tailwind classes).

### 4.3 Navigation Update

Tambah dropdown "Layanan" di `Navigation.astro` dengan link ke 6 service pages. Menggunakan styling navigation yang sudah ada.

### 4.4 Service Pages di Sitemap

Pastikan semua service pages masuk ke sitemap dengan `priority: 0.8` dan `changefreq: monthly`.

---

## 5. Blog Content Expansion

### 5.1 Artikel Baru (4 artikel)

| Slug | Title | Target Keyword | Search Intent |
|------|-------|---------------|---------------|
| `jasa-web-developer-freelance-indonesia` | Jasa Web Developer Freelance vs Agency: Mana yang Tepat untuk Bisnis Anda? | jasa web developer freelance | Informational → Commercial |
| `cara-membuat-website-company-profile` | Cara Membuat Website Company Profile yang Profesional (Panduan 2026) | cara membuat website company profile | How-to |
| `harga-jasa-ui-ux-design-indonesia` | Harga Jasa UI/UX Design di Indonesia: Panduan Lengkap 2026 | harga jasa ui ux design | Commercial |
| `tips-optimasi-website-seo-untuk-umkm` | 10 Tips Optimasi Website SEO untuk UMKM Indonesia | optimasi website SEO UMKM | Informational |

### 5.2 Spesifikasi Tiap Artikel Baru

- Panjang: 1.200–1.800 kata
- H2/H3 hierarchy yang jelas dan keyword-intentional
- 1 internal link ke related service page
- 1 internal link ke related blog artikel yang sudah ada
- CTA section di bagian bawah
- SEO frontmatter lengkap: `seo.metaTitle`, `seo.metaDescription`, `tags`, `image`, `imageAlt`

### 5.3 Improvement Artikel Existing

- Tambah `updateDate: 2026-05-04` di semua artikel yang ada → freshness signal
- Tambah section "Artikel Terkait" di bagian bawah setiap artikel existing
- Update `seo_meta_title` dan `seo_meta_description` via Supabase migration jika perlu

### 5.4 Blog Image Format

Blog images sekarang SVG — SVG tidak optimal untuk Google rich results. Di `blog/[slug].astro`, saat pass `image` prop ke Layout, gunakan fallback ke `/og-image.png` (yang sudah ada dan berformat PNG) ketika image adalah SVG:
```ts
image={post.data.image?.endsWith('.svg') ? '/og-image.png' : (post.data.image || '/og-image.png')}
```
Untuk artikel baru, buat placeholder image dalam format WebP/PNG (bukan SVG) agar bisa digunakan sebagai rich result thumbnail.

### 5.5 New Blog Articles & Supabase Sync

4 artikel baru ditulis sebagai markdown files di `src/content/blog/`. Setelah ditulis, jalankan `bun run migrate:blog` untuk sync ke Supabase (sesuai script existing di `scripts/migrate-blog-to-supabase.ts`). Blog [slug].astro membaca dari Supabase, sehingga migration harus dijalankan agar artikel baru bisa diakses.

---

## 6. GEO Layer (Generative Engine Optimization)

### 6.1 Halaman Baru: `/about`

File: `src/pages/about.astro`

Konten:
- Cerita singkat Ekalliptus (berdiri, mission)
- Keahlian spesifik dengan bukti (teknologi, project count, klien)
- Alamat fisik Tegal yang konsisten dengan JsonLd
- Link ke social media
- `Organization` schema yang diperkaya

### 6.2 AI-Readable Content Structure

Setiap service page dimulai dengan **definitive paragraph** — format yang mudah dikutip AI:

> *"[Layanan X] adalah [definisi singkat]. Ekalliptus Digital menyediakan [layanan ini] untuk bisnis di [area] dengan [keunggulan]."*

FAQ sections di semua halaman utama — AI engines sering mengambil jawaban dari struktur FAQ.

### 6.3 Speakable Schema

Di `blog/[slug].astro`, tandai intro paragraph dan conclusion dengan `speakable` schema:
```json
{
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".article-intro", ".article-conclusion"]
  }
}
```

### 6.4 Konsistensi NAP (Name, Address, Phone)

Standardisasi format di **semua** tempat (footer, JsonLd, about page, setiap service page):
```
Ekalliptus Digital
Tegal, Jawa Tengah 52100, Indonesia
+62 819-9990-0306
ekalliptus@gmail.com
```

### 6.5 Citation Meta Tags di Blog Posts

Tambah ke Layout.astro saat `type === 'article'`:
```html
<meta name="citation_title" content="{title}">
<meta name="citation_author" content="{author}">
<meta name="citation_publication_date" content="YYYY/MM/DD">
```

### 6.6 `llms.txt` File

Buat `/public/llms.txt`:
```
# Ekalliptus Digital
> Jasa website, aplikasi mobile, WordPress, dan multimedia editing di Indonesia.
> Berbasis di Tegal, Jawa Tengah. Melayani seluruh Indonesia.

## Services
- Website Development: https://ekalliptus.com/services/website
- Mobile App Development: https://ekalliptus.com/services/mobile-app
- WordPress Development: https://ekalliptus.com/services/wordpress
- UI/UX Design: https://ekalliptus.com/services/ui-ux
- Photo & Video Editing: https://ekalliptus.com/services/multimedia
- Website Maintenance: https://ekalliptus.com/services/maintenance

## Blog
- https://ekalliptus.com/blog

## Contact
- Email: ekalliptus@gmail.com
- WhatsApp: +62 819-9990-0306
- Location: Tegal, Jawa Tengah, Indonesia
```

---

## 7. GSC Fixes + GA4 Setup

### 7.1 Google Search Console Issue Resolution

| Issue | Halaman | Fix |
|-------|---------|-----|
| 404 | Tag pages `/blog?tag=X` | Buat `src/pages/blog/tag/[tag].astro` |
| 404 | URL lama di sitemap | Audit dan sinkronkan sitemap |
| Blocked by robots.txt | `/blog/feed.json` | Fix robots.txt (Allow: /blog/feed.json) |
| Blocked by robots.txt | Kemungkinan halaman lain dari `/*.json$` | Hapus rule tersebut dari robots.txt |
| Not indexed | Service pages yang baru | Tambah internal links masuk dari homepage + blog |
| noindex | 404, payment pages | Intentional — dokumentasikan saja |

### 7.2 GA4 Setup

Tambah ke `Layout.astro` di dalam `<head>`, setelah meta tags:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-HQL55M3RTK"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-HQL55M3RTK');
</script>
```

`is:inline` penting di Astro agar script tidak di-bundle/transform Vite.

### 7.3 GA4 Custom Events

Tambah event tracking di komponen yang relevan:

| Event | Trigger | Komponen |
|-------|---------|----------|
| `consultation_click` | Klik "Konsultasi Sekarang" | ConsultationDialog.astro |
| `order_click` | Klik "Order Sekarang" | order.astro / service pages |
| `whatsapp_click` | Klik tombol WhatsApp | blog/[slug].astro, service pages |
| `blog_read` | Scroll 80% di blog post | blog/[slug].astro (script) |

---

## Ringkasan Deliverables

| # | Deliverable | File(s) |
|---|------------|---------|
| 1 | Bug fix: slot head | `src/layouts/Layout.astro` |
| 2 | Bug fix: og:locale | `src/layouts/Layout.astro` |
| 3 | Bug fix: robots.txt | `public/robots.txt` |
| 4 | Tag pages | `src/pages/blog/tag/[tag].astro` |
| 5 | Layout props baru (type, author, keywords, times) | `src/layouts/Layout.astro` |
| 6 | Schema overhaul | `src/components/JsonLd.astro` |
| 7 | Article meta tags | `src/layouts/Layout.astro` |
| 8 | Homepage title/description | `src/pages/index.astro` |
| 9 | GA4 setup | `src/layouts/Layout.astro` |
| 10 | GA4 custom events | `src/components/ConsultationDialog.astro`, `src/pages/blog/[slug].astro` |
| 11 | Service pages (6) | `src/pages/services/*.astro` |
| 12 | Navigation dropdown | `src/components/Navigation.astro` |
| 13 | About page | `src/pages/about.astro` |
| 14 | Blog articles baru (4) | `src/content/blog/*.md` |
| 15 | Blog articles update (existing) | `src/content/blog/*.md` |
| 16 | llms.txt | `public/llms.txt` |
| 17 | sitemap link di head | `src/layouts/Layout.astro` |
