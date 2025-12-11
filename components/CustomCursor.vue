<template>
  <div
    v-if="!isTouch"
    ref="cursorRef"
    class="pointer-events-none fixed z-[9999] mix-blend-difference"
    :style="cursorStyle"
  >
    <!-- Outer ring -->
    <div
      class="absolute rounded-full border-2 border-white transition-all duration-200 ease-out"
      :class="[
        isHovering ? 'w-12 h-12 -translate-x-1/2 -translate-y-1/2 opacity-50' : 'w-8 h-8 -translate-x-1/2 -translate-y-1/2 opacity-80'
      ]"
    />
    
    <!-- Inner dot -->
    <div
      class="absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-all duration-100"
      :class="[isHovering ? 'scale-0' : 'scale-100']"
    />
  </div>
</template>

<script setup lang="ts">
const cursorRef = ref<HTMLDivElement | null>(null)
const isTouch = ref(true)
const isHovering = ref(false)
const position = ref({ x: 0, y: 0 })

const cursorStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  transform: 'translate(-50%, -50%)'
}))

const handleMouseMove = (e: MouseEvent) => {
  position.value = { x: e.clientX, y: e.clientY }
}

const handleMouseOver = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const interactive = target.closest('.cursor-interactive, a, button, [role="button"], input, textarea, select')
  isHovering.value = !!interactive
}

onMounted(() => {
  if (typeof window === 'undefined') return
  
  // Detect touch device
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.matchMedia('(max-width: 768px)').matches
  isTouch.value = coarse || narrow
  
  if (!isTouch.value) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    
    // Hide default cursor
    document.body.style.cursor = 'none'
    
    // Add cursor-none to all interactive elements
    const style = document.createElement('style')
    style.textContent = `
      a, button, [role="button"], input, textarea, select, .cursor-interactive {
        cursor: none !important;
      }
    `
    document.head.appendChild(style)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined' && !isTouch.value) {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseover', handleMouseOver)
    document.body.style.cursor = ''
  }
})
</script>
