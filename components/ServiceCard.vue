<template>
  <div
    ref="cardRef"
    class="glass-panel neon-border rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
    :class="[inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <!-- Icon -->
    <div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
      <component :is="icon" class="h-7 w-7 text-primary" />
    </div>

    <!-- Title -->
    <h3 class="mb-3 text-xl font-semibold text-foreground">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="mb-4 text-sm text-muted-foreground leading-relaxed">
      {{ description }}
    </p>

    <!-- Features List -->
    <ul v-if="features.length > 0" class="space-y-2">
      <li
        v-for="(feature, index) in features.slice(0, 3)"
        :key="index"
        class="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Check class="h-4 w-4 text-primary flex-shrink-0" />
        <span>{{ feature }}</span>
      </li>
    </ul>

    <!-- CTA -->
    <NuxtLink
      to="/order"
      class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-interactive"
    >
      {{ $t('services.orderNow', 'Pesan Sekarang') }}
      <ArrowRight class="h-4 w-4" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { Check, ArrowRight } from 'lucide-vue-next'
import type { Component } from 'vue'

interface Props {
  icon: Component
  title: string
  description: string
  features?: string[]
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  features: () => [],
  delay: 0
})

const cardRef = ref<HTMLElement | null>(null)
const inView = ref(false)

onMounted(() => {
  if (!cardRef.value) return
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        inView.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.1 }
  )
  
  observer.observe(cardRef.value)
  
  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>
