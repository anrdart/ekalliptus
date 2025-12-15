<script setup lang="ts">
/**
 * Default OG Image Component for ekalliptus
 * Used by nuxt-og-image to generate social sharing images
 * Dimensions: 1200x630px (standard OG image size)
 * Requirements: 2.5
 */
withDefaults(defineProps<{
  title?: string
  description?: string
  siteName?: string
  siteUrl?: string
}>(), {
  title: 'ekalliptus',
  description: 'Digital Agency Indonesia',
  siteName: 'ekalliptus',
  siteUrl: 'ekalliptus.com'
})
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
       style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
    
    <!-- Decorative gradient orbs -->
    <div class="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
         style="background: radial-gradient(circle, #2dd4bf 0%, transparent 70%); transform: translate(-30%, -30%);"></div>
    <div class="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-8"
         style="background: radial-gradient(circle, #34d399 0%, transparent 70%); transform: translate(30%, 30%);"></div>
    <div class="absolute top-20 right-40 w-48 h-48 rounded-full opacity-6"
         style="background: radial-gradient(circle, #2dd4bf 0%, transparent 70%);"></div>
    
    <!-- Glass panel container -->
    <div class="relative z-10 flex flex-col items-center justify-center px-20 py-16 mx-24 rounded-3xl"
         style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);">
      
      <!-- Logo circle -->
      <div class="flex items-center justify-center w-36 h-36 rounded-full mb-8"
           style="background: #1e293b; border: 3px solid transparent; background-image: linear-gradient(#1e293b, #1e293b), linear-gradient(90deg, #2dd4bf, #34d399, #2dd4bf); background-origin: border-box; background-clip: padding-box, border-box;">
        <span class="text-7xl font-bold"
              style="background: linear-gradient(90deg, #2dd4bf, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">e</span>
      </div>
      
      <!-- Brand name -->
      <h1 class="text-6xl font-bold text-white mb-4 tracking-tight">
        {{ siteName }}
      </h1>
      
      <!-- Tagline -->
      <p class="text-3xl mb-3" style="color: #94a3b8;">
        {{ description }}
      </p>
      
      <!-- Services -->
      <p class="text-xl mb-8" style="color: #64748b;">
        Web Development • Mobile App • WordPress • Multimedia
      </p>
      
      <!-- Accent line -->
      <div class="w-72 h-1 rounded-full mb-8 opacity-60"
           style="background: linear-gradient(90deg, #2dd4bf, #34d399, #2dd4bf);"></div>
      
      <!-- Website URL -->
      <p class="text-2xl font-medium" style="color: #2dd4bf;">
        {{ siteUrl }}
      </p>
    </div>
  </div>
</template>
