<template>
  <header class="pointer-events-none fixed left-1/2 top-0 z-40 w-full max-w-4xl -translate-x-1/2 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3">
    <div
      class="pointer-events-auto flex items-center justify-between rounded-full px-5 py-3 transition-all duration-300 border border-border/50"
      :class="[scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background/80 backdrop-blur-sm hover:bg-background/90']"
    >
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="cursor-interactive flex items-center space-x-3 rounded-full px-4 py-2 transition text-foreground"
      >
        <img
          src="/ekalliptus_rounded.webp"
          alt="ekalliptus - Digital Agency Indonesia Logo"
          width="32"
          height="32"
          class="h-8 w-auto transition-opacity hover:opacity-90"
          loading="eager"
          fetchpriority="high"
        />
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden items-center gap-1 md:flex">
        <button
          v-for="item in sectionLinks"
          :key="item.hash"
          type="button"
          @click="navigateToSection(item.hash)"
          class="cursor-interactive rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
        >
          {{ $t(`nav.${item.key}`) }}
        </button>
      </nav>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-2">
        <!-- Theme Toggle (Desktop) -->
        <button
          @click="toggleTheme"
          class="cursor-interactive hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-card/20 md:flex"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Moon v-if="!isDark" class="h-4 w-4" />
          <Sun v-else class="h-4 w-4" />
        </button>

        <!-- Language Switcher (Desktop) -->
        <button
          @click="languageModalOpen = true"
          class="cursor-interactive hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-card/20 md:flex"
          aria-label="Change language"
        >
          <span class="text-base">{{ currentLanguage.flag }}</span>
          <span class="hidden lg:inline text-xs">{{ currentLanguage.nativeName }}</span>
          <Languages class="h-4 w-4" />
        </button>

        <!-- Mobile Menu Toggle -->
        <button
          @click="menuOpen = !menuOpen"
          class="cursor-interactive flex h-10 w-10 items-center justify-center rounded-full glass-panel transition md:hidden"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        >
          <X v-if="menuOpen" class="h-5 w-5" />
          <Menu v-else class="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Menu -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
        @click="menuOpen = false"
      />
    </Transition>
    
    <Transition name="slide-down">
      <div
        v-if="menuOpen"
        class="fixed inset-x-4 top-16 z-40 rounded-2xl border border-border bg-card p-4 shadow-lg md:hidden"
      >
        <!-- Section Links -->
        <nav class="flex flex-col gap-1">
          <button
            v-for="item in sectionLinks"
            :key="item.hash"
            type="button"
            @click="navigateToSection(item.hash)"
            class="cursor-interactive rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground"
          >
            {{ $t(`nav.${item.key}`) }}
          </button>
          
          <div class="my-2 border-t border-border" />
          
          <NuxtLink
            to="/privacy-policy"
            class="cursor-interactive rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            @click="menuOpen = false"
          >
            {{ $t('privacyPolicy.title') }}
          </NuxtLink>
          
          <NuxtLink
            to="/terms-of-service"
            class="cursor-interactive rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            @click="menuOpen = false"
          >
            {{ $t('termsOfService.title') }}
          </NuxtLink>
        </nav>

        <div class="my-3 border-t border-border" />

        <!-- Language Selector -->
        <div class="space-y-2">
          <span class="px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {{ $t('nav.language') }}
          </span>
          <div class="grid grid-cols-2 gap-2 px-2">
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
              :class="[
                locale === lang.code
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              ]"
            >
              <span class="text-base">{{ lang.flag }}</span>
              <span class="text-xs">{{ lang.name }}</span>
            </button>
          </div>
        </div>

        <div class="my-3 border-t border-border" />

        <!-- CTA Button -->
        <NuxtLink
          to="/order"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          @click="menuOpen = false"
        >
          {{ $t('nav.consultation') }}
          <ArrowUpRight class="h-4 w-4" />
        </NuxtLink>

        <!-- Theme Toggle (Mobile) -->
        <button
          @click="toggleTheme"
          class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-medium transition cursor-interactive hover:bg-accent"
        >
          <Moon v-if="!isDark" class="h-4 w-4" />
          <Sun v-else class="h-4 w-4" />
          {{ isDark ? $t('nav.lightMode', 'Mode Terang') : $t('nav.darkMode', 'Mode Gelap') }}
        </button>
      </div>
    </Transition>
  </Teleport>

  <!-- Language Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="languageModalOpen"
        class="fixed inset-0 z-50 modal-backdrop"
        @click="languageModalOpen = false"
      />
    </Transition>
    
    <Transition name="zoom">
      <div
        v-if="languageModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="w-full max-w-sm rounded-2xl language-modal p-6 shadow-2xl">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-foreground">
              {{ $t('nav.selectLanguage') }}
            </h3>
            <button
              @click="languageModalOpen = false"
              class="h-8 w-8 rounded-full flex items-center justify-center cursor-interactive hover:bg-card/20"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Language Grid -->
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              class="language-button group flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-all duration-300"
              :class="[
                locale === lang.code
                  ? 'language-active text-primary'
                  : 'text-foreground hover:bg-card/30 border-2 border-transparent hover:border-primary/20'
              ]"
            >
              <span class="language-flag text-3xl group-hover:scale-110 transition-transform duration-300">
                {{ lang.flag }}
              </span>
              <div class="flex flex-col items-center">
                <span class="language-text text-sm font-medium leading-tight">{{ lang.nativeName }}</span>
                <span class="text-xs text-muted-foreground leading-tight">{{ lang.name }}</span>
              </div>
              <div v-if="locale === lang.code" class="mt-1">
                <div class="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
            </button>
          </div>

          <!-- Footer hint -->
          <div class="mt-4 text-center">
            <p class="text-xs text-muted-foreground">
              {{ $t('nav.languageHint', 'Language preference will be saved automatically') }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Menu, X, Moon, Sun, ArrowUpRight, Languages } from 'lucide-vue-next'

type LocaleCode = 'id' | 'en' | 'ja' | 'ko' | 'ru' | 'ar' | 'tr'

const { locale, setLocale } = useI18n()
const colorMode = useColorMode()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const languageModalOpen = ref(false)
const scrolled = ref(false)

const isDark = computed(() => colorMode.value === 'dark')

const sectionLinks = [
  { key: 'home', hash: '#home' },
  { key: 'services', hash: '#services' },
  { key: 'about', hash: '#about' },
  { key: 'contact', hash: '#contact' }
]

const languages: { code: LocaleCode; name: string; flag: string; nativeName: string }[] = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', nativeName: 'Indonesia' },
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' }
]

const currentLanguage = computed(() => {
  return languages.find(lang => lang.code === locale.value) || languages[0]
})

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const changeLanguage = async (code: LocaleCode) => {
  await setLocale(code)
  languageModalOpen.value = false
  menuOpen.value = false
}

const navigateToSection = (hash: string) => {
  const id = hash.replace('#', '')
  
  if (route.path !== '/') {
    router.push(`/${hash}`)
  } else {
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  menuOpen.value = false
}

// Scroll detection
onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 32
  }
  
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  
  // Keyboard escape for modals
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      languageModalOpen.value = false
      menuOpen.value = false
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('keydown', handleKeydown)
  })
})

// Close menu on route change
watch(() => route.path, () => {
  menuOpen.value = false
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.2s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
