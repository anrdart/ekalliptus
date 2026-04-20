# Payment Gateway Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate multi-gateway QRIS payment system with automated flow, Full/DP payment options, and embedded admin panel

**Architecture:** Modular adapter pattern for payment gateways, Supabase as single source of truth, embedded admin panel in Astro website

**Tech Stack:** Astro, TypeScript, Supabase (PostgreSQL), Tailwind CSS

---

## Security Note

**IMPORTANT:** When implementing client-side code that manipulates DOM, always use textContent for plain text. For HTML content, use DOMPurify or similar sanitization. Never use innerHTML with untrusted content.

---

## Phase 1: Foundation - Database & Types

### Task 1: Update Database Types

**File:** `src/types/database.ts`

Add after line 480:

```typescript
// Payment gateway enum
export type PaymentGateway = 'midtrans' | 'pakasir' | 'qiospay' | 'sanpay' | 'tripay'
export type PaymentStatusNew = 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'refunded'
export type PaymentTypeNew = 'full' | 'dp' | 'remaining'
export type ConsultationStatus = 'scheduled' | 'completed' | 'cancelled'

// Interface definitions for new tables
export interface Payment {
  id: string
  order_id: string
  gateway: PaymentGateway
  gateway_transaction_id: string | null
  amount: number
  payment_type: PaymentTypeNew
  status: PaymentStatusNew
  payment_url: string | null
  qr_string: string | null
  expires_at: string | null
  paid_at: string | null
  webhook_received_at: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

export interface PaymentGatewayConfig {
  id: string
  name: PaymentGateway
  display_name: string
  is_active: boolean
  priority: number
  config: Json
  fee_percent: number
  fee_flat: number
  supports_qr: boolean
}

export interface Consultation {
  id: string
  order_id: string
  payment_id: string | null
  scheduled_date: string | null
  scheduled_time: string | null
  meeting_link: string | null
  status: ConsultationStatus
  notes: string | null
  created_at: string
  updated_at: string
}
```

**Commit:** `git commit -m "feat: add payment gateway types"`

---

### Task 2: Create Database Migration

**File:** `supabase/migrations/20260420000001_payment_tables.sql`

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL CHECK (gateway IN ('midtrans', 'pakasir', 'qiospay', 'sanpay', 'tripay')),
  gateway_transaction_id TEXT,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('full', 'dp', 'remaining')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'expired', 'refunded')),
  payment_url TEXT,
  qr_string TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  webhook_received_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('midtrans', 'pakasir', 'qiospay', 'sanpay', 'tripay')),
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  fee_percent NUMERIC DEFAULT 0.7 CHECK (fee_percent >= 0),
  fee_flat NUMERIC DEFAULT 0 CHECK (fee_flat >= 0),
  supports_qr BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_logs (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);

-- Insert default gateways
INSERT INTO payment_gateways (name, display_name, priority, fee_percent) VALUES
  ('midtrans', 'Midtrans', 1, 0.7),
  ('pakasir', 'Pakasir', 2, 0.65),
  ('qiospay', 'Qiospay', 3, 0.7),
  ('sanpay', 'Sanpay', 4, 0.7),
  ('tripay', 'Tripay', 5, 0.7)
ON CONFLICT (name) DO NOTHING;

-- Add columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_option TEXT CHECK (payment_option IN ('full', 'dp'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS consultation_required BOOLEAN DEFAULT false;
```

**Commit:** `git commit -m "feat: add payment tables migration"`

---

### Task 3: Update Pricing Utility

**File:** `src/utils/pricing.ts`

Update to remove video/maintenance services and add payment option support:

```typescript
// Update SERVICE_TYPE_MAP - remove 'video', 'maintenance'
export const SERVICE_TYPE_MAP: Record<string, ServiceType> = {
  'web': 'website',
  'wordpress': 'wordpress',
  'mobile': 'mobile',
  'uiux': 'editing'
}

// Update SERVICE_PRICES - remove video, maintenance
export const SERVICE_PRICES: Record<string, number> = {
  'web': 2500000,
  'wordpress': 1500000,
  'mobile': 5000000,
  'uiux': 1000000
}

// Update deposit percentages
export const DEPOSIT_PERCENTAGES: Record<string, number> = {
  'web': 50,
  'wordpress': 50,
  'mobile': 50,
  'uiux': 30
}

// Add payment type handling to calculateOrder
interface CalculateOrderParams {
  // ... existing params
  paymentOption?: 'full' | 'dp'
}

export function calculateOrder(params: CalculateOrderParams): OrderCalculation {
  // ... existing calculation
  
  const paymentOption = params.paymentOption || 'full'
  const serviceDepositPct = DEPOSIT_PERCENTAGES[serviceId] || 50
  const depositPercentage = paymentOption === 'dp' ? serviceDepositPct : 100
  
  return {
    // ... existing return values
    depositPercentage,
    paymentOption
  }
}
```

**Commit:** `git commit -m "feat: update pricing for new services and payment options"`

---

## Phase 2: Payment Module

### Task 4-11: Create Payment Module Structure

**Files to create:**
1. `src/lib/payment/types.ts` - Type definitions
2. `src/lib/payment/adapters/base.adapter.ts` - Base adapter class
3. `src/lib/payment/adapters/midtrans.adapter.ts` - Midtrans implementation
4. `src/lib/payment/adapters/pakasir.adapter.ts` - Pakasir implementation
5. `src/lib/payment/adapters/index.ts` - Adapter registry
6. `src/lib/payment/services/payment.service.ts` - Payment service
7. `src/lib/payment/services/webhook.service.ts` - Webhook handler
8. `src/lib/payment/index.ts` - Barrel export

**Commit per file or grouped by feature**

---

## Phase 3: API Endpoints

### Task 12-15: Create API Endpoints

**Files to create:**
1. `src/pages/api/payment/create.ts` - Create payment
2. `src/pages/api/payment/[id].ts` - Get payment status
3. `src/pages/api/payment/by-order/[orderId].ts` - Get payment by order
4. `src/pages/api/webhook/midtrans.ts` - Midtrans webhook
5. `src/pages/api/webhook/pakasir.ts` - Pakasir webhook
6. `src/pages/api/order/[id].ts` - Order lookup
7. Update `src/pages/api/order.ts` - Add payment option support

---

## Phase 4: Frontend Pages

### Task 16-22: Update/Create Pages

**Files to modify/create:**
1. `src/pages/order.astro` - Add payment option selection, remove video/maintenance
2. `src/pages/payment/[id].astro` - New payment page with QR display
3. `src/pages/order-success/[id].astro` - New success page
4. `src/i18n/locales/en.json` - Add payment option translations
5. `src/i18n/locales/id.json` - Add payment option translations
6. `src/components/Services.astro` - Remove video/maintenance from display

---

## Phase 5: Admin Panel

### Task 23-27: Create Admin Pages

**Files to create:**
1. `src/pages/admin/layout.astro` - Admin layout with sidebar
2. `src/pages/admin/index.astro` - Dashboard
3. `src/pages/admin/orders/index.astro` - Orders list
4. `src/pages/admin/payments/gateways/index.astro` - Gateway management
5. `src/pages/api/admin/orders.ts` - Admin orders API
6. `src/pages/api/admin/gateways.ts` - Gateways API
7. `src/pages/api/admin/gateways/[id].ts` - Gateway detail API

---

## Phase 6: Testing & Documentation

### Task 28-30: Final Steps

1. Update `.env.example` with payment gateway variables
2. Create `docs/payment-integration.md` documentation
3. Type check: `npx tsc --noEmit`
4. Build: `bun run build`
5. Final commit

---

## Implementation Summary

**Total Tasks:** 30
**Estimated Time:** 3-4 weeks

**Key Deliverables:**
- ✅ Multi-gateway QRIS payment system
- ✅ Full/DP payment options with consultation scheduling
- ✅ Automated webhook processing
- ✅ Embedded admin panel
- ✅ Payment page with QR display and status polling
- ✅ Order success page
- ✅ Gateway management interface

**Next Steps After This Plan:**
1. Run database migrations
2. Configure gateway API keys
3. Test sandbox payments
4. Set up webhook URLs in gateway dashboards
5. Go live!
