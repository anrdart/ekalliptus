# Admin CRM — Design Spec

**Date:** 2026-05-05
**Project:** Ekalliptus Digital — transform existing admin dashboard into a complex CRM
**Approach:** Phased rollout (4 phases), reusing existing Astro + Supabase + Cloudflare stack

---

## 1. Goals & Context

Ekalliptus Digital is a multilingual digital agency website (Astro v6 + Supabase + Cloudflare Workers). The current admin section under `/admin` has placeholder pages with mock data and lacks proper authentication, customer management, sales pipeline, and content management.

This spec turns the admin into a complete CRM that supports:

- Real-time visibility into orders, payments, and consultations
- Customer relationship tracking with a 360° view
- Sales pipeline (Lead → Consultation → Proposal → Order → Won/Lost)
- Follow-up activities and reminders
- Analytics and reports
- Blog and voucher management
- Auditability and role-based access

**Business flow:** Mixed — clients either request a consultation first or place a direct order. The CRM must accommodate both paths.

**Notification preference:** In-dashboard only (badge + dropdown), no WhatsApp/email integration in scope.

**Database state at start:** Tables exist (orders, payments, consultations, blog_posts, vouchers, profiles, audit_logs, payment_gateways, order_attachments, consultation_messages) but contain no production data. Fresh-start design — no migration of legacy data.

---

## 2. Phased Rollout

| Phase | Theme | Duration (est.) | Outcome |
|-------|-------|-----------------|---------|
| **1** | Foundation | 1–2 weeks | Auth enforced, dashboard with real data, customers list + 360° view, orders/payments wired to Supabase |
| **2** | Pipeline & Activities | 1–2 weeks | New `leads` & `activities` tables, kanban pipeline, follow-up tasks, in-dashboard notifications |
| **3** | Analytics & Reports | 1 week | Revenue chart, conversion funnel, top services/customers, CSV export |
| **4** | Content & System | 1–2 weeks | Blog CRUD UI, voucher CRUD UI, audit log viewer, multi-role admin |

Each phase is independently deployable. Phase boundaries are review checkpoints — the project can stop or re-prioritize between phases.

---

## 3. Architecture

### 3.1 Stack (unchanged)

- **Framework:** Astro v6 (SSR mode)
- **Deployment:** Cloudflare Workers via `@astrojs/cloudflare`
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + existing `glass-card` design system
- **Icons:** lucide-astro
- **Package manager:** Bun
- **Test runner:** Vitest (already installed)

### 3.2 New dependencies

- **ApexCharts** (~140kb, lazy-loaded only on Dashboard and Reports pages)

No React/Vue. All admin pages remain Astro server-rendered with small inline `<script>` tags for interactivity (drag-drop kanban, charts, polling).

### 3.3 Authentication & authorization

**Current state (must fix in Phase 1):** `/admin/login` shows "Authentication is not enforced in this build" — anyone with the URL can access admin pages.

**Target design:**

- **Login flow:** Email + password against `auth.users` (Supabase Auth). On success, set HttpOnly cookie containing the Supabase session token.
- **Middleware:** New file `src/middleware.ts` runs on every request. For paths starting with `/admin/` or `/api/admin/`, validate the cookie. If invalid, redirect to `/admin/login`.
- **Role check:** A helper `requireRole(roles[])` reads `profiles.role` for the authenticated user and returns 403 if not allowed. Roles defined in `UserRole`: `owner | admin | finance | cs | tech | editor`.
- **Bootstrap:** Phase 1 ships with role check skeleton but only `owner` role is wired. Multi-role permissions land in Phase 4.

### 3.4 Data flow

- **SSR-first:** Astro pages fetch from Supabase server-side and render with data on first paint.
- **Live updates:** Small inline `<script>` polls JSON endpoints (e.g., `/api/admin/notifications` every 30s) and updates the DOM. No WebSocket / Supabase Realtime in scope.
- **Mutations:** Form submits and button actions POST/PATCH to `/api/admin/*` routes. Server validates, updates Supabase, returns JSON. Page either reloads or updates inline.

### 3.5 Error handling

- Server-side errors → 500 JSON `{ error: string }`, logged via `console.error` and (Phase 4) inserted into `audit_logs`.
- Client-side: toast notification on error, skeleton state during load, empty-state illustration when no data.
- Auth failures → redirect to `/admin/login` with `?next=` parameter to return after login.

---

## 4. Data Model

### 4.1 Phase 1 — No new tables

Customers are derived from existing `orders` table via aggregation:

```sql
SELECT
  whatsapp,
  MAX(customer_name) AS customer_name,
  MAX(email) AS email,
  MAX(company) AS company,
  COUNT(*) AS total_orders,
  SUM((pricing->>'grand_total')::bigint) AS total_spent,
  MAX(created_at) AS last_order_at
FROM orders
GROUP BY whatsapp
ORDER BY last_order_at DESC;
```

`whatsapp` is the natural identity key (orders have it as `NOT NULL`). The `pricing` JSON is shaped per `src/utils/pricing.ts`: `{ subtotal, discount, dpp, ppn, fee, grand_total, deposit, remaining, ... }`.

### 4.2 Phase 2 — Two new tables

**`leads`** — pipeline entities for pre-order tracking:

```sql
CREATE TYPE lead_stage AS ENUM (
  'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'
);

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  company TEXT,
  service_interest TEXT,
  stage lead_stage NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'manual',
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  notes TEXT,
  estimated_value BIGINT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_whatsapp ON leads(whatsapp);
CREATE INDEX idx_leads_consultation_id ON leads(consultation_id);
CREATE INDEX idx_leads_order_id ON leads(order_id);
```

`source` valid values: `'consultation' | 'direct_order' | 'referral' | 'manual'`. Stored as TEXT (not ENUM) for flexibility.

**`activities`** — follow-up tasks, notes, calls:

```sql
CREATE TYPE activity_type AS ENUM (
  'note', 'call', 'meeting', 'follow_up', 'task', 'email'
);

CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type activity_type NOT NULL DEFAULT 'note',
  title TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_order_id ON activities(order_id);
CREATE INDEX idx_activities_due_date ON activities(due_date) WHERE is_completed = false;

ALTER TABLE activities ADD CONSTRAINT activity_target_required
  CHECK (lead_id IS NOT NULL OR order_id IS NOT NULL);
```

`priority` valid values: `'low' | 'medium' | 'high'`. An activity belongs to either a lead, an order, or both — at least one must be non-null (enforced via the CHECK constraint above).

### 4.3 Existing tables — no schema changes

`orders`, `payments`, `consultations`, `consultation_messages`, `payment_gateways`, `vouchers`, `blog_posts`, `profiles`, `audit_logs`, `order_attachments` keep their current schema. The `src/types/database.ts` file is regenerated to include `leads` and `activities` after Phase 2 migration.

---

## 5. UI / Pages

### 5.1 Sidebar navigation (after Phase 4 complete)

Grouped menu items:

**UTAMA**
- Dashboard
- Customers
- Pipeline (Phase 2)
- Activities (Phase 2)

**TRANSAKSI**
- Orders
- Payments
- Consultations

**ANALITIK**
- Reports (Phase 3)

**KONTEN**
- Blog (Phase 4)
- Vouchers (Phase 4)

**SISTEM**
- Audit Logs (Phase 4)
- Settings

Phase 1 navigation includes only items not marked Phase 2/3/4.

### 5.2 Dashboard (`/admin`) — updated in Phase 1

Layout (top to bottom):
1. **Stats row** (4 cards): Today's revenue, monthly orders, pending payments, conversion rate. Real values from Supabase.
2. **Revenue chart** (2/3 width) + **Pipeline summary** (1/3 width). Chart shows last 7 days bar chart via ApexCharts.
3. **Recent orders table** (3/5 width) + **Top services list** (2/5 width).

Polling: stats refresh every 60 seconds via `/api/admin/dashboard`.

### 5.3 Customers list (`/admin/customers`) — Phase 1

- Search box (filters by name, email, whatsapp)
- Filter dropdown (service type)
- Sort dropdown (recent / total spend / total orders)
- Table columns: avatar+name+company, contact (email/wa), service, total orders, total spend, actions (view 👁, message 💬)
- Pagination 20/page

### 5.4 Customer detail (`/admin/customers/[id]`) — Phase 1

- Left column (220px): avatar, name, company, contact info, summary stats (total orders, total spend, consultations, lifecycle stage if any)
- Right column: tabbed view
  - **Orders** — list of all orders for this customer
  - **Payments** — list of payments
  - **Consultations** — list of consultation sessions
  - **Activities** (Phase 2) — follow-ups, notes
  - **Timeline** (Phase 2) — combined chronological view

`[id]` is the URL-encoded `whatsapp` field (since whatsapp is the identity key for derived customers).

### 5.5 Orders list (`/admin/orders`) — Phase 1 update

Replace mock data with Supabase queries. Existing UI structure (search, filter, table) is kept. Add pagination, sortable columns. Each row links to existing `/admin/orders/[id]` detail page.

### 5.6 Pipeline (`/admin/pipeline`) — Phase 2

Kanban board with 6 columns matching `lead_stage` enum (excluding `lost` shown as collapsed bottom strip):
- 🟣 NEW
- 💬 CONTACTED / KONSULTASI
- 🔵 QUALIFIED
- 📄 PROPOSAL
- 🤝 NEGOTIATION
- ✅ WON

Cards show: lead name, service interest, estimated value, scheduled consultation date if any. Drag-drop changes stage (calls `PATCH /api/admin/leads/[id]`). Header shows total leads count and total estimated value.

### 5.7 Activities (`/admin/activities`) — Phase 2

List view filtered by: due today / overdue / upcoming / completed. Form to create new activity (type, title, link to lead or order, due date, priority).

### 5.8 Reports (`/admin/reports`) — Phase 3

Three sections:
1. **Revenue trend** — line chart with daily/weekly/monthly toggle
2. **Conversion funnel** — visual funnel from leads → orders → paid
3. **Breakdown** — top services by revenue, top customers by spend, lead source breakdown

Export button downloads filtered data as CSV.

### 5.9 Blog management (`/admin/blog`) — Phase 4

- List of posts (per-locale, since `blog_posts` is multilingual): search, filter by status/locale.
- Create/edit page (`/admin/blog/[id]`): form with title, slug, locale picker, category, tags (comma-separated), description, body (HTML editor — see decision below), featured toggle, SEO fields, publish date.
- **HTML editor decision:** Use a simple `<textarea>` with markdown parsed via the existing `marked` dependency on save. Markdown is more author-friendly than raw HTML and converts deterministically.

### 5.10 Vouchers (`/admin/vouchers`) — Phase 4

- List of vouchers: code, type (percent/nominal), value, max_uses, used_count, valid_until, is_active toggle.
- Create form: all the above fields. Voucher codes auto-uppercased.

### 5.11 Audit logs (`/admin/audit-logs`) — Phase 4

Read-only viewer. Filter by table_name, action, user, date range. Display old_values → new_values diff for updates. Audit log writes are added to admin mutation API routes throughout the project.

---

## 6. API Routes

All routes under `/api/admin/*` require valid auth cookie. Permission failures return 401 (no cookie) or 403 (wrong role).

### 6.1 Phase 1
- `POST /api/admin/login` — email + password → set cookie
- `POST /api/admin/logout` — clear cookie (already exists; update to invalidate Supabase session)
- `GET /api/admin/dashboard` — stats + recent orders + top services + chart data (already exists; extend payload)
- `GET /api/admin/customers?search=&service=&sort=&page=` — paginated list
- `GET /api/admin/customers/[whatsapp]` — 360° detail
- `GET /api/admin/orders?status=&service=&search=&page=` — paginated list
- `PATCH /api/admin/orders/[id]` — update status (already exists implicitly; formalize)

### 6.2 Phase 2
- `GET /api/admin/leads?stage=&page=` — list
- `POST /api/admin/leads` — create
- `GET /api/admin/leads/[id]` — detail
- `PATCH /api/admin/leads/[id]` — update (stage, notes, etc.)
- `DELETE /api/admin/leads/[id]`
- `GET /api/admin/activities?filter=&page=`
- `POST /api/admin/activities`
- `PATCH /api/admin/activities/[id]` — toggle complete, edit
- `DELETE /api/admin/activities/[id]`
- `GET /api/admin/notifications` — unread counts (orders since `last_seen_at`, due activities, etc.)

### 6.3 Phase 3
- `GET /api/admin/reports/revenue?from=&to=&granularity=`
- `GET /api/admin/reports/funnel?from=&to=`
- `GET /api/admin/reports/breakdown?type=service|customer|source`
- `GET /api/admin/reports/export?type=&format=csv&from=&to=`

### 6.4 Phase 4
- `GET /api/admin/blog?locale=&status=&page=`
- `POST /api/admin/blog` — create post (markdown body converted to HTML via `marked`)
- `GET /api/admin/blog/[id]`
- `PATCH /api/admin/blog/[id]`
- `DELETE /api/admin/blog/[id]`
- `GET /api/admin/vouchers`
- `POST /api/admin/vouchers`
- `PATCH /api/admin/vouchers/[code]`
- `DELETE /api/admin/vouchers/[code]`
- `GET /api/admin/audit-logs?table=&action=&from=&to=&page=`

---

## 7. File Structure

### 7.1 New files (by phase)

**Phase 1:**
- `src/middleware.ts`
- `src/lib/admin/auth.ts` — `requireAuth(ctx)`, `requireRole(ctx, roles[])`, `getCurrentUser(ctx)`
- `src/lib/admin/customers.ts` — `listCustomers()`, `getCustomerByWhatsapp()`
- `src/components/admin/StatCard.astro`
- `src/components/admin/DataTable.astro`
- `src/components/admin/RevenueChart.astro` (ApexCharts wrapper)
- `src/components/admin/SearchFilter.astro`
- `src/components/admin/Pagination.astro`
- `src/components/admin/EmptyState.astro`
- `src/pages/admin/customers/index.astro`
- `src/pages/admin/customers/[id].astro`
- `src/pages/api/admin/login.ts`
- `src/pages/api/admin/customers.ts`
- `src/pages/api/admin/customers/[id].ts`

**Phase 2:**
- `src/lib/admin/leads.ts`
- `src/lib/admin/activities.ts`
- `src/lib/admin/notifications.ts`
- `src/components/admin/PipelineKanban.astro`
- `src/components/admin/ActivityList.astro`
- `src/components/admin/NotificationBell.astro`
- `src/pages/admin/pipeline/index.astro`
- `src/pages/admin/activities/index.astro`
- `src/pages/api/admin/leads.ts`, `leads/[id].ts`
- `src/pages/api/admin/activities.ts`, `activities/[id].ts`
- `src/pages/api/admin/notifications.ts`
- Migration: `scripts/crm-phase2-schema.sql`

**Phase 3:**
- `src/lib/admin/analytics.ts`
- `src/components/admin/FunnelChart.astro`
- `src/components/admin/ExportButton.astro`
- `src/pages/admin/reports/index.astro`
- `src/pages/api/admin/reports/*.ts`

**Phase 4:**
- `src/lib/admin/blog.ts`
- `src/lib/admin/vouchers.ts`
- `src/components/admin/MarkdownEditor.astro`
- `src/pages/admin/blog/index.astro`, `blog/[id].astro`
- `src/pages/admin/vouchers/index.astro`
- `src/pages/admin/audit-logs/index.astro`
- `src/pages/api/admin/blog.ts`, `blog/[id].ts`
- `src/pages/api/admin/vouchers.ts`, `vouchers/[code].ts`
- `src/pages/api/admin/audit-logs.ts`

### 7.2 Files updated

**Phase 1:**
- `src/pages/admin/index.astro` — replace mock data, add chart
- `src/pages/admin/layout.astro` — add Customers menu item, notification bell slot
- `src/pages/admin/login.astro` — real login form
- `src/pages/admin/orders/index.astro` — real Supabase data
- `src/pages/admin/orders/[id].astro` — wire to real data
- `src/pages/admin/payments/index.astro` — real data
- `src/pages/api/admin/dashboard.ts` — extend to include chart data
- `src/pages/api/admin/logout.ts` — invalidate Supabase session
- `src/pages/api/admin/orders.ts` — pagination, filters

**Phase 2:**
- `src/pages/admin/layout.astro` — add Pipeline & Activities menu items
- `src/pages/admin/index.astro` — pipeline summary card uses real lead data

**Phase 4:**
- `src/types/database.ts` — regenerate to include `leads`, `activities`

---

## 8. Notifications mechanism

- Polling endpoint `/api/admin/notifications` returns `{ orders_unread, payments_unread, consultations_unread, activities_due }`.
- Frontend script polls every 30 seconds, updates badge counts.
- "Read" tracking is stored client-side in `localStorage.last_seen_at` (per-tab acceptable for single-user admin). When user opens a section, its counter resets.
- No persistent notification table — counts are computed from existing tables (orders.created_at > last_seen, payments where status changed, etc.).

---

## 9. Testing strategy

- **Unit tests (Vitest):** auth helpers, customer derivation query builder, voucher validation, lead stage transitions, activity completeness rules.
- **Integration tests:** API routes with a mocked Supabase client. At minimum, the auth middleware path and one CRUD endpoint per resource.
- **Manual smoke tests at each phase end:** sign in, navigate every page, perform one create/update/delete per resource, confirm dashboard shows real numbers.
- **No E2E (Playwright) tests** in scope — too heavy for the timeline.

---

## 10. Out of scope

These are intentionally NOT part of this design and would be follow-up specs:

- WhatsApp / email notifications (only in-dashboard)
- Automated email campaigns / drip sequences
- Multi-tenant or team collaboration features
- Real-time chat/Supabase Realtime channels
- Payment refund workflow UI
- File upload for customer attachments outside orders
- Custom report builder (only fixed reports in Phase 3)
- E2E testing infrastructure
- Mobile native admin app

---

## 11. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Auth bug locks admin out | Phase 1 includes a fallback bypass via env var `ADMIN_AUTH_DISABLED=true` for development only; production env never sets it |
| Customer derivation by `whatsapp` collides if same person uses different WA numbers | Acceptable trade-off — manual customer linking can be added in a follow-up |
| Lead/order data drift (lead in `won` but no matching order) | Phase 2 includes a daily background check: any `won` lead older than 7 days without `order_id` flagged in dashboard |
| ApexCharts bundle size hurts FCP | Lazy-load only on Dashboard and Reports pages via dynamic import |
| Cloudflare Workers 1 MB worker limit | Monitor build size after each phase; ApexCharts is loaded from CDN, not bundled |
| Polling every 30s creates unnecessary load on Supabase | Each polling request is a single COUNT query; if usage grows, switch to Supabase Realtime in a follow-up |

---

## 12. Success criteria per phase

**Phase 1 done when:**
- Admin login enforced with Supabase Auth (no anonymous access to `/admin/*`)
- Dashboard, Orders, Payments pages show real Supabase data, no mock arrays in source
- Customer list and 360° view work with at least 5 test orders
- All Phase 1 unit tests pass

**Phase 2 done when:**
- `leads` and `activities` tables exist in Supabase
- Pipeline kanban allows creating leads, dragging stages, viewing lead detail
- Activities can be created, completed, and linked to leads/orders
- Notification badge updates when new orders arrive

**Phase 3 done when:**
- Reports page shows revenue trend chart, funnel, and breakdowns
- CSV export downloads filtered data correctly

**Phase 4 done when:**
- Blog posts can be created, edited, published, and rendered on the public blog
- Vouchers can be created and validated by the existing `validateVoucher` helper
- Audit log viewer shows recent admin mutations
- Roles `cs`, `finance`, `editor`, `tech` have appropriate page access
