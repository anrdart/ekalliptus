<template>
  <div>
    <!-- Loading overlay -->
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 transition-opacity duration-500"
        :style="{
          zIndex: -10,
          backgroundColor: isDark ? '#412020' : '#bebebe'
        }"
      >
        <div class="absolute inset-0 flex items-center justify-center">
          <div 
            class="animate-pulse text-sm opacity-30"
            :style="{ color: isDark ? '#8ca13' : '#14ca18' }"
          >
            Loading background...
          </div>
        </div>
      </div>
    </Transition>

    <!-- Mobile: Static gradient fallback (saves ~600KB) -->
    <div
      v-if="isMobile"
      class="fixed inset-0 transition-opacity duration-1000"
      :style="{
        width: '100vw',
        height: '100vh',
        zIndex: -10,
        background: isDark
          ? 'radial-gradient(ellipse 120% 80% at 50% -20%, #1e293b 0%, #0c1222 50%, #020617 100%)'
          : 'radial-gradient(ellipse 120% 80% at 50% -20%, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)',
        backgroundAttachment: 'fixed',
        opacity: isLoading ? 0 : 1
      }"
    />

    <!-- Desktop: VantaJS NET effect -->
    <div
      v-else
      ref="vantaRef"
      class="fixed inset-0 transition-opacity duration-1000"
      :style="{
        width: '100vw',
        height: '100vh',
        zIndex: -10,
        opacity: isLoading ? 0 : 1
      }"
    />
  </div>
</template>

<script setup lang="ts">
interface VantaEffect {
  destroy: () => void
  setOptions: (options: Record<string, unknown>) => void
}

declare global {
  interface Window {
    VANTA: {
      NET: (options: Record<string, unknown>) => VantaEffect
    }
    THREE: unknown
  }
}

const colorMode = useColorMode()
const vantaRef = ref<HTMLDivElement | null>(null)
const vantaEffect = ref<VantaEffect | null>(null)
const isLoading = ref(true)
const isMobile = ref(false)

const isDark = computed(() => colorMode.value === 'dark')

// Dark mode config - subtle cyan-teal on deep blue for liquid glass
const darkConfig = {
  color: 0x38bdf8,
  backgroundColor: 0x0c1222,
  maxDistance: 17.0,
  spacing: 22.0
}

// Light mode config - soft teal on frost white for liquid glass  
const lightConfig = {
  color: 0x2dd4bf,
  backgroundColor: 0xf1f5f9,
  maxDistance: 17.0,
  spacing: 24.0
}

const getVantaConfig = () => ({
  el: vantaRef.value,
  THREE: window.THREE,
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.0,
  minWidth: 200.0,
  scale: 1.0,
  scaleMobile: 1.0,
  ...(isDark.value ? darkConfig : lightConfig)
})

const initVanta = () => {
  if (!vantaRef.value || vantaEffect.value) return
  
  if (!window.VANTA || !window.THREE) {
    console.warn('Vanta or Three.js not loaded yet')
    return
  }

  try {
    const effect = window.VANTA.NET(getVantaConfig())
    vantaEffect.value = effect
    console.log('Vanta NET effect initialized')
    
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  } catch (error) {
    console.error('Vanta initialization error:', error)
    isLoading.value = false
  }
}

const updateVantaTheme = () => {
  if (vantaEffect.value) {
    const config = isDark.value ? darkConfig : lightConfig
    vantaEffect.value.setOptions(config)
    console.log('Vanta theme updated to:', isDark.value ? 'dark' : 'light')
  }
}

// Check for mobile device
const checkMobile = () => {
  if (typeof window === 'undefined') return
  
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.matchMedia('(max-width: 768px)').matches
  isMobile.value = coarse || narrow
}

onMounted(() => {
  checkMobile()
  
  if (isMobile.value) {
    setTimeout(() => {
      isLoading.value = false
    }, 500)
    return
  }

  // Wait for scripts to load
  const checkScripts = () => {
    if (window.VANTA && window.THREE) {
      initVanta()
    } else {
      setTimeout(checkScripts, 100)
    }
  }
  
  // Start checking after a brief delay
  setTimeout(checkScripts, 200)
  
  // Handle window resize
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  if (vantaEffect.value) {
    vantaEffect.value.destroy()
    vantaEffect.value = null
  }
  
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkMobile)
  }
})

// Watch for theme changes
watch(isDark, () => {
  updateVantaTheme()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
