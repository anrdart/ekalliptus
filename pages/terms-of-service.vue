<template>
  <div>
    <Head>
      <!-- SEO Meta Tags - Requirements 4.4 -->
      <Title>{{ pageTitle }}</Title>
      <Meta name="description" :content="pageDescription" />
      
      <!-- Robots noindex,nofollow - Requirements 4.4 -->
      <Meta name="robots" content="noindex,nofollow" />
      
      <!-- Canonical URL -->
      <Link rel="canonical" :href="canonicalUrl" />
      
      <!-- Basic Open Graph Tags for completeness -->
      <Meta property="og:title" :content="pageTitle" />
      <Meta property="og:description" :content="pageDescription" />
      <Meta property="og:url" :content="canonicalUrl" />
      <Meta property="og:type" content="website" />
      <Meta property="og:locale" :content="ogLocale" />
      <Meta property="og:site_name" content="ekalliptus" />
      
      <!-- Basic Twitter Card Tags for completeness -->
      <Meta name="twitter:card" content="summary" />
      <Meta name="twitter:title" :content="pageTitle" />
      <Meta name="twitter:description" :content="pageDescription" />
    </Head>
    
    <div class="min-h-screen py-12 px-4">
      <div class="max-w-3xl mx-auto">
        <div class="glass-panel neon-border rounded-3xl p-8 md:p-12">
          <h1 class="text-3xl font-bold text-foreground mb-8">
            {{ $t('termsOfService.title', 'Syarat & Ketentuan') }}
          </h1>

          <div class="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>
              {{ $t('termsOfService.intro', 'Terakhir diperbarui: Desember 2024') }}
            </p>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">1. Penerimaan Ketentuan</h2>
              <p>
                Dengan menggunakan layanan ekalliptus, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">2. Layanan Kami</h2>
              <p>
                ekalliptus menyediakan layanan pengembangan web, aplikasi mobile, kustomisasi WordPress, editing video, dan layanan digital lainnya.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">3. Pembayaran</h2>
              <p>
                Pembayaran dilakukan sesuai dengan ketentuan yang disepakati dalam proposal atau kontrak. Kami menerima pembayaran via transfer bank, QRIS, dan metode lainnya.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">4. Hak Kekayaan Intelektual</h2>
              <p>
                Setelah pembayaran penuh diterima, hak atas hasil karya akan ditransfer kepada klien kecuali diatur lain dalam kontrak.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">5. Pembatasan Tanggung Jawab</h2>
              <p>
                ekalliptus tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan kami.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">6. Hubungi Kami</h2>
              <p>
                Untuk pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami di ekalliptus@gmail.com.
              </p>
            </section>
          </div>

          <div class="mt-8 pt-8 border-t border-border/30">
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-interactive"
            >
              <ArrowLeft class="h-4 w-4" />
              {{ $t('common.backHome', 'Kembali ke Beranda') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { seoConfig } from '~/config/seo.config'
import { generateBreadcrumbSchema, schemaToJsonLd } from '~/composables/useStructuredData'

// SEO Configuration - Requirements 4.4
const { locale } = useI18n()
const route = useRoute()

const pageTitle = computed(() => seoConfig.pages.termsOfService.title)
const pageDescription = computed(() => seoConfig.pages.termsOfService.description)
const canonicalUrl = computed(() => `${seoConfig.siteUrl}${route.path}`)
const ogLocale = computed(() => locale.value === 'id' ? 'id_ID' : locale.value)

// Breadcrumb Schema - Requirements 3.5
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Syarat & Ketentuan' }
])

// Add structured data via useHead - Requirements 3.5
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: schemaToJsonLd(breadcrumbSchema)
    }
  ]
})
</script>
