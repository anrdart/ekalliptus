// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
      title: 'ekalliptus - Digital Agency Indonesia',
      htmlAttrs: {
        lang: 'id'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing. Transformasi bisnis Anda dengan teknologi terdepan.' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' }
      ],
      script: [
        { src: '/vendor/three.min.js', defer: true },
        { src: '/vendor/vanta.net.min.js', defer: true }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@vueuse/nuxt'
  ],

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

  // i18n
  i18n: {
    locales: [
      { code: 'id', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'ko', name: '한국어', file: 'ko.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' },
      { code: 'ar', name: 'العربية', file: 'ar.json', dir: 'rtl' },
      { code: 'tr', name: 'Türkçe', file: 'tr.json' }
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
    }
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
    preset: 'cloudflare-pages'
  }
})
