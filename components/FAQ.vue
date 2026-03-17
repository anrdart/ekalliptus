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
            :aria-expanded="openItems.includes(index)"
            :aria-controls="`faq-content-${index}`"
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
              :id="`faq-content-${index}`"
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
import { generateFAQPageSchema, schemaToJsonLd } from '~/composables/useStructuredData'

interface FaqItem {
  question: string
  answer: string
}

const openItems = ref<number[]>([0])

// Get FAQ items from i18n translations - supports all languages
const { t, locale } = useI18n()

// Number of FAQ items (same across all languages)
const FAQ_COUNT = 8

const faqItems = computed<FaqItem[]>(() => {
  const items: FaqItem[] = []
  for (let i = 0; i < FAQ_COUNT; i++) {
    const question = t(`faq.items[${i}].question`)
    const answer = t(`faq.items[${i}].answer`)
    if (question && !question.includes('faq.items[')) {
      items.push({ question, answer })
    }
  }
  return items
})

const faqSchemaJson = computed(() => {
  const faqSchema = generateFAQPageSchema(faqItems.value)
  return schemaToJsonLd(faqSchema)
})

useHead(computed(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: faqSchemaJson.value,
      key: 'faq-schema'
    }
  ]
})))

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
/* Accordion animation - uses max-height for variable content height */
/* will-change hints browser for smoother animation */
.accordion-enter-active,
.accordion-leave-active {
  transition: opacity 0.3s ease, max-height 0.3s ease, padding 0.3s ease;
  overflow: hidden;
  will-change: opacity, max-height;
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
