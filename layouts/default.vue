<template>
  <div class="min-h-screen">
    <!-- Vanta Background -->
    <VantaBackground />
    
    <!-- Pre-loader -->
    <PreLoader />
    
    <!-- Custom Cursor (desktop only) -->
    <ClientOnly>
      <CustomCursor />
    </ClientOnly>
    
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main Content -->
    <main class="relative z-0 flex min-h-screen flex-col pt-16 md:pt-20">
      <slot />
    </main>
    
    <!-- Toast notifications -->
    <Toaster />
  </div>
</template>

<script setup lang="ts">
// Default layout for all pages
</script>
