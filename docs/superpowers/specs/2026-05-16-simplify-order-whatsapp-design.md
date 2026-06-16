# Simplify Order System: Form → Spreadsheet → WhatsApp

## Overview

Menyederhanakan sistem order dari payment gateway flow menjadi: form → Supabase → Google Sheets + WhatsApp redirect. Semua transaksi pembayaran ditangani via WhatsApp langsung.

## Architecture

```
┌─────────────┐     POST /api/order      ┌──────────────┐
│  Order Form  │ ──────────────────────── │  Astro API   │
│  (minimal)   │                          │  /api/order  │
└──────┬───────┘                          └──────┬───────┘
       │                                         │
       │ redirect                          INSERT order
       ▼                                         │
┌─────────────┐                          ┌───────▼───────┐
│  wa.me link  │                          │   Supabase    │
│  + greeting  │                          │   orders DB   │
│  + order data│                          └───────┬───────┘
└─────────────┘                                   │
                                          DB webhook (on INSERT)
                                                  │
                                          ┌───────▼────────┐
                                          │  Edge Function  │
                                          │  order-webhook  │
                                          └───┬────────┬───┘
                                              │        │
                                     retry ≤3x│        │retry ≤3x
                                              ▼        ▼
                                      ┌─────────┐ ┌──────────┐
                                      │ Google   │ │ Telegram │
                                      │ Sheets   │ │ Bot API  │
                                      └─────────┘ └──────────┘
```

## Order Form (Simplified)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| service_type | radio | yes | web (Rp 2.5jt), mobile (Rp 5jt), wordpress (Rp 1.5jt), uiux (Rp 1jt) |
| customer_name | text | yes | |
| whatsapp | tel | yes | Format: 08xxx, auto-convert ke 628xxx |
| description | textarea | yes | Deskripsi project |

Removed fields: email, company, urgency, payment_option, voucher_code.

## Data Model

### orders table (simplified columns used)

```sql
id              uuid DEFAULT gen_random_uuid()
customer_name   text NOT NULL
whatsapp        text NOT NULL
service_type    text NOT NULL  -- 'web','mobile','wordpress','uiux'
description     text NOT NULL
price           integer NOT NULL  -- harga dasar dari service_type
status          text DEFAULT 'new'  -- 'new','contacted','in_progress','done','cancelled'
created_at      timestamptz DEFAULT now()
```

Status flow: `new` → `contacted` → `in_progress` → `done`

### order_sync_failures table (new)

```sql
id              uuid DEFAULT gen_random_uuid()
order_id        uuid REFERENCES orders(id)
target          text NOT NULL  -- 'sheets' atau 'telegram'
error_message   text
attempts        integer DEFAULT 0
resolved        boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

### Google Sheets columns

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Order ID | Nama | WhatsApp | Service | Harga | Deskripsi | Tanggal |

## WhatsApp Redirect

After successful order submission, client redirects to:

```
https://wa.me/6281999900306?text={encodeURIComponent(message)}
```

### Message template

```
Halo, saya ingin order jasa di Ekalliptus 🙏

📋 *Detail Order:*
• Order ID: {orderId}
• Layanan: {serviceLabel}
• Harga: Rp {price}

👤 *Data Saya:*
• Nama: {customerName}
• WhatsApp: {whatsapp}

📝 *Deskripsi Project:*
{description}

Mohon informasi selanjutnya untuk proses pembayaran. Terima kasih!
```

Service label mapping:
- web → "Website Development"
- mobile → "Mobile App Development"
- wordpress → "WordPress Development"
- uiux → "UI/UX Design"

Price formatted: `Rp 2.500.000`

## Edge Function: order-webhook

Triggered by Supabase Database Webhook on `orders` INSERT.

### Google Sheets sync

- Authenticate via Google Service Account (JWT)
- `POST googleapis.com/v4/spreadsheets/{sheetId}/values:append`
- Append row: [orderId, nama, wa, service, harga, deskripsi, timestamp]

### Telegram notification

- `POST api.telegram.org/bot{token}/sendMessage`
- `chat_id`: admin group/user ID
- `parse_mode`: Markdown

Message format:

```
🔔 *Order Baru!*

📋 Order ID: `{orderId}`
👤 Nama: {customerName}
📱 WhatsApp: {whatsapp}
🛠 Layanan: {serviceLabel}
💰 Harga: Rp {price}

📝 {description}
```

### Retry logic

```
for each target (sheets, telegram):
  attempts = 0
  while attempts < 3:
    try → call API → break
    catch → attempts++ → sleep(2^attempts * 1000)  // 2s, 4s, 8s
  
  if failed after 3x:
    INSERT into order_sync_failures
```

- Sheets and Telegram called in parallel (`Promise.allSettled`)
- Each has independent retry
- Failure of one does not block the other

## Cleanup: Files Removed

### Payment library (entire `src/lib/payment/` directory)

- `src/lib/payment/types.ts`
- `src/lib/payment/index.ts`
- `src/lib/payment/services/payment.service.ts`
- `src/lib/payment/services/webhook.service.ts`
- `src/lib/payment/adapters/base.adapter.ts`
- `src/lib/payment/adapters/midtrans.adapter.ts`
- `src/lib/payment/adapters/pakasir.adapter.ts`
- `src/lib/payment/adapters/index.ts`

### Payment pages

- `src/pages/payment.astro`
- `src/pages/payment/[id].astro`
- `src/pages/order-success.astro`
- `src/pages/order-success/[id].astro`

### Payment API endpoints

- `src/pages/api/payment/create.ts`
- `src/pages/api/payment/[id].ts`
- `src/pages/api/payment/by-order/[orderId].ts`
- `src/pages/api/webhook/midtrans.ts`
- `src/pages/api/webhook/pakasir.ts`

## Files Modified

- `src/pages/order.astro` — simplify form, remove pricing logic, add wa.me redirect
- `src/pages/api/order.ts` — simplify: insert only, remove payment/voucher logic
- `src/pages/admin/orders/index.astro` — update table columns, status enum
- `src/pages/admin/orders/[id].astro` — simplify detail, update status dropdown
- `src/pages/api/admin/orders.ts` — simpler query
- `src/pages/api/admin/orders/[id].ts` — update VALID_STATUSES
- `.env.example` — remove payment vars, add Sheets/Telegram vars

## Environment Variables

### Removed

```
MIDTRANS_CLIENT_KEY, MIDTRANS_SERVER_KEY, MIDTRANS_IS_PRODUCTION
PAKASIR_API_KEY, PAKASIR_MERCHANT_CODE, PAKASIR_IS_PRODUCTION
QIOSPAY_API_KEY, QIOSPAY_MERCHANT_CODE, QIOSPAY_IS_PRODUCTION
SANPAY_API_KEY, SANPAY_MERCHANT_CODE, SANPAY_IS_PRODUCTION
TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY, TRIPAY_MERCHANT_CODE, TRIPAY_IS_PRODUCTION
```

### Added

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SHEET_ID=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

## New Files

- `supabase/functions/order-webhook/index.ts` — Edge Function for Sheets sync + Telegram notif
