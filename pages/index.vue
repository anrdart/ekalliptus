<template>
  <div>
    <div class="relative flex flex-col gap-24 pb-24">
      <!-- Hero Section -->
      <Hero />

      <!-- Intro - Single H1 with primary keyword (Requirements 4.1, 4.5) -->
      <div class="text-center py-8 px-4">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Digital Agency Indonesia - Web Development & Mobile App
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          {{ $t('index.intro.subtitle') }}
        </p>
      </div>

      <!-- Services Section - Lazy loaded (Requirements 4.1) -->
      <LazyServices />

      <!-- FAQ Section - Lazy loaded (Requirements 4.1) -->
      <LazyFAQ />

      <!-- About Section -->
      <section id="about" class="content-vis relative px-4 py-24">
        <div class="absolute inset-0">
          <div class="pointer-events-none fx-bubble absolute left-[10%] top-[15%] h-40 w-40 rounded-full border border-border/20 bg-card/10 blur-3xl" />
          <div class="pointer-events-none fx-bubble absolute right-[15%] top-[25%] h-32 w-32 rounded-full border border-border/20 bg-emerald-400/10 blur-3xl" />
          <div class="pointer-events-none fx-bubble floating absolute bottom-[20%] left-[20%] h-36 w-36 rounded-full border border-border/20 bg-primary/10 blur-[70px]" />
        </div>

        <div class="relative z-10 mx-auto max-w-6xl">
          <div class="mx-auto mb-16 max-w-4xl text-center">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground mb-6">
              <span>{{ $t('about.title') }}</span>
            </div>
            
            <h2 class="text-4xl font-semibold text-foreground md:text-5xl mb-8">
              {{ $t('index.about.heading') }}
            </h2>

            <!-- Stats Grid -->
            <div class="glass-panel neon-border rounded-3xl p-8 md:p-12 shadow-elegant mb-12">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <!-- Features -->
                <div class="space-y-6 text-left">
                  <div class="flex items-start gap-4">
                    <div class="rounded-full bg-primary p-3 mt-1">
                      <Zap class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-semibold text-foreground mb-2">{{ $t('about.innovation') }}</h3>
                      <p class="text-muted-foreground leading-relaxed">{{ $t('about.innovationDesc') }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="rounded-full bg-primary p-3 mt-1">
                      <CheckCircle class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-semibold text-foreground mb-2">{{ $t('about.quality') }}</h3>
                      <p class="text-muted-foreground leading-relaxed">{{ $t('about.qualityDesc') }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="rounded-full bg-primary p-3 mt-1">
                      <Users class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-semibold text-foreground mb-2">{{ $t('about.team') }}</h3>
                      <p class="text-muted-foreground leading-relaxed">{{ $t('about.teamDesc') }}</p>
                    </div>
                  </div>
                </div>

                <!-- Stats Cards -->
                <div class="space-y-6">
                  <div class="glass-panel rounded-2xl p-6 bg-card/10">
                    <div class="text-center">
                      <div class="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">5+</div>
                      <div class="text-sm uppercase tracking-[0.3em] text-muted-foreground">{{ $t('index.stats.experience') }}</div>
                    </div>
                  </div>

                  <div class="glass-panel rounded-2xl p-6 bg-card/10">
                    <div class="text-center">
                      <div class="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">200+</div>
                      <div class="text-sm uppercase tracking-[0.3em] text-muted-foreground">{{ $t('index.stats.clients') }}</div>
                    </div>
                  </div>

                  <div class="glass-panel rounded-2xl p-6 bg-card/10">
                    <div class="text-center">
                      <div class="text-4xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-2">24/7</div>
                      <div class="text-sm uppercase tracking-[0.3em] text-muted-foreground">{{ $t('index.stats.support') }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
              <NuxtLink
                to="/order"
                class="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:scale-105 cursor-interactive"
              >
                <span>{{ $t('index.cta.startProject') }}</span>
                <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </NuxtLink>

              <a
                href="#services"
                class="group inline-flex items-center gap-3 rounded-full border-2 border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 cursor-interactive"
              >
                <span>{{ $t('index.cta.viewServices') }}</span>
                <ArrowDown class="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact CTA - Lazy loaded (Requirements 4.1) -->
      <LazyContactCTA />

      <!-- Footer -->
      <footer class="border-t border-border/40 bg-card/10 py-8 px-4">
        <div class="mx-auto max-w-6xl">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-sm text-muted-foreground">
              © {{ new Date().getFullYear() }} ekalliptus. All rights reserved.
            </p>
            <div class="flex gap-6">
              <NuxtLink
                to="/privacy-policy"
                class="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {{ $t('privacyPolicy.title') }}
              </NuxtLink>
              <NuxtLink
                to="/terms-of-service"
                class="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {{ $t('termsOfService.title') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Zap, CheckCircle, Users, ArrowRight, ArrowDown } from 'lucide-vue-next'
import { seoConfig } from '~/config/seo.config'
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  schemaToJsonLd
} from '~/composables/useStructuredData'

// Get page SEO config
const pageMeta = seoConfig.pages.home
const siteUrl = seoConfig.siteUrl

// Set comprehensive SEO meta tags
// Requirements: 2.1, 2.2, 2.3, 2.4, 4.1
useSeoMeta({
  // Basic meta tags (Requirements 2.1, 2.2)
  title: pageMeta.title,
  description: pageMeta.description,
  keywords: pageMeta.keywords,
  
  // Open Graph tags (Requirements 2.3)
  ogTitle: pageMeta.ogTitle || pageMeta.title,
  ogDescription: pageMeta.ogDescription || pageMeta.description,
  ogType: pageMeta.ogType || 'website',
  ogUrl: `${siteUrl}/`,
  ogLocale: 'id_ID',
  ogSiteName: seoConfig.siteName,
  
  // Twitter Card tags (Requirements 2.4)
  twitterCard: pageMeta.twitterCard || 'summary_large_image',
  twitterTitle: pageMeta.twitterTitle || pageMeta.title,
  twitterDescription: pageMeta.twitterDescription || pageMeta.description
})

// Define OG image for homepage (Requirements 2.5)
// nuxt-og-image will automatically generate the og:image and twitter:image meta tags
defineOgImage({
  component: 'OgImageDefault',
  props: {
    title: 'ekalliptus',
    description: 'Digital Agency Indonesia',
    siteName: 'ekalliptus',
    siteUrl: 'ekalliptus.id'
  }
})

// Generate structured data schemas (Requirements 3.1, 3.2, 3.5, 7.1)
const organizationSchema = generateOrganizationSchema()
const localBusinessSchema = generateLocalBusinessSchema()
const webSiteSchema = generateWebSiteSchema()
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' }
])

// Set canonical URL and structured data (Requirements 1.5, 3.1, 3.2, 3.5, 7.1)
useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/` }
  ],
  script: [
    // Organization Schema (Requirements 3.1)
    {
      type: 'application/ld+json',
      innerHTML: schemaToJsonLd(organizationSchema)
    },
    // LocalBusiness Schema (Requirements 7.1)
    {
      type: 'application/ld+json',
      innerHTML: schemaToJsonLd(localBusinessSchema)
    },
    // WebSite Schema with SearchAction (Requirements 3.2)
    {
      type: 'application/ld+json',
      innerHTML: schemaToJsonLd(webSiteSchema)
    },
    // BreadcrumbList Schema (Requirements 3.5)
    {
      type: 'application/ld+json',
      innerHTML: schemaToJsonLd(breadcrumbSchema)
    }
  ]
})
</script>
