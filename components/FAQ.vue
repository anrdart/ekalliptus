<template>
  <section id="faq" class="content-vis relative px-4 py-24">
    <div class="relative z-10 mx-auto max-w-3xl">
      <!-- Section Header -->
      <div class="mx-auto mb-12 text-center">
        <div class="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground mb-6">
          <span>{{ $t('faq.pill') }}</span>
        </div>
        <h2 class="text-3xl font-semibold text-foreground md:text-4xl">
          {{ $t('faq.title') }}
        </h2>
      </div>

      <!-- FAQ Accordion -->
      <div class="space-y-4">
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="glass-panel rounded-2xl overflow-hidden"
        >
          <button
            @click="toggleItem(index)"
            class="flex w-full items-center justify-between px-6 py-4 text-left cursor-interactive"
          >
            <span class="font-medium text-foreground pr-4">
              {{ item.question }}
            </span>
            <ChevronDown
              class="h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0"
              :class="{ 'rotate-180': openItems.includes(index) }"
            />
          </button>
          
          <Transition name="accordion">
            <div
              v-if="openItems.includes(index)"
              class="px-6 pb-4"
            >
              <p class="text-muted-foreground text-sm leading-relaxed">
                {{ item.answer }}
              </p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Contact CTA -->
      <div class="mt-12 text-center">
        <p class="text-muted-foreground mb-4">
          {{ $t('contactCTA.title') }}
        </p>
        <NuxtLink
          to="/order"
          class="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-interactive"
        >
          {{ $t('footer.contact') }}
          <ArrowRight class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown, ArrowRight } from 'lucide-vue-next'

interface FaqItem {
  question: string
  answer: string
}

const openItems = ref<number[]>([0])

// Hardcode FAQ items for reliability - matches id.json structure
const faqItems = ref<FaqItem[]>([
  {
    question: 'Berapa lama waktu pengerjaan untuk website development?',
    answer: 'Waktu pengerjaan website development bervariasi tergantung kompleksitas proyek. Website company profile sederhana biasanya memakan waktu 2-3 minggu, sedangkan e-commerce atau aplikasi web kompleks dapat memakan waktu 1-3 bulan.'
  },
  {
    question: 'Apakah ekalliptus menyediakan layanan maintenance website setelah launching?',
    answer: 'Ya, kami menyediakan paket maintenance website yang mencakup update rutin, backup data, monitoring keamanan, dan technical support.'
  },
  {
    question: 'Apakah WordPress development cocok untuk bisnis skala besar?',
    answer: 'Absolut! WordPress development yang kami kerjakan dapat di-scale untuk bisnis enterprise dengan custom plugin, optimasi performa tinggi, dan integrasi sistem yang kompleks.'
  },
  {
    question: 'Bagaimana proses order layanan di ekalliptus?',
    answer: 'Proses sangat mudah: (1) Isi form order di website kami, (2) Tim kami menghubungi dalam 24 jam, (3) Kami kirimkan proposal, (4) Mulai development, (5) Testing dan revisi, (6) Launching.'
  },
  {
    question: 'Apakah saya bisa request fitur custom untuk mobile app development?',
    answer: 'Tentu saja! Mobile app development kami sepenuhnya customizable sesuai kebutuhan bisnis Anda dengan React Native dan Flutter.'
  },
  {
    question: 'Apa yang membedakan layanan ekalliptus dengan digital agency lainnya?',
    answer: 'ekalliptus menggabungkan teknologi terkini dengan desain yang user-centric, termasuk elemen 3D, glassmorphism, dan micro-interactions.'
  }
])

const toggleItem = (index: number) => {
  const idx = openItems.value.indexOf(index)
  if (idx > -1) {
    openItems.value.splice(idx, 1)
  } else {
    openItems.value.push(index)
  }
}
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
