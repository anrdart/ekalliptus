<template>
  <Transition name="fade">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      <div class="flex flex-col items-center gap-6">
        <!-- Logo -->
        <div class="relative">
          <img
            src="/ekalliptus_rounded.webp"
            alt="ekalliptus"
            class="h-20 w-20 animate-pulse"
          />
          <!-- Glow effect -->
          <div class="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        </div>
        
        <!-- Loading text -->
        <div class="flex items-center gap-2 text-muted-foreground">
          <span class="text-sm uppercase tracking-[0.3em]">Loading</span>
          <div class="flex gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 0ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 150ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const isLoading = ref(true)

onMounted(() => {
  // Minimum display time for preloader
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
  
  // Also hide when page fully loaded
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        isLoading.value = false
      }, 500)
    })
  }
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
