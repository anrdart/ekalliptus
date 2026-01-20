<template>
  <section id="home" class="relative flex min-h-[calc(100vh-6rem)] items-center overflow-hidden px-4 scroll-mt-28 lg:scroll-mt-32">
    <div
      ref="heroRef"
      class="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-12 py-16"
    >
      <div
        class="w-full text-center transition-all duration-700 ease-smooth"
        :class="[inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']"
        :style="{ transitionDelay: '120ms' }"
      >
        <!-- H1 Title -->
        <h1 class="font-bold text-foreground mb-6" style="font-size: clamp(1.5rem, 5vw, 3.5rem);">
          Ekalliptus Digital
        </h1>

        <!-- Subtitle -->
        <p class="text-lg md:text-xl leading-relaxed text-foreground/70 max-w-3xl mx-auto">
          {{ $t('index.intro.subtitle') }}
        </p>

        <!-- CTA Buttons -->
        <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <NuxtLink
            to="/order"
            class="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold uppercase tracking-wide text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:scale-105 cursor-interactive"
          >
            {{ $t('hero.startProject') }}
            <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </NuxtLink>

          <a
            href="https://me.ekalliptus.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/20 px-6 py-4 text-base font-semibold text-foreground/80 transition hover:border-border/50 hover:bg-card/30 cursor-interactive"
          >
            <Play class="h-4 w-4" />
            {{ $t('hero.profile') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, Play } from 'lucide-vue-next'

const heroRef = ref<HTMLElement | null>(null)
const inView = ref(false)

onMounted(() => {
  if (!heroRef.value) return
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      inView.value = entry.isIntersecting
    },
    { threshold: 0.35 }
  )
  
  observer.observe(heroRef.value)
  
  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>
