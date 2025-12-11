<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// App entry point
useHead({
  htmlAttrs: {
    lang: 'id'
  },
  bodyAttrs: {
    class: 'antialiased'
  }
})
</script>
