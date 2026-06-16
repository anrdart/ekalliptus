# Simplify Order System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace payment gateway order flow with simplified form → Supabase → Google Sheets + WhatsApp redirect.

**Architecture:** Order form posts to `/api/order`, inserts into Supabase, returns orderId + price. Client builds wa.me URL and redirects. Supabase Database Webhook triggers Edge Function that syncs to Google Sheets and sends Telegram notification, with retry logic and failure tracking.

**Tech Stack:** Astro, Supabase (DB + Edge Functions + Database Webhooks), Google Sheets API (service account JWT), Telegram Bot API.

---

### Task 1: Database Migration — Add order_sync_failures table + update order_status enum

**Files:**
- Create: `supabase/migrations/20260516000001_simplify_order_system.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/20260516000001_simplify_order_system.sql

-- 1. Create order_sync_failures table
CREATE TABLE IF NOT EXISTS order_sync_failures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  target text NOT NULL CHECK (target IN ('sheets', 'telegram')),
  error_message text,
  attempts integer DEFAULT 0,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_sync_failures_unresolved 
  ON order_sync_failures (resolved, created_at) 
  WHERE resolved = false;

-- 2. Add new order statuses to the enum
-- Postgres enums can only be extended, not shrunk. Add new values.
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'new';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'contacted';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'done';

-- 3. Add description and price columns to orders (for simplified flow)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price integer;
```

- [ ] **Step 2: Apply the migration locally**

Run: `npx supabase db push` or apply via Supabase dashboard.
Expected: Migration applies without errors. New table `order_sync_failures` created. New enum values added. New columns added to `orders`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260516000001_simplify_order_system.sql
git commit -m "feat(db): add order_sync_failures table and new order statuses"
```

---

### Task 2: Update TypeScript types for new schema

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Add order_sync_failures table type and update order_status enum**

In `src/types/database.ts`, add the `order_sync_failures` table definition inside `Database['public']['Tables']` (after the `orders` block):

```typescript
      order_sync_failures: {
        Row: {
          id: string
          order_id: string
          target: string
          error_message: string | null
          attempts: number
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          target: string
          error_message?: string | null
          attempts?: number
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          target?: string
          error_message?: string | null
          attempts?: number
          resolved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_sync_failures_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
```

- [ ] **Step 2: Update order_status enum to include new values**

Change the `order_status` enum in the `Enums` section from:

```typescript
order_status: 'waiting_dp' | 'dp_paid' | 'waiting_onsite_payment' | 'onsite_paid' | 'cancelled'
```

to:

```typescript
order_status: 'waiting_dp' | 'dp_paid' | 'waiting_onsite_payment' | 'onsite_paid' | 'cancelled' | 'new' | 'contacted' | 'in_progress' | 'done'
```

- [ ] **Step 3: Add description and price to orders Row/Insert/Update**

In the `orders` table type, add to `Row`:
```typescript
          description: string | null
          price: number | null
```

Add to `Insert`:
```typescript
          description?: string | null
          price?: number | null
```

Add to `Update`:
```typescript
          description?: string | null
          price?: number | null
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx astro check 2>&1 | head -30`
Expected: No new type errors related to the changes.

- [ ] **Step 5: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(types): add order_sync_failures and new order statuses"
```

---

### Task 3: Simplify the order API endpoint

**Files:**
- Modify: `src/pages/api/order.ts`

- [ ] **Step 1: Rewrite the order API to simplified version**

Replace the entire content of `src/pages/api/order.ts` with:

```typescript
import type { APIRoute } from 'astro'
import { createOrder } from '../../lib/supabase'
import { SERVICE_TYPE_MAP, SERVICE_PRICES } from '../../utils/pricing'
import { createLead } from '../../lib/admin/leads'

const VALID_SERVICES = ['web', 'mobile', 'wordpress', 'uiux']

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { service_type, customer_name, whatsapp, description } = body

    if (!service_type || !customer_name || !whatsapp || !description) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: service_type, customer_name, whatsapp, description'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    if (!VALID_SERVICES.includes(service_type)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid service_type'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const serviceType = SERVICE_TYPE_MAP[service_type] || 'website'
    const price = SERVICE_PRICES[service_type] || 0

    const orderData = {
      customer_name,
      whatsapp,
      service_type: serviceType,
      description,
      price,
      scope: { description },
      pricing: { grand_total: price },
      status: 'new' as const,
      schedule_date: new Date().toISOString().split('T')[0],
      schedule_time: '10:00',
      delivery_method: 'pickup' as const
    }

    const { data: order, error } = await createOrder(orderData)

    if (error) {
      console.error('Order creation error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    try {
      await createLead({
        name: customer_name,
        whatsapp,
        service_interest: serviceType,
        stage: 'new',
        source: 'direct_order',
        order_id: order!.id,
        estimated_value: price,
        notes: `Auto-created from order ${order!.id.slice(0, 8)}`
      })
    } catch (err) {
      console.error('[order] Auto-create lead failed:', err)
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        orderId: order!.id,
        customerName: customer_name,
        whatsapp,
        serviceType: service_type,
        price
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
```

- [ ] **Step 2: Verify no import errors**

Run: `npx astro check 2>&1 | grep -i "order.ts"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/order.ts
git commit -m "feat(api): simplify order endpoint - remove payment gateway logic"
```

---

### Task 4: Simplify the order form page

**Files:**
- Modify: `src/pages/order.astro`

- [ ] **Step 1: Rewrite order.astro with simplified form and wa.me redirect**

Replace the entire content of `src/pages/order.astro` with:

```astro
---
import Layout from '../layouts/Layout.astro'
import Navigation from '../components/Navigation.astro'
import VantaBackground from '../components/VantaBackground.astro'
import PreLoader from '../components/PreLoader.astro'
import { t, getLocaleFromRequest, getDir } from '../i18n'
import { ArrowRight } from 'lucide-astro'

const locale = getLocaleFromRequest(Astro.request)
const dir = getDir(locale)
---

<Layout 
  title={`${t('order.title', locale)} | Ekalliptus Digital`}
  description={t('order.subtitle', locale)}
  lang={locale}
  dir={dir}
>
  <VantaBackground />
  <PreLoader />
  <Navigation t={(key: string) => t(key, locale)} currentLang={locale} />
  
  <style>
    .service-btn.selected {
      border-color: hsl(var(--primary) / 0.6) !important;
      box-shadow:
        0 8px 32px hsl(var(--glass-shadow)),
        0 0 0 1px hsl(var(--primary) / 0.6),
        0 0 16px hsl(var(--primary) / 0.12),
        inset 0 1px 0 hsl(0 0% 100% / 0.1) !important;
    }
  </style>

  <main class="relative z-0 flex min-h-screen flex-col pt-20 sm:pt-16 md:pt-20">
    <div class="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <div class="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8">
        <div class="text-center mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">{t('order.title', locale)}</h1>
          <p class="text-muted-foreground text-sm sm:text-base">{t('order.subtitle', locale)}</p>
        </div>
        
        <form id="order-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              {t('order.selectService', locale)}
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <button type="button" data-service="web" data-price="2500000" class="service-btn glass-panel rounded-xl p-3 sm:p-4 text-center transition hover:scale-105 active:scale-[0.98] min-h-[44px]">
                <span class="block font-medium text-sm sm:text-base">{t('order.serviceCards.web.title', locale)}</span>
                <span class="text-[0.65rem] sm:text-xs text-muted-foreground">Rp 2.500.000</span>
              </button>
              <button type="button" data-service="mobile" data-price="5000000" class="service-btn glass-panel rounded-xl p-3 sm:p-4 text-center transition hover:scale-105 active:scale-[0.98] min-h-[44px]">
                <span class="block font-medium text-sm sm:text-base">{t('order.serviceCards.mobile.title', locale)}</span>
                <span class="text-[0.65rem] sm:text-xs text-muted-foreground">Rp 5.000.000</span>
              </button>
              <button type="button" data-service="wordpress" data-price="1500000" class="service-btn glass-panel rounded-xl p-3 sm:p-4 text-center transition hover:scale-105 active:scale-[0.98] min-h-[44px]">
                <span class="block font-medium text-sm sm:text-base">{t('order.serviceCards.wordpress.title', locale)}</span>
                <span class="text-[0.65rem] sm:text-xs text-muted-foreground">Rp 1.500.000</span>
              </button>
              <button type="button" data-service="uiux" data-price="1000000" class="service-btn glass-panel rounded-xl p-3 sm:p-4 text-center transition hover:scale-105 active:scale-[0.98] min-h-[44px]">
                <span class="block font-medium text-sm sm:text-base">{t('order.serviceCards.uiux.title', locale)}</span>
                <span class="text-[0.65rem] sm:text-xs text-muted-foreground">Rp 1.000.000</span>
              </button>
            </div>
            <input type="hidden" name="service" id="selected-service" />
          </div>
          
          <div>
            <label for="order-name" class="block text-sm font-medium text-foreground mb-2">
              {t('order.name', locale)} *
            </label>
            <input 
              id="order-name"
              type="text" 
              name="name" 
              required
              autocomplete="name"
              placeholder={t('order.namePlaceholder', locale)}
              class="w-full glass-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label for="order-whatsapp" class="block text-sm font-medium text-foreground mb-2">
              {t('order.phone', locale)} *
            </label>
            <input 
              id="order-whatsapp"
              type="tel" 
              name="whatsapp" 
              required
              autocomplete="tel"
              placeholder={t('order.phonePlaceholder', locale)}
              class="w-full glass-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div>
            <label for="order-description" class="block text-sm font-medium text-foreground mb-2">
              {t('order.projectDescription', locale)} *
            </label>
            <textarea 
              id="order-description"
              name="description" 
              required
              rows="4"
              placeholder={t('order.descriptionPlaceholder', locale)}
              class="w-full glass-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            id="submit-btn"
            class="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 sm:py-4 font-semibold text-primary-foreground transition hover:bg-primary/90 active:bg-primary/80 min-h-[44px]"
          >
            {t('order.submit', locale)}
            <ArrowRight class="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  </main>
</Layout>

<script>
  const WA_NUMBER = '6281999900306'

  const SERVICE_LABELS: Record<string, string> = {
    web: 'Website Development',
    mobile: 'Mobile App Development',
    wordpress: 'WordPress Development',
    uiux: 'UI/UX Design'
  }

  const SERVICE_PRICES: Record<string, number> = {
    web: 2500000,
    mobile: 5000000,
    wordpress: 1500000,
    uiux: 1000000
  }

  function formatPrice(n: number): string {
    return `Rp ${n.toLocaleString('id-ID')}`
  }

  function normalizeWhatsapp(wa: string): string {
    let cleaned = wa.replace(/\D/g, '')
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1)
    if (!cleaned.startsWith('62')) cleaned = '62' + cleaned
    return cleaned
  }

  function buildWhatsAppMessage(data: {
    orderId: string
    serviceType: string
    price: number
    customerName: string
    whatsapp: string
    description: string
  }): string {
    return `Halo, saya ingin order jasa di Ekalliptus 🙏

📋 *Detail Order:*
• Order ID: ${data.orderId.slice(0, 8).toUpperCase()}
• Layanan: ${SERVICE_LABELS[data.serviceType] || data.serviceType}
• Harga: ${formatPrice(data.price)}

👤 *Data Saya:*
• Nama: ${data.customerName}
• WhatsApp: ${data.whatsapp}

📝 *Deskripsi Project:*
${data.description}

Mohon informasi selanjutnya untuk proses pembayaran. Terima kasih!`
  }

  const serviceBtns = document.querySelectorAll('.service-btn')
  const selectedServiceInput = document.getElementById('selected-service') as HTMLInputElement
  let selectedService = ''

  serviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      serviceBtns.forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      selectedService = btn.getAttribute('data-service') || ''
      selectedServiceInput.value = selectedService
    })
  })

  document.getElementById('order-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    if (!selectedService) {
      alert('Pilih layanan terlebih dahulu')
      return
    }
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement
    
    submitBtn.disabled = true
    submitBtn.textContent = 'Memproses...'

    const customerName = (formData.get('name') as string).trim()
    const whatsapp = (formData.get('whatsapp') as string).trim()
    const description = (formData.get('description') as string).trim()

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: selectedService,
          customer_name: customerName,
          whatsapp: normalizeWhatsapp(whatsapp),
          description
        })
      })
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert('Gagal membuat order: ' + (err.error || 'Silakan coba lagi'))
        return
      }

      const result = await response.json()
      const { orderId, price, serviceType } = result.data

      const message = buildWhatsAppMessage({
        orderId,
        serviceType,
        price,
        customerName,
        whatsapp,
        description
      })

      window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
    } catch (error) {
      console.error('Order error:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Kirim Order'
    }
  })
</script>
```

- [ ] **Step 2: Verify the page builds**

Run: `npx astro build 2>&1 | tail -10`
Expected: Build succeeds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/order.astro
git commit -m "feat(order): simplify form and add WhatsApp redirect"
```

---

### Task 5: Update order detail API endpoint

**Files:**
- Modify: `src/pages/api/order/[id].ts`

- [ ] **Step 1: Simplify the order detail response**

Replace the entire content of `src/pages/api/order/[id].ts` with:

```typescript
import type { APIRoute } from 'astro'
import { getSupabase } from '../../../lib/supabase'

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order ID is required'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection failed'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !order) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: order.id,
        customerName: order.customer_name,
        whatsapp: order.whatsapp,
        serviceType: order.service_type,
        description: (order as any).description || (order.scope as any)?.description || '',
        price: (order as any).price || (order.pricing as any)?.grand_total || 0,
        status: order.status,
        createdAt: order.created_at
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/order/[id].ts
git commit -m "feat(api): simplify order detail endpoint"
```

---

### Task 6: Update admin orders list page

**Files:**
- Modify: `src/pages/admin/orders/index.astro`

- [ ] **Step 1: Update service filter options, status filter options, and table columns**

In `src/pages/admin/orders/index.astro`, replace the `filters` array in the `SearchFilter` component (lines 41-57) with:

```astro
    filters={[
      { name: 'service', label: 'Layanan', selected: service, options: [
        { value: '', label: 'Semua Layanan' },
        { value: 'website', label: 'Website' },
        { value: 'wordpress', label: 'WordPress' },
        { value: 'mobile', label: 'Mobile App' },
        { value: 'editing', label: 'UI/UX Design' }
      ]},
      { name: 'status', label: 'Status', selected: status, options: [
        { value: '', label: 'Semua Status' },
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
        { value: 'cancelled', label: 'Cancelled' }
      ]}
    ]}
```

- [ ] **Step 2: Update table header — replace "Total" with "Harga"**

Replace the `<thead>` row (line 71):

```html
              <th class="pb-3">Order ID</th><th class="pb-3">Customer</th><th class="pb-3">Layanan</th><th class="pb-3 text-right">Total</th><th class="pb-3">Status</th><th class="pb-3"></th>
```

with:

```html
              <th class="pb-3">Order ID</th><th class="pb-3">Customer</th><th class="pb-3">Layanan</th><th class="pb-3 text-right">Harga</th><th class="pb-3">Status</th><th class="pb-3"></th>
```

- [ ] **Step 3: Update table body — use price instead of pricing.grand_total**

Replace the total cell (line 83):

```html
                <td class="py-3 text-right font-medium">{fmt(Number((o.pricing as any)?.grand_total ?? 0))}</td>
```

with:

```html
                <td class="py-3 text-right font-medium">{fmt(Number((o as any).price ?? (o.pricing as any)?.grand_total ?? 0))}</td>
```

- [ ] **Step 4: Update search filter — remove email from search since it's no longer collected**

Replace the search `or` clause on line 23:

```typescript
  if (search) q = q.or(`customer_name.ilike.%${search}%,email.ilike.%${search}%,whatsapp.ilike.%${search}%`)
```

with:

```typescript
  if (search) q = q.or(`customer_name.ilike.%${search}%,whatsapp.ilike.%${search}%`)
```

- [ ] **Step 5: Update the SearchFilter placeholder**

Replace:
```astro
    placeholder="Cari nama, email, WA..."
```
with:
```astro
    placeholder="Cari nama, WA..."
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/orders/index.astro
git commit -m "feat(admin): update orders list for simplified order system"
```

---

### Task 7: Update admin order detail page

**Files:**
- Modify: `src/pages/admin/orders/[id].astro`

- [ ] **Step 1: Update status dropdown options**

Replace the `<select>` block (lines 22-29) with:

```html
      <select id="status-select" class="rounded-lg border border-border bg-background px-3 py-2 text-sm">
        <option value="">Pilih status baru...</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
        <option value="cancelled">Cancelled</option>
      </select>
```

- [ ] **Step 2: Update the loadOrder function to show simplified fields**

Replace the `addField` calls in the `loadOrder` function (lines 77-87) with:

```javascript
      addField('Order ID', order.id)
      addField('Customer', order.customerName)
      addField('WhatsApp', order.whatsapp)
      addField('Service', order.serviceType)
      addField('Harga', formatCurrency(order.price))
      addField('Deskripsi', order.description)
      addField('Status', order.status)
      addField('Created', order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '')
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/orders/[id].astro
git commit -m "feat(admin): update order detail for simplified system"
```

---

### Task 8: Update admin orders API — new valid statuses

**Files:**
- Modify: `src/pages/api/admin/orders/[id].ts`

- [ ] **Step 1: Update VALID_STATUSES array**

Replace line 7:

```typescript
const VALID_STATUSES: OrderStatus[] = ['waiting_dp', 'dp_paid', 'waiting_onsite_payment', 'onsite_paid', 'cancelled']
```

with:

```typescript
const VALID_STATUSES: OrderStatus[] = ['new', 'contacted', 'in_progress', 'done', 'cancelled']
```

- [ ] **Step 2: Update admin orders list API search**

In `src/pages/api/admin/orders.ts`, replace line 22:

```typescript
  if (search) query = query.or(`customer_name.ilike.%${search}%,email.ilike.%${search}%,whatsapp.ilike.%${search}%`)
```

with:

```typescript
  if (search) query = query.or(`customer_name.ilike.%${search}%,whatsapp.ilike.%${search}%`)
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/admin/orders/[id].ts src/pages/api/admin/orders.ts
git commit -m "feat(admin-api): update order statuses and search for simplified system"
```

---

### Task 9: Delete all payment gateway code

**Files:**
- Delete: `src/lib/payment/` (entire directory)
- Delete: `src/pages/payment.astro`
- Delete: `src/pages/payment/[id].astro`
- Delete: `src/pages/order-success.astro`
- Delete: `src/pages/order-success/[id].astro` (check if directory exists)
- Delete: `src/pages/api/payment/create.ts`
- Delete: `src/pages/api/payment/[id].ts`
- Delete: `src/pages/api/payment/by-order/[orderId].ts`
- Delete: `src/pages/api/webhook/midtrans.ts`
- Delete: `src/pages/api/webhook/pakasir.ts`

- [ ] **Step 1: Delete payment library**

```bash
rm -rf src/lib/payment/
```

- [ ] **Step 2: Delete payment pages**

```bash
rm -f src/pages/payment.astro
rm -rf src/pages/payment/
rm -f src/pages/order-success.astro
rm -rf src/pages/order-success/
```

- [ ] **Step 3: Delete payment API endpoints and webhooks**

```bash
rm -rf src/pages/api/payment/
rm -rf src/pages/api/webhook/
```

- [ ] **Step 4: Verify build still works**

Run: `npx astro build 2>&1 | tail -10`
Expected: Build succeeds. No broken imports referencing deleted files.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove all payment gateway code (pages, API, lib, webhooks)"
```

---

### Task 10: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Remove payment gateway env vars, add new ones**

Replace the entire "Payment Gateway Configuration" section and everything below it with:

```
# Google Sheets Sync (for Edge Function)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id

# Telegram Bot Notification (for Edge Function)
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_chat_or_group_id
```

Keep the Supabase and AWS S3 sections unchanged.

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: update env example - remove payment vars, add sheets/telegram"
```

---

### Task 11: Create Supabase Edge Function for Sheets sync + Telegram notification

**Files:**
- Create: `supabase/functions/order-webhook/index.ts`

- [ ] **Step 1: Create the Edge Function directory**

```bash
mkdir -p supabase/functions/order-webhook
```

- [ ] **Step 2: Write the Edge Function**

Create `supabase/functions/order-webhook/index.ts`:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SERVICE_LABELS: Record<string, string> = {
  website: 'Website Development',
  mobile: 'Mobile App Development',
  wordpress: 'WordPress Development',
  editing: 'UI/UX Design',
  web: 'Website Development',
  uiux: 'UI/UX Design'
}

function formatPrice(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<{ success: boolean; result?: T; error?: string; attempts: number }> {
  let lastError = ''
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn()
      return { success: true, result, attempts: attempt }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
      }
    }
  }
  return { success: false, error: lastError, attempts: maxAttempts }
}

async function getGoogleAccessToken(email: string, privateKey: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const claimSet = btoa(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }))

  const signInput = `${header}.${claimSet}`
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(signInput)
  )
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const jwt = `${header}.${claimSet}.${sig}`
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  if (!tokenRes.ok) throw new Error(`Token request failed: ${tokenRes.status}`)
  const { access_token } = await tokenRes.json()
  return access_token
}

async function appendToGoogleSheets(order: any): Promise<void> {
  const email = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')!
  const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY')!.replace(/\\n/g, '\n')
  const sheetId = Deno.env.get('GOOGLE_SHEET_ID')!

  const accessToken = await getGoogleAccessToken(email, privateKey)
  const timestamp = new Date(order.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  const price = order.price || (order.pricing as any)?.grand_total || 0
  const description = order.description || (order.scope as any)?.description || ''

  const values = [[
    order.id,
    order.customer_name,
    order.whatsapp,
    order.service_type,
    formatPrice(price),
    description,
    timestamp
  ]]

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:G:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Sheets API error ${res.status}: ${body}`)
  }
}

async function sendTelegramNotification(order: any): Promise<void> {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')!

  const price = order.price || (order.pricing as any)?.grand_total || 0
  const description = order.description || (order.scope as any)?.description || ''
  const serviceLabel = SERVICE_LABELS[order.service_type] || order.service_type

  const text = `🔔 *Order Baru\\!*

📋 Order ID: \`${order.id.slice(0, 8)}\`
👤 Nama: ${escapeMarkdown(order.customer_name)}
📱 WhatsApp: ${escapeMarkdown(order.whatsapp)}
🛠 Layanan: ${escapeMarkdown(serviceLabel)}
💰 Harga: ${escapeMarkdown(formatPrice(price))}

📝 ${escapeMarkdown(description)}`

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Telegram API error ${res.status}: ${body}`)
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const order = payload.record

    if (!order || !order.id) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const [sheetsResult, telegramResult] = await Promise.allSettled([
      withRetry(() => appendToGoogleSheets(order)),
      withRetry(() => sendTelegramNotification(order))
    ])

    const sheetsOutcome = sheetsResult.status === 'fulfilled' ? sheetsResult.value : { success: false, error: String(sheetsResult.reason), attempts: 0 }
    const telegramOutcome = telegramResult.status === 'fulfilled' ? telegramResult.value : { success: false, error: String(telegramResult.reason), attempts: 0 }

    const failures: { order_id: string; target: string; error_message: string; attempts: number }[] = []

    if (!sheetsOutcome.success) {
      failures.push({
        order_id: order.id,
        target: 'sheets',
        error_message: sheetsOutcome.error || 'Unknown error',
        attempts: sheetsOutcome.attempts
      })
    }

    if (!telegramOutcome.success) {
      failures.push({
        order_id: order.id,
        target: 'telegram',
        error_message: telegramOutcome.error || 'Unknown error',
        attempts: telegramOutcome.attempts
      })
    }

    if (failures.length > 0) {
      await supabase.from('order_sync_failures').insert(failures)
    }

    return new Response(JSON.stringify({
      sheets: sheetsOutcome.success ? 'ok' : 'failed',
      telegram: telegramOutcome.success ? 'ok' : 'failed'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
```

- [ ] **Step 3: Verify Edge Function syntax**

Run: `deno check supabase/functions/order-webhook/index.ts 2>&1 | head -20` (if Deno installed)
Or just verify no obvious syntax errors.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/order-webhook/index.ts
git commit -m "feat(edge): add order-webhook Edge Function for Sheets sync + Telegram notif"
```

---

### Task 12: Clean up supabase.ts — remove unused payment/voucher functions

**Files:**
- Modify: `src/lib/supabase.ts`

- [ ] **Step 1: Remove validateVoucher and incrementVoucherUsage functions**

Delete the `validateVoucher` function (lines 184-230) and `incrementVoucherUsage` function (lines 232-246) from `src/lib/supabase.ts`.

Also update the import in `src/lib/supabase.ts` line 2 — remove `OrderStatus` from the import if it's no longer used in this file (check the `updateOrderStatus` function still uses it — it does, so keep it).

- [ ] **Step 2: Verify build**

Run: `npx astro build 2>&1 | tail -10`
Expected: No import errors anywhere.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "refactor: remove unused voucher functions from supabase lib"
```

---

### Task 13: End-to-end verification

- [ ] **Step 1: Full build check**

```bash
npx astro build 2>&1 | tail -20
```

Expected: Clean build, no errors.

- [ ] **Step 2: Verify deleted files are gone**

```bash
ls src/lib/payment/ 2>&1
ls src/pages/payment/ 2>&1  
ls src/pages/payment.astro 2>&1
ls src/pages/order-success.astro 2>&1
ls src/pages/api/payment/ 2>&1
ls src/pages/api/webhook/ 2>&1
```

Expected: All "No such file or directory".

- [ ] **Step 3: Verify order form page loads**

```bash
npx astro dev &
sleep 3
curl -s http://localhost:4321/order | grep -c "order-form"
kill %1
```

Expected: Returns `1` (form element exists).

- [ ] **Step 4: Verify no broken imports across codebase**

```bash
grep -r "from.*lib/payment" src/ --include="*.ts" --include="*.astro"
grep -r "from.*payment" src/pages/ --include="*.ts" --include="*.astro" | grep -v node_modules
```

Expected: No results — no files reference the deleted payment modules.

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git status
```
