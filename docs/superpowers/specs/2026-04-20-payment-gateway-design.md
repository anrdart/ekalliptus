# Payment Gateway Integration Design Spec

**Project:** Ekalliptus Digital - Payment Gateway System
**Date:** 2026-04-20
**Status:** Approved
**Author:** Claude (with user approval)

---

## 1. Overview

### 1.1 Purpose

Integrate a multi-gateway QRIS payment system into Ekalliptus Digital website with:
- Full automation: payment success → auto status update → admin notification
- Multi-gateway support (5 QRIS providers)
- Payment option: Full or DP (Deposit)
- Integrated admin panel for management

### 1.2 Scope

**In Scope:**
- Multi-gateway QRIS integration (Midtrans, Pakasir, Qiospay, Sanpay, Tripay)
- Payment flow with Full/DP options
- Consultation scheduling for DP orders
- Embedded admin panel (`/admin`)
- Webhook handling with signature verification
- Payment logs and statistics

**Out of Scope:**
- Malaysia gateways (ToyyibPay, Billplz, CHIP)
- Pterodactyl integration
- Reseller API (H2H)
- User dashboard (future phase)

---

## 2. Architecture

### 2.1 High-Level Diagram

```
User Browser → Ekalliptus Website (Astro) → API Routes
                                               ↓
                    ┌────────────────────────┴────────────────────────┐
                    ↓                                                 ↓
            Supabase (Database)                            Payment Module (Adapters)
                    ↑                                                 ↓
                    └─────────────────────────────────────────────────┤
                                                                     ↓
                                                             Payment Gateways
                                                                     (QRIS External)
                    ↑
                    └─────────────────────────────────────────────────┤
                                                                     ↓
                                                        Admin Panel (/admin)
```

### 2.2 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Astro, Tailwind CSS |
| Backend | Astro API Routes |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Payment | Custom adapter pattern |

---

## 3. Data Model

### 3.1 New Tables

**payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL,
  gateway_transaction_id TEXT,
  amount NUMERIC NOT NULL,
  payment_type TEXT NOT NULL, -- 'full' or 'dp'
  status TEXT NOT NULL DEFAULT 'pending',
  payment_url TEXT,
  qr_string TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  webhook_received_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**payment_gateways**
```sql
CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  fee_percent NUMERIC DEFAULT 0.7,
  fee_flat NUMERIC DEFAULT 0,
  supports_qr BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**consultations**
```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**payment_logs**
```sql
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  gateway TEXT NOT NULL,
  event_type TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status TEXT NOT NULL,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Updated Tables

**orders** - Add columns:
- `payment_option` TEXT (full/dp)
- `consultation_required` BOOLEAN

---

## 4. Services & Pricing

### 4.1 Available Services

| Service | Base Price | DP % |
|---------|-----------|------|
| Website Development | Rp 2.500.000 | 50% |
| Mobile App Development | Rp 5.000.000 | 50% |
| WordPress Development | Rp 1.500.000 | 50% |
| UI/UX Design | Rp 1.000.000 | 30% |

### 4.2 Urgency Multiplier

| Level | Multiplier | Timeline |
|-------|-----------|----------|
| Normal | 1.0x | Standard |
| Express | 1.25x | +50% faster |
| Priority | 1.5x | Fastest |

### 4.3 Removed Services

- Video & Photo Editing
- Service Perangkat

---

## 5. Payment Flow

### 5.1 Order Creation Flow

```
1. User fills order form
   → Service selection, details, urgency

2. User selects payment option
   → Full payment OR DP (deposit)

3. System calculates totals
   → Base price × urgency + PPN 11%

4. User selects gateway
   → From active gateways (by priority)

5. System creates payment transaction
   → Generate QR/payment URL

6. User redirected to payment page
   → /payment/{orderId}
```

### 5.2 Payment Success Flow

```
1. Gateway sends webhook
   → POST /api/webhook/{gateway}

2. Server validates webhook
   → Signature verification
   → Amount validation
   → Duplicate check

3. System updates status
   → payment.status = 'paid'
   → order.status = 'paid' or 'awaiting_consultation'

4. If DP: create consultation
   → consultations record created

5. Send notifications
   → In-app, Email, WhatsApp (optional)

6. Redirect user
   → /order-success/{orderId}
```

### 5.3 Order Status Flow

```
pending → paid → processing → completed
                ↓
        awaiting_consultation → consultation_done → processing
```

---

## 6. File Structure

### 6.1 Payment Module

```
src/lib/payment/
├── index.ts
├── types.ts
├── adapters/
│   ├── index.ts
│   ├── base.adapter.ts
│   ├── midtrans.adapter.ts
│   ├── pakasir.adapter.ts
│   ├── qiospay.adapter.ts
│   ├── sanpay.adapter.ts
│   └── tripay.adapter.ts
├── services/
│   ├── payment.service.ts
│   ├── webhook.service.ts
│   └── notification.service.ts
└── utils/
    ├── signature.ts
    └── formatter.ts
```

### 6.2 Admin Panel

```
src/pages/admin/
├── index.astro
├── orders/
│   ├── index.astro
│   └── [id].astro
├── payments/
│   ├── index.astro
│   ├── gateways/
│   │   ├── index.astro
│   │   └── [id].astro
│   └── logs.astro
├── consultations/
│   ├── index.astro
│   └── [id].astro
├── settings/
│   └── index.astro
└── layout.astro
```

---

## 7. API Endpoints

### 7.1 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/order` | Create new order |
| GET | `/api/order/:id` | Get order status |
| POST | `/api/payment/create` | Create payment transaction |
| GET | `/api/payment/:id` | Get payment status & QR |
| POST | `/api/payment/:id/check` | Manual status check |

### 7.2 Webhook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook/midtrans` | Midtrans callback |
| POST | `/api/webhook/pakasir` | Pakasir callback |
| POST | `/api/webhook/qiospay` | Qiospay callback |
| POST | `/api/webhook/sanpay` | Sanpay callback |
| POST | `/api/webhook/tripay` | Tripay callback |

### 7.3 Admin Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/orders` | List orders |
| GET | `/api/admin/orders/:id` | Order detail |
| PUT | `/api/admin/orders/:id` | Update order |
| GET | `/api/admin/payments` | List payments |
| GET | `/api/admin/payments/:id` | Payment detail |
| GET | `/api/admin/gateways` | List gateways |
| POST | `/api/admin/gateways` | Add gateway |
| PUT | `/api/admin/gateways/:id` | Update gateway |
| DELETE | `/api/admin/gateways/:id` | Delete gateway |
| GET | `/api/admin/consultations` | List consultations |
| PUT | `/api/admin/consultations/:id` | Update consultation |
| GET | `/api/admin/logs` | Payment logs |

---

## 8. Admin Panel Features

### 8.1 Dashboard (`/admin`)

- Revenue statistics (daily, weekly, monthly)
- Order counts & status breakdown
- Pending payments count
- Revenue chart (7 days)
- Top services
- Recent orders list

### 8.2 Gateway Management

- List all gateways with status
- Toggle active/inactive
- Set priority order
- Configure API keys
- View gateway statistics
- Test connection

### 8.3 Payment Monitoring

- Payment history with filters
- Payment detail view
- Webhook logs
- Error tracking
- Refund handling (future)

### 8.4 Consultation Management

- List scheduled consultations
- Schedule new consultations
- Update consultation status
- Add meeting links
- Send reminders

---

## 9. Security Considerations

### 9.1 Webhook Verification

All webhooks MUST verify:
1. Signature from gateway (HMAC-SHA256)
2. Amount matches expected
3. Transaction ID not previously processed
4. IP whitelist (optional)

### 9.2 Admin Access Control

- Supabase Auth with role-based access
- Email domain whitelist (ekalliptus.com)
- RLS policies on all admin tables
- Optional 2FA

### 9.3 Data Protection

- API keys encrypted at rest
- Sensitive data in metadata (JSONB)
- Audit trail for all admin actions
- Rate limiting on public endpoints

---

## 10. Error Handling

### 10.1 Payment Error Types

| Error | Handling | User Message |
|-------|----------|--------------|
| Gateway timeout | Retry 3x, exponential backoff | "Memproses..." |
| Invalid signature | Log, reject | 400 Bad Request |
| Duplicate payment | Check existing, ignore | 200 OK |
| Payment expired | Update status | "Kadaluarsa" |
| Amount mismatch | Flag for review | - |

### 10.2 Response Format

```typescript
// Success
{ success: true, data: {...}, meta?: {...} }

// Error
{ success: false, error: { code, message, details? } }
```

---

## 11. Notification System

### 11.1 Channels

1. In-app notification (Supabase)
2. Email notification
3. WhatsApp (optional, via API)
4. Browser push (optional)

### 11.2 Events

- New order created
- Payment received
- Payment failed
- Consultation scheduled
- Consultation completed

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1)
- Database schema creation
- Base payment infrastructure
- Basic admin auth

### Phase 2: Gateway Integration (Week 2)
- Midtrans adapter
- Pakasir adapter
- Webhook handlers
- Payment flow implementation

### Phase 3: Admin Panel (Week 2-3)
- Dashboard
- Gateway management
- Order & payment views
- Consultation management

### Phase 4: Additional Gateways (Week 3)
- Qiospay adapter
- Sanpay adapter
- Tripay adapter

### Phase 5: Testing & Launch (Week 4)
- End-to-end testing
- Security review
- Documentation
- Deployment

---

## 13. Success Criteria

1. ✅ Payment created within 5 seconds
2. ✅ Webhook processed within 3 seconds
3. ✅ Payment page displays QR correctly
4. ✅ Admin receives notification after payment
5. ✅ Consultation auto-created for DP orders
6. ✅ Gateway configuration works without restart
7. ✅ All webhooks properly verified
8. ✅ Zero data loss (idempotent operations)

---

## 14. References

- Auto_Order_BOT: https://github.com/jundy779/Auto_Order_BOT
- Payment Design: `docs/PAYMENT_DESIGN.md` (reference repo)
- Current project: `/home/ekalliptus/dev/ekalliptus`

---

**Approved by:** User
**Date:** 2026-04-20
