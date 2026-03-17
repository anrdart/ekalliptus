<template>
  <section id="services" class="content-vis relative px-4 py-24">
    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="pointer-events-none fx-bubble absolute left-[5%] top-[10%] h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
      <div class="pointer-events-none fx-bubble absolute right-[10%] bottom-[20%] h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl">
      <!-- Section Header -->
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <div class="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground mb-6">
          <span>{{ $t('services.pill') }}</span>
        </div>
        <h2 class="text-4xl font-semibold text-foreground md:text-5xl mb-4">
          {{ $t('services.title') }}
        </h2>
        <p class="text-lg text-muted-foreground">
          {{ $t('services.subtitle') }}
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ServiceCard
          v-for="(service, index) in services"
          :key="service.key"
          :icon="service.icon"
          :title="$t(`services.cards.${service.key}.title`)"
          :description="$t(`services.cards.${service.key}.description`)"
          :features="getFeatures(service.key)"
          :delay="index * 100"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Globe, Smartphone, Palette, Video, Monitor, Wrench } from 'lucide-vue-next'
import { generateServicesSchemas, schemaToJsonLd } from '~/composables/useStructuredData'
import type { ServiceInput } from '~/composables/useStructuredData'

const { t } = useI18n()

const services = [
  { key: 'websiteDevelopment', icon: Globe },
  { key: 'mobileAppDevelopment', icon: Smartphone },
  { key: 'wordpressDevelopment', icon: Palette },
  { key: 'photoVideoEditing', icon: Video },
  { key: 'berduPlatform', icon: Monitor },
  { key: 'serviceHpLaptop', icon: Wrench }
]

// Service data for structured data (Requirements 3.3)
const serviceSchemaData: ServiceInput[] = [
  {
    name: 'Website Development',
    description: 'Jasa pembuatan website profesional, responsif, dan SEO-friendly untuk bisnis Indonesia',
    serviceType: 'WebDevelopment'
  },
  {
    name: 'Mobile App Development',
    description: 'Pengembangan aplikasi mobile Android dan iOS dengan React Native dan Flutter',
    serviceType: 'MobileAppDevelopment'
  },
  {
    name: 'WordPress Development',
    description: 'Kustomisasi WordPress dengan tema dan plugin sesuai kebutuhan bisnis',
    serviceType: 'WebDevelopment'
  },
  {
    name: 'Photo & Video Editing',
    description: 'Editing foto dan video profesional untuk konten marketing dan social media',
    serviceType: 'MediaEditing'
  },
  {
    name: 'Berdu Platform',
    description: 'Solusi platform berdu yang powerful untuk kebutuhan bisnis modern',
    serviceType: 'PlatformService'
  },
  {
    name: 'Service HP & Laptop',
    description: 'Perbaikan dan maintenance perangkat HP dan laptop dengan teknisi berpengalaman',
    serviceType: 'DeviceRepair'
  }
]

// Generate Service schemas for structured data
const serviceSchemas = generateServicesSchemas(serviceSchemaData)

// Inject Service schemas into head (Requirements 3.3)
useHead({
  script: serviceSchemas.map(schema => ({
    type: 'application/ld+json',
    innerHTML: schemaToJsonLd(schema)
  }))
})

const featuresCache = new Map<string, string[]>()

const getFeatures = (key: string): string[] => {
  if (featuresCache.has(key)) {
    return featuresCache.get(key)!
  }
  
  const features: string[] = []
  for (let i = 0; i < 10; i++) {
    const feature = t(`services.cards.${key}.features[${i}]`)
    if (feature && !feature.includes(`features[${i}]`)) {
      features.push(feature)
    } else {
      break
    }
  }
  
  featuresCache.set(key, features)
  return features
}
</script>

