<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="glass-panel rounded-xl p-4 shadow-lg animate-slide-in-right"
        :class="toastVariantClass(toast.variant)"
      >
        <div class="flex items-start gap-3">
          <div v-if="toast.variant === 'success'" class="text-green-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div v-else-if="toast.variant === 'error'" class="text-red-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div v-else class="text-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="text-sm font-semibold text-foreground">
              {{ toast.title }}
            </p>
            <p v-if="toast.description" class="text-sm text-muted-foreground mt-1">
              {{ toast.description }}
            </p>
          </div>
          
          <button
            @click="removeToast(toast.id)"
            class="text-muted-foreground hover:text-foreground transition-colors cursor-interactive"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast()

const toastVariantClass = (variant?: string) => {
  switch (variant) {
    case 'success':
      return 'border-green-500/30'
    case 'error':
      return 'border-red-500/30'
    default:
      return 'border-primary/30'
  }
}
</script>

<style scoped>
.toast-enter-active {
  animation: slide-in-right 0.3s ease-out;
}

.toast-leave-active {
  animation: slide-out-right 0.3s ease-out;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
