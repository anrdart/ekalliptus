<template>
  <div>
    <Head>
      <Title>{{ $t('orderSuccess.title', 'Pesanan Berhasil') }} - ekalliptus</Title>
    </Head>

    <div class="min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full text-center">
        <div class="glass-panel neon-border rounded-3xl p-8 md:p-12">
          <!-- Success Icon -->
          <div class="mx-auto mb-6 h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle class="h-10 w-10 text-green-500" />
          </div>

          <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {{ $t('orderSuccess.heading', 'Terima Kasih!') }}
          </h1>

          <p class="text-muted-foreground mb-8">
            {{ $t('orderSuccess.message', 'Permintaan Anda telah berhasil dikirim. Tim kami akan menghubungi Anda dalam 1x24 jam melalui WhatsApp atau Email.') }}
          </p>

          <div class="space-y-4">
            <NuxtLink
              to="/"
              class="block w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-interactive"
            >
              {{ $t('orderSuccess.backHome', 'Kembali ke Beranda') }}
            </NuxtLink>

            <a
              href="https://wa.me/6281999900306"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-border/30 bg-card/20 px-6 py-3 font-semibold text-foreground transition hover:bg-card/30 cursor-interactive"
            >
              <Phone class="h-5 w-5 text-green-500" />
              {{ $t('orderSuccess.contactWhatsApp', 'Hubungi via WhatsApp') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, Phone } from 'lucide-vue-next'
</script>
