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
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-xs uppercase tracking-[0.35em] text-foreground/70 shadow-lg shadow-primary/10">
          <Sparkles class="h-4 w-4" />
          <span>{{ $t('hero.solusiDigital') }}</span>
        </div>

        <!-- Description -->
        <p class="mt-6 text-lg leading-relaxed text-foreground/70 md:text-xl">
          {{ $t('hero.description') }}
        </p>

        <!-- Typewriter -->
        <p class="mt-4 text-sm font-medium uppercase tracking-[0.4em] text-foreground/50">
          {{ $t('hero.fokus') }}
          <span class="ml-3 rounded-full bg-card/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
            {{ displayText }}
          </span>
        </p>

        <!-- CTA Buttons - Removed gradient -->
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
import { Sparkles, ArrowRight, Play } from 'lucide-vue-next'

const { t, locale } = useI18n()

const heroRef = ref<HTMLElement | null>(null)
const inView = ref(false)
const displayText = ref('')
const currentWordIndex = ref(0)

// Reactive words that update when locale changes
const words = computed(() => [
  t('hero.uiUxDesign'),
  t('hero.digitalExperience'),
  t('hero.web3d'),
  t('hero.branding')
])

// Initialize displayText
onMounted(() => {
  if (!heroRef.value) return
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      inView.value = entry.isIntersecting
    },
    { threshold: 0.35 }
  )
  
  observer.observe(heroRef.value)
  
  let charIndex = 0
  let isDeleting = false
  let timeoutId: ReturnType<typeof setTimeout>
  
  // Initialize with first word
  displayText.value = words.value[0]
  
  const typeWriter = () => {
    const currentWord = words.value[currentWordIndex.value]
    
    if (isDeleting) {
      displayText.value = currentWord.substring(0, charIndex - 1)
      charIndex--
    } else {
      displayText.value = currentWord.substring(0, charIndex + 1)
      charIndex++
    }
    
    let timeout = isDeleting ? 40 : 80
    
    if (!isDeleting && charIndex === currentWord.length) {
      timeout = 1400
      isDeleting = true
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false
      currentWordIndex.value = (currentWordIndex.value + 1) % words.value.length
      timeout = 500
    }
    
    timeoutId = setTimeout(typeWriter, timeout)
  }
  
  timeoutId = setTimeout(typeWriter, 1000)
  
  onUnmounted(() => {
    observer.disconnect()
    clearTimeout(timeoutId)
  })
})

// Reset typewriter when locale changes
watch(locale, () => {
  displayText.value = words.value[currentWordIndex.value]
})
</script>
