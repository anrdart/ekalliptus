<template>
  <div>
    <Head>
      <Title>{{ $t('privacyPolicy.title', 'Kebijakan Privasi') }} - ekalliptus</Title>
    </Head>

    <div class="min-h-screen py-12 px-4">
      <div class="max-w-3xl mx-auto">
        <div class="glass-panel neon-border rounded-3xl p-8 md:p-12">
          <h1 class="text-3xl font-bold text-foreground mb-8">
            {{ $t('privacyPolicy.title', 'Kebijakan Privasi') }}
          </h1>

          <div class="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>
              {{ $t('privacyPolicy.intro', 'Terakhir diperbarui: Desember 2024') }}
            </p>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">1. Informasi yang Kami Kumpulkan</h2>
              <p>
                Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, termasuk nama, email, nomor telepon, dan detail proyek saat Anda mengirimkan formulir pemesanan.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">2. Penggunaan Informasi</h2>
              <p>
                Informasi yang dikumpulkan digunakan untuk memproses pesanan, berkomunikasi dengan Anda, dan meningkatkan layanan kami.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">3. Keamanan Data</h2>
              <p>
                Kami mengimplementasikan langkah-langkah keamanan untuk melindungi informasi pribadi Anda dari akses tidak sah.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">4. Berbagi Informasi</h2>
              <p>
                Kami tidak menjual, memperdagangkan, atau mentransfer informasi pribadi Anda kepada pihak luar tanpa persetujuan Anda.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-foreground mb-3">5. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di ekalliptus@gmail.com.
              </p>
            </section>
          </div>

          <div class="mt-8 pt-8 border-t border-border/30">
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-interactive"
            >
              <ArrowLeft class="h-4 w-4" />
              {{ $t('common.backHome', 'Kembali ke Beranda') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
</script>
