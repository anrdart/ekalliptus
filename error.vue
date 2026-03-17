<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full text-center">
      <div class="glass-panel neon-border rounded-3xl p-8 md:p-12">
        <!-- 404 Icon -->
        <div class="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
          <FileQuestion class="h-10 w-10 text-primary" />
        </div>

        <h1 class="text-6xl font-bold text-foreground mb-4">404</h1>

        <h2 class="text-xl font-semibold text-foreground mb-4">
          {{ $t('notFound.title', 'Halaman Tidak Ditemukan') }}
        </h2>

        <p class="text-muted-foreground mb-8">
          {{ $t('notFound.message', 'Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.') }}
        </p>

        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-interactive"
        >
          <Home class="h-5 w-5" />
          {{ $t('notFound.backHome', 'Kembali ke Beranda') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileQuestion, Home } from 'lucide-vue-next'

const error = useError()

const handleClearError = () => clearError({ redirect: '/' })

if (error.value) {
  console.error('Application error:', error.value)
}
</script>
