<template>
  <div>
    <Head>
      <!-- SEO Meta Tags - Requirements 2.1, 2.2 -->
      <Title>{{ pageTitle }}</Title>
      <Meta name="description" :content="pageDescription" />
      <Meta name="keywords" content="order layanan digital, pesan website, jasa website murah, order web development, pesan aplikasi mobile" />
      
      <!-- Canonical URL - Requirements 1.5 -->
      <Link rel="canonical" :href="canonicalUrl" />
      
      <!-- Open Graph Tags - Requirements 2.3 -->
      <!-- Note: og:image is handled by nuxt-og-image via defineOgImage -->
      <Meta property="og:title" :content="pageTitle" />
      <Meta property="og:description" :content="pageDescription" />
      <Meta property="og:url" :content="canonicalUrl" />
      <Meta property="og:type" content="website" />
      <Meta property="og:locale" :content="ogLocale" />
      <Meta property="og:site_name" content="ekalliptus" />
      
      <!-- Twitter Card Tags - Requirements 2.4 -->
      <!-- Note: twitter:image is handled by nuxt-og-image via defineOgImage -->
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" :content="pageTitle" />
      <Meta name="twitter:description" :content="pageDescription" />
    </Head>
    
    <div class="min-h-screen py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12 pt-16">
          <div class="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground mb-6">
            <FileText class="h-4 w-4" />
            <span>{{ $t('order.badge', 'Permintaan Penawaran') }}</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {{ $t('order.heading', 'Mulai Proyek Digital Anda') }}
          </h1>
          <p class="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {{ $t('order.subheading', 'Lengkapi form di bawah untuk memulai konsultasi dan dapatkan penawaran terbaik untuk kebutuhan Anda.') }}
          </p>
        </div>

        <!-- Order Form with Price Summary -->
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main Form -->
          <div class="flex-1 glass-panel rounded-3xl p-6 md:p-10">
            <form @submit.prevent="handleSubmit" class="space-y-10">
            
            <!-- Step 1: Service Selection -->
            <div class="space-y-5">
              <h2 class="text-xl font-semibold text-foreground flex items-center gap-3">
                <span class="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">1</span>
                {{ $t('order.selectService', 'Pilih Layanan') }}
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  v-for="service in services"
                  :key="service.id"
                  type="button"
                  @click="selectedService = service.id"
                  class="glass-button p-5 rounded-2xl text-left transition-all cursor-interactive group"
                  :class="[
                    selectedService === service.id
                      ? 'ring-2 ring-primary bg-primary/10'
                      : 'hover:bg-card/30'
                  ]"
                >
                  <div class="flex items-start gap-4">
                    <div 
                      class="h-12 w-12 rounded-xl flex items-center justify-center transition-colors"
                      :class="selectedService === service.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'"
                    >
                      <component :is="service.icon" class="h-6 w-6" />
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-foreground">{{ service.title }}</h3>
                      <p class="text-sm text-muted-foreground mt-1">{{ service.description }}</p>
                      <p class="text-sm font-medium text-primary mt-2">{{ formatPrice(service.startingPrice) }}</p>
                    </div>
                    <div 
                      class="h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all"
                      :class="selectedService === service.id ? 'border-primary bg-primary' : 'border-muted-foreground'"
                    >
                      <Check v-if="selectedService === service.id" class="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 2: Customer Details -->
            <div class="space-y-5">
              <h2 class="text-xl font-semibold text-foreground flex items-center gap-3">
                <span class="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">2</span>
                {{ $t('order.customerDetails', 'Data Pelanggan') }}
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground flex items-center gap-1">
                    <User class="h-4 w-4 text-muted-foreground" />
                    {{ $t('order.name', 'Nama Lengkap') }} <span class="text-destructive">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground"
                    :placeholder="$t('order.namePlaceholder', 'Masukkan nama lengkap')"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground flex items-center gap-1">
                    <Mail class="h-4 w-4 text-muted-foreground" />
                    {{ $t('order.email', 'Email') }} <span class="text-destructive">*</span>
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground"
                    placeholder="email@example.com"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground flex items-center gap-1">
                    <Phone class="h-4 w-4 text-muted-foreground" />
                    {{ $t('order.phone', 'Nomor WhatsApp') }} <span class="text-destructive">*</span>
                  </label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    required
                    class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground"
                    :placeholder="$t('order.phonePlaceholder', '08xxxxxxxxxx')"
                  />
                </div>

                <div v-if="selectedService !== 'maintenance'" class="space-y-2">
                  <label class="text-sm font-medium text-foreground flex items-center gap-1">
                    <Building class="h-4 w-4 text-muted-foreground" />
                    {{ $t('order.company', 'Nama Perusahaan/Bisnis') }}
                  </label>
                  <input
                    v-model="form.company"
                    type="text"
                    class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground"
                    :placeholder="$t('order.companyPlaceholder', 'Opsional')"
                  />
                </div>
              </div>
            </div>

            <!-- Step 3: Service Details (Dynamic) -->
            <div v-if="selectedService && currentServiceConfig" class="space-y-5">
              <h2 class="text-xl font-semibold text-foreground flex items-center gap-3">
                <span class="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">3</span>
                {{ $t(currentServiceConfig.labelKey) }}
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <template v-for="field in currentServiceConfig.fields" :key="field.id">
                  <!-- Select Field -->
                  <div v-if="field.type === 'select'" class="space-y-2" :class="{ 'md:col-span-2': field.id === 'problemDescription' }">
                    <label class="text-sm font-medium text-foreground">
                      {{ $t(field.labelKey) }} <span v-if="field.required" class="text-destructive">*</span>
                    </label>
                    <select
                      v-model="(form.serviceDetails as any)[field.id]"
                      :required="field.required"
                      class="glass-input w-full px-4 py-3 rounded-xl text-foreground cursor-pointer"
                    >
                      <option value="">{{ $t('order.serviceDetails.common.select') }}</option>
                      <option v-for="optKey in field.optionKeys" :key="optKey" :value="$t(optKey)">{{ $t(optKey) }}</option>
                    </select>
                  </div>

                  <!-- Text Field -->
                  <div v-else-if="field.type === 'text'" class="space-y-2">
                    <label class="text-sm font-medium text-foreground">
                      {{ $t(field.labelKey) }} <span v-if="field.required" class="text-destructive">*</span>
                    </label>
                    <input
                      v-model="(form.serviceDetails as any)[field.id]"
                      type="text"
                      :required="field.required"
                      :placeholder="field.placeholderKey ? $t(field.placeholderKey) : ''"
                      class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <!-- Number Field -->
                  <div v-else-if="field.type === 'number'" class="space-y-2">
                    <label class="text-sm font-medium text-foreground">
                      {{ $t(field.labelKey) }} <span v-if="field.required" class="text-destructive">*</span>
                    </label>
                    <input
                      v-model="(form.serviceDetails as any)[field.id]"
                      type="number"
                      min="1"
                      :required="field.required"
                      :placeholder="field.placeholderKey ? $t(field.placeholderKey) : ''"
                      class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <!-- Textarea Field -->
                  <div v-else-if="field.type === 'textarea'" class="space-y-2 md:col-span-2">
                    <label class="text-sm font-medium text-foreground">
                      {{ $t(field.labelKey) }} <span v-if="field.required" class="text-destructive">*</span>
                    </label>
                    <textarea
                      v-model="(form.serviceDetails as any)[field.id]"
                      :required="field.required"
                      :placeholder="field.placeholderKey ? $t(field.placeholderKey) : ''"
                      rows="3"
                      class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>

                  <!-- Checkbox Field -->
                  <div v-else-if="field.type === 'checkbox'" class="space-y-2 md:col-span-2">
                    <label class="text-sm font-medium text-foreground">
                      {{ $t(field.labelKey) }} <span v-if="field.required" class="text-destructive">*</span>
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <label
                        v-for="optKey in field.optionKeys"
                        :key="optKey"
                        class="glass-button px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-2"
                        :class="(form.serviceDetails as any)[field.id]?.includes($t(optKey)) ? 'ring-2 ring-primary bg-primary/20 text-primary' : 'hover:bg-card/30'"
                      >
                        <input
                          type="checkbox"
                          :value="$t(optKey)"
                          v-model="(form.serviceDetails as any)[field.id]"
                          class="sr-only"
                        />
                        <Check v-if="(form.serviceDetails as any)[field.id]?.includes($t(optKey))" class="h-4 w-4 text-primary" />
                        <span class="text-sm">{{ $t(optKey) }}</span>
                      </label>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Step 4: Project Details (Only for services that need it) -->
            <div v-if="showProjectDetails" class="space-y-5">
              <h2 class="text-xl font-semibold text-foreground flex items-center gap-3">
                <span class="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{{ selectedService ? '4' : '3' }}</span>
                {{ $t('order.projectDetails', 'Detail Proyek') }}
              </h2>

              <div class="space-y-5">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground flex items-center gap-1">
                    <Folder class="h-4 w-4 text-muted-foreground" />
                    {{ $t('order.projectName', 'Nama Proyek') }} <span class="text-destructive">*</span>
                  </label>
                  <input
                    v-model="form.projectName"
                    type="text"
                    required
                    class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground"
                    :placeholder="$t('order.projectNamePlaceholder', 'Website Toko Online, Aplikasi Mobile, dll')"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground flex items-center gap-1">
                    <FileText class="h-4 w-4 text-muted-foreground" />
                    {{ $t('order.projectDescription', 'Deskripsi Proyek') }} <span class="text-destructive">*</span>
                  </label>
                  <textarea
                    v-model="form.description"
                    required
                    rows="4"
                    class="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground resize-none"
                    :placeholder="$t('order.descriptionPlaceholder', 'Jelaskan kebutuhan proyek Anda secara detail: fitur yang diinginkan, referensi website/app, timeline, dll...')"
                  />
                </div>


              </div>
            </div>

            <!-- Step 5: File Attachments -->
            <div class="space-y-5">
              <h2 class="text-xl font-semibold text-foreground flex items-center gap-3">
                <span class="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{{ showProjectDetails ? '5' : '4' }}</span>
                {{ $t('order.attachments.title', 'File Lampiran') }}
                <span class="text-sm font-normal text-muted-foreground">({{ $t('order.common.optional', 'Opsional') }})</span>
              </h2>
              
              <p class="text-sm text-muted-foreground">
                {{ $t('order.attachments.description', 'Upload file referensi seperti logo, brand guidelines, contoh desain, atau brief proyek.') }}
              </p>

              <FileUpload v-model="form.attachments" />
            </div>

            <!-- Step 6: Urgency Selection -->
            <div class="space-y-5">
              <h2 class="text-xl font-semibold text-foreground flex items-center gap-3">
                <span class="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{{ showProjectDetails ? '6' : '5' }}</span>
                <Clock class="h-5 w-5 text-muted-foreground" />
                {{ $t('order.urgency.title', 'Tingkat Urgensi') }}
              </h2>
              
              <p class="text-sm text-muted-foreground">
                {{ $t('order.urgency.description', 'Pilih tingkat urgensi untuk proyek Anda. Biaya tambahan berlaku untuk pengerjaan lebih cepat.') }}
              </p>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  v-for="option in urgencyOptions"
                  :key="option.value"
                  type="button"
                  @click="selectedUrgency = option.value"
                  class="glass-button p-5 rounded-2xl text-left transition-all cursor-interactive group relative"
                  :class="[
                    selectedUrgency === option.value
                      ? 'ring-2 ring-primary bg-primary/10'
                      : 'hover:bg-card/30'
                  ]"
                >
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <component :is="option.icon" class="h-6 w-6" :class="selectedUrgency === option.value ? 'text-primary' : 'text-muted-foreground'" />
                      <div 
                        class="h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all"
                        :class="selectedUrgency === option.value ? 'border-primary bg-primary' : 'border-muted-foreground'"
                      >
                        <Check v-if="selectedUrgency === option.value" class="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                    <h3 class="font-semibold text-foreground">{{ option.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ option.description }}</p>
                    <div class="mt-2">
                      <span 
                        v-if="option.multiplier > 1" 
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        :class="selectedUrgency === option.value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'"
                      >
                        <Zap class="h-3 w-3" />
                        +{{ Math.round((option.multiplier - 1) * 100) }}%
                      </span>
                      <span 
                        v-else 
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        :class="selectedUrgency === option.value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'"
                      >
                        {{ $t('order.urgency.standardPrice', 'Harga Standar') }}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 7: Voucher Code -->
            <div class="space-y-5">
              <h2 class="text-xl font-semibold text-foreground flex items-center gap-3">
                <span class="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{{ showProjectDetails ? '7' : '6' }}</span>
                <Ticket class="h-5 w-5 text-muted-foreground" />
                {{ $t('order.voucher.title', 'Kode Voucher') }}
                <span class="text-sm font-normal text-muted-foreground">({{ $t('order.common.optional', 'Opsional') }})</span>
              </h2>
              
              <p class="text-sm text-muted-foreground">
                {{ $t('order.voucher.description', 'Masukkan kode voucher jika Anda memilikinya untuk mendapatkan diskon.') }}
              </p>

              <div class="space-y-4">
                <!-- Voucher Input -->
                <div class="flex gap-3">
                  <input
                    v-model="voucherCode"
                    type="text"
                    :disabled="!!appliedVoucher || isValidatingVoucher"
                    class="glass-input flex-1 px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground uppercase"
                    :class="{ 'opacity-50': !!appliedVoucher }"
                    :placeholder="$t('order.voucher.placeholder', 'Masukkan kode voucher')"
                    @keyup.enter="applyVoucher"
                  />
                  <button
                    v-if="!appliedVoucher"
                    type="button"
                    @click="applyVoucher"
                    :disabled="!voucherCode.trim() || isValidatingVoucher"
                    class="glass-button px-6 py-3 rounded-xl font-medium text-foreground transition-all cursor-interactive flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="{ 'hover:bg-primary/20': voucherCode.trim() && !isValidatingVoucher }"
                  >
                    <Loader2 v-if="isValidatingVoucher" class="h-4 w-4 animate-spin" />
                    <span>{{ isValidatingVoucher ? $t('order.voucher.checking', 'Memeriksa...') : $t('order.voucher.apply', 'Terapkan') }}</span>
                  </button>
                </div>

                <!-- Voucher Error -->
                <div v-if="voucherError" class="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle class="h-4 w-4" />
                  <span>{{ voucherError }}</span>
                </div>

                <!-- Applied Voucher -->
                <div v-if="appliedVoucher" class="glass-panel rounded-xl p-4 border border-green-500/30 bg-green-500/5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle class="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p class="font-medium text-foreground">{{ appliedVoucher.code }}</p>
                        <p class="text-sm text-green-500">
                          {{ $t('order.voucher.discountApplied', 'Diskon') }}: {{ formatCurrency(appliedVoucher.discount) }}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      @click="removeVoucher"
                      class="glass-button p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-interactive"
                      :title="$t('order.voucher.remove', 'Hapus voucher')"
                    >
                      <X class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-6">
              <button
                type="submit"
                :disabled="isSubmitting || !selectedService"
                class="w-full rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-interactive flex items-center justify-center gap-3"
              >
                <span v-if="isSubmitting" class="flex items-center gap-3">
                  <Loader2 class="h-5 w-5 animate-spin" />
                  {{ $t('order.submitting', 'Mengirim...') }}
                </span>
                <span v-else class="flex items-center gap-3">
                  <Send class="h-5 w-5" />
                  {{ $t('order.submit', 'Kirim Permintaan') }}
                </span>
              </button>
              
              <p class="text-center text-sm text-muted-foreground mt-4">
                {{ $t('order.note', 'Tim kami akan menghubungi Anda dalam 1x24 jam kerja.') }}
              </p>
            </div>
          </form>
          </div>

          <!-- Price Summary Panel (Desktop: Sticky Sidebar) -->
          <div class="lg:w-80 lg:flex-shrink-0">
            <div class="glass-panel rounded-2xl p-6 lg:sticky lg:top-24">
              <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Wallet class="h-5 w-5 text-primary" />
                {{ $t('order.summary.title', 'Ringkasan Harga') }}
              </h3>
              
              <!-- No service selected state -->
              <div v-if="!selectedService" class="text-center py-6">
                <div class="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <FileText class="h-6 w-6 text-muted-foreground" />
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ $t('order.summary.selectService', 'Pilih layanan untuk melihat estimasi harga') }}
                </p>
              </div>
              
              <!-- Price breakdown -->
              <div v-else class="space-y-3">
                <!-- Subtotal -->
                <div class="flex justify-between items-center text-sm">
                  <span class="text-muted-foreground">{{ $t('order.summary.subtotal', 'Subtotal') }}</span>
                  <span class="text-foreground font-medium">{{ formatCurrency(orderCalculation.subtotal) }}</span>
                </div>
                
                <!-- Discount (if voucher applied) -->
                <div v-if="orderCalculation.discount > 0" class="flex justify-between items-center text-sm">
                  <span class="text-green-500 flex items-center gap-1">
                    <Ticket class="h-3.5 w-3.5" />
                    {{ $t('order.summary.discount', 'Diskon') }}
                  </span>
                  <span class="text-green-500 font-medium">-{{ formatCurrency(orderCalculation.discount) }}</span>
                </div>
                
                <!-- DPP -->
                <div class="flex justify-between items-center text-sm">
                  <span class="text-muted-foreground">{{ $t('order.summary.dpp', 'DPP') }}</span>
                  <span class="text-foreground font-medium">{{ formatCurrency(orderCalculation.dpp) }}</span>
                </div>
                
                <!-- PPN -->
                <div class="flex justify-between items-center text-sm">
                  <span class="text-muted-foreground">{{ $t('order.summary.ppn', 'PPN (11%)') }}</span>
                  <span class="text-foreground font-medium">{{ formatCurrency(orderCalculation.ppn) }}</span>
                </div>
                
                <!-- Divider -->
                <div class="border-t border-border my-3"></div>
                
                <!-- Grand Total -->
                <div class="flex justify-between items-center">
                  <span class="text-foreground font-semibold">{{ $t('order.summary.total', 'Total') }}</span>
                  <span class="text-primary text-lg font-bold">{{ formatCurrency(orderCalculation.grandTotal) }}</span>
                </div>
                
                <!-- Deposit Info (for online services) -->
                <div v-if="orderCalculation.depositPercentage > 0" class="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span class="text-xs font-bold text-primary">DP</span>
                    </div>
                    <span class="text-sm font-medium text-foreground">{{ $t('order.summary.depositInfo', 'Info Pembayaran') }}</span>
                  </div>
                  <div class="space-y-1 text-sm">
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">{{ $t('order.summary.deposit', 'DP') }} ({{ orderCalculation.depositPercentage }}%)</span>
                      <span class="text-foreground font-medium">{{ formatCurrency(orderCalculation.deposit) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">{{ $t('order.summary.remaining', 'Sisa') }}</span>
                      <span class="text-foreground font-medium">{{ formatCurrency(orderCalculation.remaining) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Pay on Site (for service_device) -->
                <div v-else class="mt-4 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div class="flex items-center gap-2">
                    <div class="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check class="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <span class="text-sm font-medium text-green-600 dark:text-green-400">
                      {{ $t('order.summary.payOnSite', 'Bayar di Tempat') }}
                    </span>
                  </div>
                  <p class="text-xs text-muted-foreground mt-2 ml-8">
                    {{ $t('order.summary.payOnSiteDesc', 'Pembayaran dilakukan setelah layanan selesai') }}
                  </p>
                </div>
                
                <!-- Urgency indicator -->
                <div v-if="selectedUrgency !== 'normal'" class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap class="h-3.5 w-3.5 text-primary" />
                  <span>
                    {{ selectedUrgency === 'express' ? $t('order.summary.expressNote', 'Termasuk biaya Express +25%') : $t('order.summary.priorityNote', 'Termasuk biaya Priority +50%') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Alternative -->
        <div class="mt-8 text-center">
          <p class="text-muted-foreground mb-4">
            {{ $t('order.orContact', 'Atau hubungi langsung via WhatsApp') }}
          </p>
          <a
            href="https://wa.me/6281999900306"
            target="_blank"
            rel="noopener noreferrer"
            class="glass-button inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-foreground cursor-interactive"
          >
            <Phone class="h-4 w-4 text-green-500" />
            +62 819-9990-0306
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Globe, Smartphone, Palette, Video, Monitor, Wrench, 
  Loader2, Send, Check, User, Mail, Phone, Building, 
  Folder, FileText, Wallet, Calendar, Clock, Zap, Timer,
  Ticket, AlertCircle, CheckCircle, X
} from 'lucide-vue-next'
import { serviceFormConfigs, type ServiceId } from '~/composables/useServiceForms'
import { 
  SERVICE_TYPE_MAP, 
  SERVICE_PRICES, 
  calculateOrder,
  calculateDynamicPrice,
  getDefaultScheduleDate, 
  getDefaultScheduleTime 
} from '~/composables/useOrderCalculation'
import type { OrderInsert, ServiceType } from '~/types/database.types'
import { seoConfig } from '~/config/seo.config'
import { generateBreadcrumbSchema, schemaToJsonLd } from '~/composables/useStructuredData'

// SEO Configuration - Requirements 2.1, 2.2, 2.3, 2.4, 3.5, 4.2
const { locale } = useI18n()
const route = useRoute()

const pageTitle = computed(() => seoConfig.pages.order.title)
const pageDescription = computed(() => seoConfig.pages.order.description)
const canonicalUrl = computed(() => `${seoConfig.siteUrl}${route.path}`)
const ogLocale = computed(() => locale.value === 'id' ? 'id_ID' : locale.value)

// Define OG image for order page (Requirements 2.5)
// nuxt-og-image will automatically generate the og:image and twitter:image meta tags
defineOgImage({
  component: 'OgImageDefault',
  props: {
    title: 'Order Layanan',
    description: 'Digital Agency Indonesia',
    siteName: 'ekalliptus',
    siteUrl: 'ekalliptus.com'
  }
})

// Breadcrumb Schema - Requirements 3.5
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Order Layanan' }
])

// Add structured data via useHead - Requirements 3.5
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: schemaToJsonLd(breadcrumbSchema)
    }
  ]
})

const { toast } = useToast()
const router = useRouter()

const selectedService = ref<ServiceId | ''>('')
const isSubmitting = ref(false)
const selectedUrgency = ref<'normal' | 'express' | 'priority'>('normal')

// Voucher state
const voucherCode = ref('')
const appliedVoucher = ref<{ code: string; discount: number } | null>(null)
const isValidatingVoucher = ref(false)
const voucherError = ref<string | null>(null)

// Get current service config based on selection
const currentServiceConfig = computed(() => {
  if (!selectedService.value) return null
  return serviceFormConfigs[selectedService.value as ServiceId] || null
})

// Services that don't need the generic "Project Details" section
// because they have their own complete detail forms
const servicesWithoutProjectDetails = ['maintenance', 'video']

const showProjectDetails = computed(() => {
  // Always show if no service selected (shouldn't happen, but fallback)
  if (!selectedService.value) return true
  // Hide for services that have complete detail forms
  return !servicesWithoutProjectDetails.includes(selectedService.value)
})

// Reactive order calculation for price summary with dynamic pricing
const orderCalculation = computed(() => {
  if (!selectedService.value) {
    return {
      subtotal: 0,
      discount: 0,
      dpp: 0,
      ppn: 0,
      fee: 0,
      grandTotal: 0,
      deposit: 0,
      remaining: 0,
      depositPercentage: 0
    }
  }
  
  // Calculate dynamic price based on service details
  const dynamicPrice = calculateDynamicPrice(selectedService.value, form.serviceDetails)
  
  return calculateOrder({
    serviceId: selectedService.value,
    basePrice: dynamicPrice,
    urgency: selectedUrgency.value,
    voucherDiscount: appliedVoucher.value?.discount || 0
  })
})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  projectName: '',
  description: '',
  attachments: [] as File[],
  // Service-specific fields
  serviceDetails: {
    // Website
    websiteType: '',
    pageCount: '',
    features: [] as string[],
    referenceUrl: '',
    needDomain: '',
    needHosting: '',
    // Mobile
    platform: '',
    appType: '',
    appFeatures: [] as string[],
    apiIntegration: '',
    adminPanel: '',
    referenceApp: '',
    // WordPress
    wpType: '',
    wpEcommerce: '',
    wpPlugins: [] as string[],
    existingUrl: '',
    // Video/Photo
    mediaType: '',
    videoDuration: '',
    quantity: '',
    mediaPurpose: '',
    outputFormats: [] as string[],
    styleReference: '',
    // UI/UX
    uiPlatform: '',
    screenCount: '',
    deliverables: [] as string[],
    designStyle: '',
    brandGuidelines: '',
    designReference: '',
    // Service HP/Laptop
    deviceType: '',
    deviceBrand: '',
    deviceModel: '',
    problemTypes: [] as string[],
    problemDescription: '',
    urgency: ''
  }
})

// Services with i18n support
const { t } = useI18n()

const services = computed(() => [
  { 
    id: 'web', 
    icon: Globe, 
    title: t('order.serviceCards.web.title'),
    description: t('order.serviceCards.web.description'),
    startingPrice: SERVICE_PRICES['web']
  },
  { 
    id: 'mobile', 
    icon: Smartphone, 
    title: t('order.serviceCards.mobile.title'),
    description: t('order.serviceCards.mobile.description'),
    startingPrice: SERVICE_PRICES['mobile']
  },
  { 
    id: 'wordpress', 
    icon: Palette, 
    title: t('order.serviceCards.wordpress.title'),
    description: t('order.serviceCards.wordpress.description'),
    startingPrice: SERVICE_PRICES['wordpress']
  },
  { 
    id: 'video', 
    icon: Video, 
    title: t('order.serviceCards.video.title'),
    description: t('order.serviceCards.video.description'),
    startingPrice: SERVICE_PRICES['video']
  },
  { 
    id: 'uiux', 
    icon: Monitor, 
    title: t('order.serviceCards.uiux.title'),
    description: t('order.serviceCards.uiux.description'),
    startingPrice: SERVICE_PRICES['uiux']
  },
  { 
    id: 'maintenance', 
    icon: Wrench, 
    title: t('order.serviceCards.maintenance.title'),
    description: t('order.serviceCards.maintenance.description'),
    startingPrice: SERVICE_PRICES['maintenance']
  }
])

// Urgency options with i18n
const urgencyOptions = computed(() => [
  {
    value: 'normal' as const,
    label: t('order.urgency.normal', 'Normal'),
    description: t('order.urgency.normalDesc', 'Pengerjaan standar sesuai timeline'),
    icon: Clock,
    multiplier: 1.0
  },
  {
    value: 'express' as const,
    label: t('order.urgency.express', 'Express'),
    description: t('order.urgency.expressDesc', 'Pengerjaan lebih cepat'),
    icon: Timer,
    multiplier: 1.25
  },
  {
    value: 'priority' as const,
    label: t('order.urgency.priority', 'Priority'),
    description: t('order.urgency.priorityDesc', 'Prioritas tertinggi'),
    icon: Zap,
    multiplier: 1.5
  }
])

const formatPrice = (price: number) => {
  return `${t('order.startingFrom')} Rp ${price.toLocaleString('id-ID')}`
}

// Format currency for display
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Voucher functions
const { validateVoucher } = useVoucherService()

const applyVoucher = async () => {
  if (!voucherCode.value.trim()) return
  
  voucherError.value = null
  isValidatingVoucher.value = true
  
  try {
    // Get current subtotal for validation using dynamic price
    const dynamicPrice = selectedService.value ? calculateDynamicPrice(selectedService.value, form.serviceDetails) : 0
    const urgencyMultiplier = selectedUrgency.value === 'express' ? 1.25 : selectedUrgency.value === 'priority' ? 1.5 : 1.0
    const subtotal = Math.round(dynamicPrice * urgencyMultiplier)
    
    const result = await validateVoucher(voucherCode.value.trim(), subtotal)
    
    if (result.valid) {
      appliedVoucher.value = {
        code: voucherCode.value.trim().toUpperCase(),
        discount: result.discount
      }
      voucherError.value = null
      toast.success(t('order.voucher.success', 'Voucher Diterapkan'), t('order.voucher.discountApplied', 'Diskon') + `: ${formatCurrency(result.discount)}`)
    } else {
      voucherError.value = result.error
      appliedVoucher.value = null
    }
  } catch (error) {
    console.error('Voucher validation error:', error)
    voucherError.value = t('order.voucher.error', 'Gagal memvalidasi voucher')
    appliedVoucher.value = null
  } finally {
    isValidatingVoucher.value = false
  }
}

const removeVoucher = () => {
  appliedVoucher.value = null
  voucherCode.value = ''
  voucherError.value = null
}

const handleSubmit = async () => {
  if (!selectedService.value) {
    toast.error('Pilih Layanan', 'Silakan pilih layanan yang diinginkan')
    return
  }

  // Basic validation - always required
  if (!form.name || !form.email || !form.phone) {
    toast.error(t('order.validation.error'), t('order.validation.fillRequired'))
    return
  }

  // Project details validation - only for services that need it
  if (showProjectDetails.value && (!form.projectName || !form.description)) {
    toast.error(t('order.validation.error'), t('order.validation.fillRequired'))
    return
  }

  isSubmitting.value = true

  try {
    const selectedServiceData = services.value.find((s: { id: string }) => s.id === selectedService.value)
    
    // Map form service ID to database service_type
    const serviceType: ServiceType = SERVICE_TYPE_MAP[selectedService.value] || 'website'
    
    // Calculate dynamic price based on service details
    const dynamicPrice = calculateDynamicPrice(selectedService.value, form.serviceDetails)
    
    // Calculate order amounts with selected urgency and dynamic price
    const calculation = calculateOrder({
      serviceId: selectedService.value,
      basePrice: dynamicPrice,
      urgency: selectedUrgency.value,
      voucherDiscount: appliedVoucher.value?.discount || 0
    })
    
    // Build scope object with all service details
    const scope = {
      serviceName: selectedServiceData?.title || '',
      projectName: form.projectName || null,
      projectDescription: form.description || null,
      details: form.serviceDetails
    }
    
    // Prepare order data matching Supabase schema
    const orderData: OrderInsert = {
      // Customer info
      customer_name: form.name,
      whatsapp: form.phone,
      email: form.email || null,
      company: form.company || null,
      
      // Service info
      service_type: serviceType,
      urgency: selectedUrgency.value,
      scope: scope,
      
      // Delivery info (default values for consultation request)
      delivery_method: 'pickup',
      schedule_date: getDefaultScheduleDate(),
      schedule_time: getDefaultScheduleTime(),
      shipping_cost: 0,
      
      // Pricing (calculated)
      subtotal: calculation.subtotal,
      discount: calculation.discount,
      dpp: calculation.dpp,
      ppn: calculation.ppn,
      fee: calculation.fee,
      grand_total: calculation.grandTotal,
      deposit: calculation.deposit,
      remaining: calculation.remaining,
      
      // Voucher (if applied)
      voucher_code: appliedVoucher.value?.code || null,
      
      // Status - service_device uses onsite payment flow
      status: serviceType === 'service_device' ? 'waiting_onsite_payment' : 'waiting_dp'
    }
    
    console.log('Submitting order data:', JSON.stringify(orderData, null, 2))
    
    // Try to save to Supabase
    const { createOrder, uploadAttachment } = useOrderService()
    const { data, error } = await createOrder(orderData)
    
    if (error) {
      console.error('Order save error:', error)
      console.error('Order data that failed:', JSON.stringify(orderData, null, 2))
      toast.error(t('order.error.title', 'Error'), `${t('order.error.saveFailed', 'Failed to save order')}: ${error.message}`)
      return
    }
    
    console.log('Order saved successfully:', data)
    
    // Upload attachments if any (don't block order on attachment failures)
    if (form.attachments.length > 0 && data?.id) {
      const { supabase } = useSupabase()
      
      for (const file of form.attachments) {
        try {
          const uploadResult = await uploadAttachment(file, data.id)
          
          if (uploadResult.data && supabase) {
            // Save attachment metadata to order_attachments table
            await supabase.from('order_attachments').insert({
              order_id: data.id,
              bucket: 'orders',
              path: uploadResult.data.path,
              filename: file.name,
              content_type: file.type || 'application/octet-stream',
              size: file.size
            })
          }
        } catch (uploadError) {
          console.error('Attachment upload error:', uploadError)
          // Continue with other files, don't block order
        }
      }
    }
    
    toast.success(t('order.success.title', 'Berhasil!'), t('order.success.message', 'Permintaan Anda telah dikirim. Silakan lakukan pembayaran.'))
    
    // Redirect to payment page with order details
    const paymentQuery: Record<string, string> = {
      orderId: data?.id || 'pending',
      serviceName: selectedServiceData?.title || ''
    }
    
    // Add amount if deposit is applicable
    if (orderCalculation.value.deposit > 0) {
      paymentQuery.amount = orderCalculation.value.deposit.toString()
    }
    
    router.push({
      path: '/payment',
      query: paymentQuery
    })
  } catch (error) {
    console.error('Order error:', error)
    toast.error(t('order.error.title', 'Gagal'), t('order.error.generic', 'Terjadi kesalahan. Silakan coba lagi atau hubungi kami via WhatsApp.'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
