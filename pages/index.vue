<template>
  <div>
    <!-- SEO Head -->
    <Head>
      <Title>ekalliptus - Digital Agency Indonesia | Web Development & Mobile App</Title>
      <Meta name="description" content="Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing. Transformasi bisnis Anda dengan teknologi terdepan." />
      <Meta name="keywords" content="digital agency indonesia, web development, wordpress, mobile app, website development indonesia" />
      <Link rel="canonical" href="https://ekalliptus.id/" />
      
      <!-- Open Graph -->
      <Meta property="og:title" content="ekalliptus - Digital Agency Indonesia" />
      <Meta property="og:description" content="Digital agency Indonesia spesialis website development, WordPress, mobile app, dan multimedia editing. Transformasi bisnis Anda dengan teknologi terdepan." />
      <Meta property="og:type" content="website" />
      <Meta property="og:url" content="https://ekalliptus.id/" />
      <Meta property="og:image" content="https://ekalliptus.id/og-image.webp" />
      <Meta property="og:locale" content="id_ID" />
      
      <!-- Twitter -->
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content="ekalliptus - Digital Agency Indonesia" />
      <Meta name="twitter:description" content="Digital agency Indonesia untuk website, WordPress, mobile app, dan editing profesional." />
    </Head>

    <div class="relative flex flex-col gap-24 pb-24">
      <!-- Hero Section -->
      <Hero />

      <!-- Intro -->
      <div class="text-center py-8 px-4">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {{ $t('index.intro.title') }}
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          {{ $t('index.intro.subtitle') }}
        </p>
      </div>

      <!-- Services Section -->
      <Services />

      <!-- FAQ Section -->
      <FAQ />

      <!-- About Section -->
      <section id="about" class="content-vis relative px-4 py-24">
        <div class="absolute inset-0">
          <div class="pointer-events-none fx-bubble absolute left-[10%] top-[15%] h-40 w-40 rounded-full border border-border/20 bg-card/10 blur-3xl" />
          <div class="pointer-events-none fx-bubble absolute right-[15%] top-[25%] h-32 w-32 rounded-full border border-border/20 bg-emerald-400/10 blur-3xl" />
          <div class="pointer-events-none fx-bubble floating absolute bottom-[20%] left-[20%] h-36 w-36 rounded-full border border-border/20 bg-primary/10 blur-[70px]" />
        </div>

        <div class="relative z-10 mx-auto max-w-6xl">
          <div class="mx-auto mb-16 max-w-4xl text-center">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground mb-6">
              <span>{{ $t('about.title') }}</span>
            </div>
            
            <h2 class="text-4xl font-semibold text-foreground md:text-5xl mb-8">
              {{ $t('index.about.heading') }}
            </h2>

            <!-- Stats Grid -->
            <div class="glass-panel neon-border rounded-3xl p-8 md:p-12 shadow-elegant mb-12">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <!-- Features -->
                <div class="space-y-6 text-left">
                  <div class="flex items-start gap-4">
                    <div class="rounded-full bg-primary p-3 mt-1">
                      <Zap class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-semibold text-foreground mb-2">{{ $t('about.innovation') }}</h3>
                      <p class="text-muted-foreground leading-relaxed">{{ $t('about.innovationDesc') }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="rounded-full bg-primary p-3 mt-1">
                      <CheckCircle class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-semibold text-foreground mb-2">{{ $t('about.quality') }}</h3>
                      <p class="text-muted-foreground leading-relaxed">{{ $t('about.qualityDesc') }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="rounded-full bg-primary p-3 mt-1">
                      <Users class="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-semibold text-foreground mb-2">{{ $t('about.team') }}</h3>
                      <p class="text-muted-foreground leading-relaxed">{{ $t('about.teamDesc') }}</p>
                    </div>
                  </div>
                </div>

                <!-- Stats Cards -->
                <div class="space-y-6">
                  <div class="glass-panel rounded-2xl p-6 bg-card/10">
                    <div class="text-center">
                      <div class="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">5+</div>
                      <div class="text-sm uppercase tracking-[0.3em] text-muted-foreground">{{ $t('index.stats.experience') }}</div>
                    </div>
                  </div>

                  <div class="glass-panel rounded-2xl p-6 bg-card/10">
                    <div class="text-center">
                      <div class="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">200+</div>
                      <div class="text-sm uppercase tracking-[0.3em] text-muted-foreground">{{ $t('index.stats.clients') }}</div>
                    </div>
                  </div>

                  <div class="glass-panel rounded-2xl p-6 bg-card/10">
                    <div class="text-center">
                      <div class="text-4xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-2">24/7</div>
                      <div class="text-sm uppercase tracking-[0.3em] text-muted-foreground">{{ $t('index.stats.support') }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
              <NuxtLink
                to="/order"
                class="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:scale-105 cursor-interactive"
              >
                <span>{{ $t('index.cta.startProject') }}</span>
                <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </NuxtLink>

              <a
                href="#services"
                class="group inline-flex items-center gap-3 rounded-full border-2 border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 cursor-interactive"
              >
                <span>{{ $t('index.cta.viewServices') }}</span>
                <ArrowDown class="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact CTA -->
      <ContactCTA />

      <!-- Footer -->
      <footer class="border-t border-border/40 bg-card/10 py-8 px-4">
        <div class="mx-auto max-w-6xl">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-sm text-muted-foreground">
              © {{ new Date().getFullYear() }} ekalliptus. All rights reserved.
            </p>
            <div class="flex gap-6">
              <NuxtLink
                to="/privacy-policy"
                class="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {{ $t('privacyPolicy.title') }}
              </NuxtLink>
              <NuxtLink
                to="/terms-of-service"
                class="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {{ $t('termsOfService.title') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Zap, CheckCircle, Users, ArrowRight, ArrowDown } from 'lucide-vue-next'
</script>
