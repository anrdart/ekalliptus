<template>
  <section id="contact" class="content-vis relative px-4 py-24">
    <div class="relative z-10 mx-auto max-w-4xl">
      <div class="glass-panel neon-border rounded-3xl p-8 md:p-12 text-center">
        <!-- Header -->
        <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-primary mb-6">
          <MessageCircle class="h-4 w-4" />
          <span>{{ $t('contactCTA.title') }}</span>
        </div>
        
        <h2 class="text-3xl font-semibold text-foreground md:text-4xl mb-4">
          {{ $t('contactCTA.title') }}
        </h2>
        
        <p class="text-muted-foreground mb-8 max-w-2xl mx-auto">
          {{ $t('contactCTA.description') }}
        </p>

        <!-- Contact Options -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <!-- WhatsApp -->
          <a
            href="https://wa.me/6281999900306"
            target="_blank"
            rel="noopener noreferrer"
            class="glass-panel rounded-2xl p-6 hover:bg-card/30 transition-all cursor-interactive group"
          >
            <div class="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Phone class="h-6 w-6 text-green-500" />
            </div>
            <h3 class="font-semibold text-foreground mb-1">WhatsApp</h3>
            <p class="text-sm text-muted-foreground">{{ $t('contactCTA.contact.phone') }}</p>
          </a>

          <!-- Email -->
          <a
            href="mailto:ekalliptus@gmail.com"
            class="glass-panel rounded-2xl p-6 hover:bg-card/30 transition-all cursor-interactive group"
          >
            <div class="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Mail class="h-6 w-6 text-primary" />
            </div>
            <h3 class="font-semibold text-foreground mb-1">Email</h3>
            <p class="text-sm text-muted-foreground">ekalliptus@gmail.com</p>
          </a>

          <!-- Location -->
          <div class="glass-panel rounded-2xl p-6">
            <div class="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <MapPin class="h-6 w-6 text-secondary" />
            </div>
            <h3 class="font-semibold text-foreground mb-1">Lokasi</h3>
            <p class="text-sm text-muted-foreground">Tegal, Indonesia</p>
          </div>
        </div>

        <!-- CTA Button -->
        <NuxtLink
          to="/order"
          class="group inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-lg font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:scale-105 cursor-interactive"
        >
          {{ $t('contactCTA.buttons.whatsapp') }}
          <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </NuxtLink>

        <!-- Operating Hours -->
        <p class="mt-6 text-sm text-muted-foreground">
          🕒 Tersedia 24/7 untuk konsultasi
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { MessageCircle, Phone, Mail, MapPin, ArrowRight } from 'lucide-vue-next'
</script>
