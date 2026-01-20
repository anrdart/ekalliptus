// https://nuxt.com/docs/api/configuration/nuxt-config
import { visualizer } from 'rollup-plugin-visualizer'
import type { PluginOption } from 'vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
      title: 'Ekalliptus Digital | Web & Mobile App',
      htmlAttrs: {
        lang: 'id'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing. Transformasi bisnis Anda dengan teknologi terdepan.' },
        { name: 'format-detection', content: 'telephone=no' },
        // Content language meta tag (Requirements 7.4)
        { 'http-equiv': 'content-language', content: 'id-ID' },
        // Geo meta tags for local SEO (Requirements 7.3)
        { name: 'geo.region', content: 'ID-JK' },
        { name: 'geo.placename', content: 'Jakarta, Indonesia' },
        { name: 'geo.position', content: '-6.2088;106.8456' },
        { name: 'ICBM', content: '-6.2088, 106.8456' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Font preconnect hints - critical domains (Requirements 3.2, 6.4, 6.5)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // DNS prefetch for font domains (Requirements 6.4)
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        // DNS prefetch for third-party domains used in CSP (Requirements 6.4, 6.5)
        { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' },
        { rel: 'dns-prefetch', href: 'https://static.cloudflareinsights.com' },
        // DNS prefetch for API/service domains (Requirements 6.4)
        { rel: 'dns-prefetch', href: 'https://api.emailjs.com' },
        { rel: 'dns-prefetch', href: 'https://sheetdb.io' },
        // DNS prefetch for Supabase (Requirements 6.4)
        { rel: 'dns-prefetch', href: 'https://muyzxygtlwsfegzyvgcm.supabase.co' },
        // DNS prefetch for external links (Requirements 6.4)
        { rel: 'dns-prefetch', href: 'https://wa.me' },
        { rel: 'dns-prefetch', href: 'https://me.ekalliptus.com' },
        // DNS prefetch for Google Analytics
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
        // Font stylesheet with display=swap for performance (Requirements 3.1, 3.4, 3.5)
        // Only load font weights actually used: 400 (body), 500 (medium), 600 (semibold), 700 (bold)
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', media: 'print', onload: "this.media='all'" },
        // Preload critical font weight 400 for body text (Requirements 3.3)
        { rel: 'preload', href: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', as: 'font', type: 'font/woff2', crossorigin: '', fetchpriority: 'high' },
        // Preload critical assets (Requirements 6.5)
        { rel: 'preload', href: '/ekalliptus_rounded.webp', as: 'image', type: 'image/webp', fetchpriority: 'high' }
      ],
      script: [
        // Google Analytics 4 (gtag.js)
        { src: 'https://www.googletagmanager.com/gtag/js?id=G-HQL55M3RTK', async: true },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-HQL55M3RTK');`
        },
        // Defer non-critical scripts (Requirements 5.3)
        // Three.js and Vanta.js are loaded with defer for non-blocking execution
        // These scripts are only needed for the background effect, not core functionality
        { src: '/vendor/three.min.js', defer: true, fetchpriority: 'low' },
        { src: '/vendor/vanta.net.min.js', defer: true, fetchpriority: 'low' }
      ],
      // Noscript fallback for users with JavaScript disabled
      noscript: [
        { innerHTML: 'This website requires JavaScript for the best experience.' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxtjs/seo',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],

  // SEO Configuration
  site: {
    url: 'https://ekalliptus.com',
    name: 'ekalliptus',
    description: 'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing.',
    defaultLocale: 'id'
  },

  // OG Image Configuration (Requirements 2.5)
  ogImage: {
    // Default component for OG image generation
    defaults: {
      component: 'OgImageDefault',
      width: 1200,
      height: 630,
      extension: 'png',
      props: {
        title: 'ekalliptus',
        description: 'Ekalliptus Digital',
        siteName: 'ekalliptus',
        siteUrl: 'ekalliptus.com'
      }
    },
    // Use Inter font for consistency with site branding
    fonts: [
      'Inter:400',
      'Inter:500',
      'Inter:600',
      'Inter:700'
    ],
    // Enable runtime caching for generated images
    runtimeCacheStorage: true
  },

  // Sitemap Configuration (Requirements 1.2, 6.4)
  sitemap: {
    // Default values for all URLs
    defaults: {
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString()
    },
    // Exclude legal pages from sitemap (they have noindex)
    exclude: ['/privacy-policy', '/terms-of-service', '/order-success'],
    // Configure URLs with i18n alternate links (Requirements 6.4)
    urls: [
      {
        loc: '/',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 1.0,
        alternatives: [
          { hreflang: 'id', href: 'https://ekalliptus.com/' },
          { hreflang: 'en', href: 'https://ekalliptus.com/' },
          { hreflang: 'ja', href: 'https://ekalliptus.com/' },
          { hreflang: 'ko', href: 'https://ekalliptus.com/' },
          { hreflang: 'ru', href: 'https://ekalliptus.com/' },
          { hreflang: 'ar', href: 'https://ekalliptus.com/' },
          { hreflang: 'tr', href: 'https://ekalliptus.com/' },
          { hreflang: 'x-default', href: 'https://ekalliptus.com/' }
        ]
      },
      {
        loc: '/order',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.9,
        alternatives: [
          { hreflang: 'id', href: 'https://ekalliptus.com/order' },
          { hreflang: 'en', href: 'https://ekalliptus.com/order' },
          { hreflang: 'ja', href: 'https://ekalliptus.com/order' },
          { hreflang: 'ko', href: 'https://ekalliptus.com/order' },
          { hreflang: 'ru', href: 'https://ekalliptus.com/order' },
          { hreflang: 'ar', href: 'https://ekalliptus.com/order' },
          { hreflang: 'tr', href: 'https://ekalliptus.com/order' },
          { hreflang: 'x-default', href: 'https://ekalliptus.com/order' }
        ]
      }
    ],
    // Enable xsl stylesheet for human-readable sitemap
    xsl: false,
    // Sitemap index configuration
    sitemaps: false,
    // Auto-discover routes
    autoLastmod: true,
    // Strict mode for validation
    strictNuxtContentPaths: false
  },

  // Robots Configuration (Requirements 1.3, 8.4)
  robots: {
    // Sitemap reference for crawlers
    sitemap: 'https://ekalliptus.com/sitemap.xml',

    // Default rules for all user agents
    groups: [
      {
        // Default rules for all bots
        userAgent: ['*'],
        allow: ['/'],
        disallow: [
          '/api/',           // API endpoints
          '/_nuxt/',         // Nuxt internal assets
          '/admin/',         // Admin pages (if any)
          '/private/',       // Private pages
          '/*.json$',        // JSON files
          '/*.md$',          // Markdown files
          '/order-success'   // Order success page (transient)
        ]
      },
      {
        // Googlebot - faster crawling allowed
        userAgent: ['Googlebot'],
        allow: ['/'],
        disallow: [
          '/api/',
          '/_nuxt/',
          '/admin/',
          '/private/'
        ]
      },
      {
        // Bingbot - faster crawling allowed
        userAgent: ['Bingbot'],
        allow: ['/'],
        disallow: [
          '/api/',
          '/_nuxt/',
          '/admin/',
          '/private/'
        ]
      },
      {
        // Yandex - moderate crawling
        userAgent: ['Yandex'],
        allow: ['/'],
        disallow: [
          '/api/',
          '/_nuxt/',
          '/admin/',
          '/private/'
        ]
      },
      {
        // Baidu - moderate crawling
        userAgent: ['Baiduspider'],
        allow: ['/'],
        disallow: [
          '/api/',
          '/_nuxt/',
          '/admin/',
          '/private/'
        ]
      },
      {
        // Block bad bots
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot'
        ],
        disallow: ['/']
      }
    ]
  },

  // Tailwind CSS
  tailwindcss: {
    configPath: 'tailwind.config.ts',
    cssPath: '~/assets/css/main.css',
    exposeConfig: true
  },

  // Color Mode
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
    storageKey: 'ekal-theme'
  },

  // i18n with SEO configuration (Requirements 1.4, 6.1, 6.2)
  i18n: {
    locales: [
      { code: 'id', iso: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ja', iso: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'ko', iso: 'ko-KR', name: '한국어', file: 'ko.json' },
      { code: 'ru', iso: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'ar', iso: 'ar-SA', name: 'العربية', file: 'ar.json', dir: 'rtl' },
      { code: 'tr', iso: 'tr-TR', name: 'Türkçe', file: 'tr.json' }
    ],
    defaultLocale: 'id',
    lazy: true,
    langDir: 'locales',
    strategy: 'no_prefix',
    bundle: {
      optimizeTranslationDirective: false
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    // SEO Configuration for hreflang generation (Requirements 1.4, 6.1, 6.2)
    baseUrl: 'https://ekalliptus.com'
  },

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || ''
    }
  },

  // CSS
  css: ['~/assets/css/main.css'],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false
  },

  // SSR configuration
  ssr: true,

  // Nitro
  nitro: {
    preset: 'cloudflare-pages',
    // Enable compression for production
    compressPublicAssets: true
  },

  // Vite build optimizations (Requirements 1.2, 1.3, 8.1, 8.2, 8.5)
  vite: {
    // Bundle analyzer plugin for production builds (Requirements 8.3)
    plugins: [
      visualizer({
        filename: 'bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
        emitFile: true
      }) as PluginOption
    ],
    build: {
      // Disable source maps in production (Requirements 8.5)
      sourcemap: false,
      // Enable minification with terser for better compression
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      // Rollup options for optimal code splitting (Requirements 1.2, 1.3)
      rollupOptions: {
        output: {
          // Manual chunks for better code splitting
          manualChunks: {
            // Vendor chunk for Vue ecosystem
            'vue-vendor': ['vue', 'vue-router'],
            // UI utilities chunk
            'ui-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
            // Date utilities
            'date-utils': ['date-fns'],
            // Supabase client
            'supabase': ['@supabase/supabase-js'],
            // Form validation
            'validation': ['zod']
          },
          // Optimize chunk file names
          chunkFileNames: '_nuxt/chunks/[name]-[hash].js',
          entryFileNames: '_nuxt/[name]-[hash].js',
          assetFileNames: '_nuxt/assets/[name]-[hash][extname]'
        }
      },
      // Target modern browsers for smaller bundles
      target: 'esnext',
      // CSS code splitting
      cssCodeSplit: true
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core']
    }
  },

  // Experimental features for better performance
  experimental: {
    // Enable payload extraction for smaller initial JS
    payloadExtraction: true,
    // Enable tree shaking for composables
    treeshakeClientOnly: true
  }
})
