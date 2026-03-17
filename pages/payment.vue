<template>
  <div>
    <Head>
      <Title>{{ $t('payment.title', 'Pembayaran') }}</Title>
    </Head>

    <div class="min-h-screen py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="glass-panel neon-border rounded-3xl p-6 md:p-10">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <CreditCard class="h-8 w-8 text-primary" />
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {{ $t('payment.heading', 'Pembayaran') }}
            </h1>
            <p class="text-muted-foreground">
              {{ $t('payment.subheading', 'Silakan transfer ke salah satu rekening di bawah ini') }}
            </p>
          </div>

          <!-- Order Summary -->
          <div v-if="orderDetails" class="glass-input rounded-xl p-4 mb-6">
            <h3 class="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Receipt class="h-5 w-5 text-primary" />
              {{ $t('payment.orderSummary', 'Ringkasan Pesanan') }}
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">{{ $t('payment.service', 'Layanan') }}:</span>
                <span class="text-foreground font-medium">{{ orderDetails.serviceName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">{{ $t('payment.orderId', 'ID Pesanan') }}:</span>
                <span class="text-foreground font-mono text-xs">{{ orderDetails.orderId }}</span>
              </div>
              <div v-if="orderDetails.amount" class="flex justify-between pt-2 border-t border-border/30">
                <span class="text-foreground font-semibold">{{ $t('payment.total', 'Total') }}:</span>
                <span class="text-primary font-bold">{{ formatCurrency(orderDetails.amount) }}</span>
              </div>
            </div>
          </div>

          <!-- Bank Accounts -->
          <div class="space-y-4 mb-8">
            <h3 class="font-semibold text-foreground flex items-center gap-2">
              <Building class="h-5 w-5 text-primary" />
              {{ $t('payment.bankAccounts', 'Rekening Pembayaran') }}
            </h3>

            <!-- Bank BTN -->
            <div class="glass-input rounded-xl p-4 hover:bg-card/30 transition">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-foreground">BTN</p>
                    <p class="text-sm text-muted-foreground">{{ $t('payment.accountName', 'a.n') }} HAIKAL AKHALUL AZHAR</p>
                  </div>
                </div>
                <button 
                  @click="copyToClipboard('24101610096960')"
                  class="p-2 rounded-lg hover:bg-primary/10 transition"
                  :title="$t('payment.copy', 'Salin')"
                >
                  <Copy class="h-5 w-5 text-primary" />
                </button>
              </div>
              <div class="font-mono text-lg text-foreground tracking-wider">
                2410-1610-0969-60
              </div>
            </div>

            <!-- Bank BCA -->
            <div class="glass-input rounded-xl p-4 hover:bg-card/30 transition">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-foreground">BCA</p>
                    <p class="text-sm text-muted-foreground">{{ $t('payment.accountName', 'a.n') }} HAIKAL AKHALUL AZHAR</p>
                  </div>
                </div>
                <button 
                  @click="copyToClipboard('7830679108')"
                  class="p-2 rounded-lg hover:bg-primary/10 transition"
                  :title="$t('payment.copy', 'Salin')"
                >
                  <Copy class="h-5 w-5 text-primary" />
                </button>
              </div>
              <div class="font-mono text-lg text-foreground tracking-wider">
                783-067-9108
              </div>
            </div>

            <!-- Bank Mandiri -->
            <div class="glass-input rounded-xl p-4 hover:bg-card/30 transition">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-foreground">Mandiri</p>
                    <p class="text-sm text-muted-foreground">{{ $t('payment.accountName', 'a.n') }} HAIKAL AKHALUL AZHAR</p>
                  </div>
                </div>
                <button 
                  @click="copyToClipboard('1550013969962')"
                  class="p-2 rounded-lg hover:bg-primary/10 transition"
                  :title="$t('payment.copy', 'Salin')"
                >
                  <Copy class="h-5 w-5 text-primary" />
                </button>
              </div>
              <div class="font-mono text-lg text-foreground tracking-wider">
                1550-0139-6996-2
              </div>
            </div>

            <!-- Bank Saqu -->
            <div class="glass-input rounded-xl p-4 hover:bg-card/30 transition">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-foreground">Bank Saqu</p>
                    <p class="text-sm text-muted-foreground">{{ $t('payment.accountName', 'a.n') }} HAIKAL AKHALUL AZHAR</p>
                  </div>
                </div>
                <button 
                  @click="copyToClipboard('10036539556')"
                  class="p-2 rounded-lg hover:bg-primary/10 transition"
                  :title="$t('payment.copy', 'Salin')"
                >
                  <Copy class="h-5 w-5 text-primary" />
                </button>
              </div>
              <div class="font-mono text-lg text-foreground tracking-wider">
                1003-6539-556
              </div>
            </div>

            <!-- Bank Krom -->
            <div class="glass-input rounded-xl p-4 hover:bg-card/30 transition">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-foreground">Bank Krom</p>
                    <p class="text-sm text-muted-foreground">{{ $t('payment.accountName', 'a.n') }} HAIKAL AKHALUL AZHAR</p>
                  </div>
                </div>
                <button 
                  @click="copyToClipboard('770058781909')"
                  class="p-2 rounded-lg hover:bg-primary/10 transition"
                  :title="$t('payment.copy', 'Salin')"
                >
                  <Copy class="h-5 w-5 text-primary" />
                </button>
              </div>
              <div class="font-mono text-lg text-foreground tracking-wider">
                7700-5878-1909
              </div>
            </div>

            <!-- Bank Jago -->
            <div class="glass-input rounded-xl p-4 hover:bg-card/30 transition">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-foreground">Bank Jago</p>
                    <p class="text-sm text-muted-foreground">{{ $t('payment.accountName', 'a.n') }} HAIKAL AKHALUL AZHAR</p>
                  </div>
                </div>
                <button 
                  @click="copyToClipboard('103003007030')"
                  class="p-2 rounded-lg hover:bg-primary/10 transition"
                  :title="$t('payment.copy', 'Salin')"
                >
                  <Copy class="h-5 w-5 text-primary" />
                </button>
              </div>
              <div class="font-mono text-lg text-foreground tracking-wider">
                1030-0300-7030
              </div>
            </div>
          </div>

          <!-- Upload Bukti Pembayaran -->
          <div class="glass-input rounded-xl p-4 mb-6">
            <h3 class="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Upload class="h-5 w-5 text-primary" />
              {{ $t('payment.uploadProof', 'Upload Bukti Pembayaran') }}
            </h3>
            <p class="text-sm text-muted-foreground mb-4">
              {{ $t('payment.uploadDescription', 'Setelah melakukan transfer, silakan upload bukti pembayaran atau kirim via WhatsApp.') }}
            </p>
            
            <div class="flex flex-col sm:flex-row gap-3">
              <a
                :href="`https://wa.me/6281999900306?text=${encodeURIComponent(whatsappMessage)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                <MessageCircle class="h-5 w-5" />
                {{ $t('payment.sendWhatsApp', 'Kirim via WhatsApp') }}
              </a>
            </div>
          </div>

          <!-- Notes -->
          <div class="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 mb-6">
            <div class="flex gap-3">
              <AlertTriangle class="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div class="text-sm">
                <p class="font-semibold text-yellow-500 mb-1">{{ $t('payment.important', 'Penting') }}</p>
                <ul class="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{{ $t('payment.note1', 'Pastikan transfer ke rekening yang benar') }}</li>
                  <li>{{ $t('payment.note2', 'Simpan bukti transfer untuk konfirmasi') }}</li>
                  <li>{{ $t('payment.note3', 'Pengerjaan dimulai setelah pembayaran dikonfirmasi') }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <NuxtLink
              to="/order-success"
              class="block w-full text-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {{ $t('payment.confirmPayment', 'Saya Sudah Transfer') }}
            </NuxtLink>
            
            <NuxtLink
              to="/"
              class="block w-full text-center rounded-xl border border-border/30 bg-card/20 px-6 py-3 font-semibold text-foreground transition hover:bg-card/30"
            >
              {{ $t('payment.backHome', 'Kembali ke Beranda') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CreditCard, 
  Copy, 
  Building, 
  Receipt, 
  Upload, 
  MessageCircle,
  AlertTriangle
} from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

// Get order details from query params (passed from order form)
const orderDetails = computed(() => {
  const query = route.query
  if (!query.orderId) return null
  
  return {
    orderId: query.orderId as string,
    serviceName: query.serviceName as string || 'Digital Service',
    amount: query.amount ? parseInt(query.amount as string) : null
  }
})

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

// WhatsApp message template
const whatsappMessage = computed(() => {
  const orderId = orderDetails.value?.orderId || 'N/A'
  const serviceName = orderDetails.value?.serviceName || 'Digital Service'
  return `Halo Ekalliptus! Saya sudah melakukan pembayaran untuk:\n\nID Pesanan: ${orderId}\nLayanan: ${serviceName}\n\nBerikut bukti transfernya:`
})

// Copy to clipboard function
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.toast({ title: t('payment.copied', 'Disalin!'), description: t('payment.copiedMessage', 'Nomor rekening berhasil disalin'), variant: 'success' })
  } catch (err) {
    console.error('Failed to copy:', err)
    toast.toast.error(t('payment.copyFailed', 'Gagal menyalin'), t('payment.copyFailedMessage', 'Tidak dapat menyalin ke clipboard. Silakan salin manual.'))
  }
}
</script>
