import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  site: 'https://ekalliptus.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'id',
        locales: {
          id: 'id-ID',
          en: 'en-US',
          ja: 'ja-JP',
          ko: 'ko-KR',
          ru: 'ru-RU',
          ar: 'ar-SA',
          tr: 'tr-TR'
        }
      },
      exclude: ['/privacy-policy', '/terms-of-service', '/order-success']
    })
  ],
  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    }
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
})
