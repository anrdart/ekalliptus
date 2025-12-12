<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { seoConfig } from '~/config/seo.config'
import { generateHreflangTags } from '~/composables/useI18nSeo'

// Get current route for canonical URL generation
const route = useRoute()
const { locale } = useI18n()

// Generate canonical URL (Requirements 1.5)
const canonicalUrl = computed(() => {
  const path = route.path === '/' ? '' : route.path
  return `${seoConfig.siteUrl}${path}`
})

// Default OG image URL - nuxt-og-image generates this dynamically
const ogImageUrl = computed(() => `${seoConfig.siteUrl}/__og-image__/image/og.png`)

// Define default OG image using nuxt-og-image (Requirements 2.5)
// This generates a branded 1200x630px image for social sharing
defineOgImage({
  component: 'OgImageDefault',
  width: 1200,
  height: 630,
  props: {
    title: 'ekalliptus',
    description: 'Digital Agency Indonesia',
    siteName: 'ekalliptus',
    siteUrl: 'ekalliptus.id'
  }
})

// Generate hreflang tags for all supported languages (Requirements 1.4, 6.1, 6.2)
const hreflangLinks = computed(() => {
  return generateHreflangTags(route.path, seoConfig.siteUrl)
})

// App entry point with comprehensive SEO
useHead({
  htmlAttrs: {
    lang: () => locale.value || 'id'
  },
  bodyAttrs: {
    class: 'antialiased'
  },
  link: [
    // Self-referencing canonical URL (Requirements 1.5)
    { rel: 'canonical', href: canonicalUrl },
    // Hreflang tags for all supported languages (Requirements 1.4, 6.1, 6.2)
    ...hreflangLinks.value
  ]
})

// Default SEO meta tags (Requirements 2.3, 2.4)
useSeoMeta({
  // Open Graph tags (Requirements 2.3)
  ogTitle: () => seoConfig.pages.home.title,
  ogDescription: () => seoConfig.pages.home.description,
  ogImage: ogImageUrl,
  ogUrl: canonicalUrl,
  ogType: 'website',
  ogLocale: () => locale.value === 'id' ? 'id_ID' : locale.value,
  ogSiteName: seoConfig.siteName,
  
  // Twitter Card tags (Requirements 2.4)
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoConfig.pages.home.title,
  twitterDescription: () => seoConfig.pages.home.description,
  twitterImage: ogImageUrl,
  twitterSite: '@ekalliptus'
})
</script>
