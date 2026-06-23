# Order Rework + Bug Fixes + SEO/Performance Design

**Date:** 2026-06-23
**Status:** Approved
**Owner:** Senior Fullstack Eng (ZCode)

## 1. Goal

Rework the public order flow so it is a **price-free consultation request**: a customer fills a form, the submission is persisted to Supabase (orders + leads), and the browser redirects to WhatsApp (`6281999900306`) with a pre-filled message containing the order details. Along the way, fix the bugs surfaced during the deep audit and improve SEO / GEO / PageSpeed / UI-UX / smooth animation.

## 2. Non-goals

- Rewriting the admin CRM panel, payment gateways, or blog editor.
- Removing the pricing engine (`src/utils/pricing.ts`) — still used by admin; only the public order path stops invoking it.
- Migrating i18n to URL-based routing (out of scope; we only stop emitting fake hreflang).
- Touching blog post body content beyond `wa.me` link/phone consistency.

## 3. Locked decisions

| Topic | Decision |
|---|---|
| WhatsApp number | `6281999900306` (display `+62 819-9990-0306`) — single source of truth, applied everywhere |
| Supabase persistence | Insert into `orders` (price null, status `new`) + auto-create `leads` (stage `new`, source `direct_order`) |
| Location / GEO | Online service, not city-bound → schema becomes `Organization`, `areaServed` Indonesia + Global, drop `LocalBusiness`/geo/hasMap |
| Layout architecture | Keep Astro page/component structure; targeted edits only |

## 4. Architecture & data flow

### 4.1 New order flow

```
Browser (order.astro form)
   │  POST { service_type, customer_name, whatsapp, description }   (NO price)
   ▼
/api/order.ts  (validate → normalize WA → rate-limit-lite)
   ├──> supabase orders.insert({ ...price:null, pricing:{}, status:'new',
   │                              scope:{ source:'web_form', description } })
   ├──> leads.createLead({ stage:'new', source:'direct_order',
   │                       order_id, estimated_value:null })
   └──> 200 { data:{ orderId, customerName, whatsapp, serviceType } }
        │
        ▼
Browser builds WA message (order id + service + name + WA + desc; NO price line)
   └──> window.location = wa.me/6281999900306?text=<encoded>
```

### 4.2 Components touched

- `src/pages/order.astro` — new price-free form + redirect script.
- `src/pages/api/order.ts` — drop price usage; keep orders+leads inserts.
- `src/lib/constants.ts` (new) — `WA_BUSINESS_NUMBER`, `WA_DISPLAY_PHONE`, `BUSINESS_EMAIL`.
- `src/lib/supabase.ts` — no schema change; existing `createOrder` reused.
- `src/lib/admin/leads.ts` — reused as-is (`createLead`).

## 5. Detailed changes

### 5.1 Order form (`src/pages/order.astro`)

- Remove `data-price` attributes and all visible "Rp …" labels from the three service cards.
- Keep the three service options (web / mobile / maintenance) as selectable cards; the selected `data-service` is the only payload.
- Fields (all required, client-validated): `name`, `whatsapp` (normalized to `62…`), `description` (min 10 chars).
- Submit button label from i18n; on submit show a transient "Menghubungkan ke WhatsApp…" state; reset label from the original text (not a hardcoded literal) in `finally`.
- WhatsApp message template — **no price line, no payment wording**:

  ```
  Halo Ekalliptus, saya ingin konsultasi order 🙏

  📋 Detail Order:
  • Order ID: <8-char>
  • Layanan: <label>

  👤 Data Saya:
  • Nama: <name>
  • WhatsApp: <wa>

  📝 Deskripsi Project:
  <description>

  Mohon info detail & penawaran. Terima kasih!
  ```

- Remove `<VantaBackground />` import/render and the heavy 3D loader.

### 5.2 Order API (`src/pages/api/order.ts`)

- Accept `{ service_type, customer_name, whatsapp, description }`.
- Validate service ∈ {web, mobile, maintenance}; basic non-empty + length guards; normalize WhatsApp server-side too (defense in depth).
- `orderData.price = null`, `orderData.pricing = {}`, `orderData.scope = { source: 'web_form', description }`, keep `status:'new'`.
- `createLead({ estimated_value: null, ... })`.
- Return `{ orderId, customerName, whatsapp, serviceType }` (no `price`).

### 5.3 WhatsApp consolidation

New `src/lib/constants.ts`:

```ts
export const WA_BUSINESS_NUMBER = '6281999900306'
export const WA_DISPLAY_PHONE = '+62 819-9990-0306'
export const BUSINESS_EMAIL = 'support@ekalliptus.com'
export const waLink = (text?: string) =>
  `https://wa.me/${WA_BUSINESS_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`
```

Apply across: `Layout.astro` (noscript), `index.astro`, `about.astro`, `services/{website,mobile-app,maintenance}.astro`, `ContactCTA.astro`, `blog/[slug].astro`, `JsonLd.astro`, `ConsultationDialog.astro` (prompt text), `api/consult.ts` (fallback text), all 7 `i18n/locales/*.json` (`contact.phone`). Blog `.md` body text left, but any `wa.me/<num>` link normalized.

### 5.4 Dead-code / contradiction cleanup

- Delete `src/components/VantaBackground.astro`.
- Remove `<VantaBackground />` import + render from **all 12 pages**: `index.astro`, `order.astro`, `about.astro`, `blog.astro`, `blog/[slug].astro`, `blog/tag/[tag].astro`, `services/website.astro`, `services/mobile-app.astro`, `services/maintenance.astro`, `privacy-policy.astro`, `terms-of-service.astro`, `404.astro`.
- Remove the Vanta/three.js idle-loader `<script>` block from `src/layouts/Layout.astro`.
- Remove the `#vanta-canvas` theme-swap CSS rule in `src/styles/global.css`.
- Remove `/public/vendor/three.min.js` + `/public/vendor/vanta.net.min.js` (and `dist` copies regenerated at build).
- `JsonLd.astro`: drop WordPress / multimedia / service-device from `knowsAbout`, `serviceType`, `services` list.
- `ConsultationDialog.astro` SYSTEM_PROMPT + `api/consult.ts`: remove WordPress, multimedia, service-device lines; keep Web / Mobile / Maintenance.

### 5.5 SEO / GEO

- `JsonLd.astro`:
  - Remove the `localBusiness` (ProfessionalService) object entirely (geo, hasMap, postal address city).
  - Keep `Organization` with `areaServed: [{Country ID}, "Global"]`, no `address` locality.
  - Trim `services` array to the three remaining services.
- `src/layouts/Layout.astro` hreflang: only emit `canonical` + `og:locale(+)alternate` for locales that actually have routing. Since the site is cookie-based i18n (single URL per page), **remove the `<link rel=alternate hreflang>` loop** (it points to non-existent `/en/...` routes → 404 noise). Keep `x-default` canonical only.
- `astro.config.mjs` sitemap `i18n` block: remove (no per-locale routes exist).
- Homepage/title/description/keywords: drop WordPress/UIUX references.
- AdSense: change the blocking `<script is:inline async src=…adsbygoogle>` to an idle-loaded pattern (mirror the GA4 idle loader) to stop render-blocking.

### 5.6 PageSpeed

- Primary win: removing three.js + Vanta (~600KB JS) eliminates the largest blocking payload.
- AdSense idle-loaded (above).
- No new heavy assets. Images already lazy/eager-tagged correctly.

### 5.7 UI/UX & smooth animation

- Order page card: lighten glass-panel to a cleaner card; improve spacing/rhythm; add a subtle 3-step progress affordance (Layanan → Data → Kirim) that is non-blocking and animates the active step.
- Form interactions: refined focus ring, button press ripple, inline success micro-animation (CSS checkmark) before redirect.
- Scroll reveal: add a small `IntersectionObserver`-based reveal utility (fade/translate) used by order page sections and reusable sitewide; respects `prefers-reduced-motion`.
- Remove the janky `translate-y-full` modal entrance artifacts where present.

## 6. Bug list (from audit) — resolution map

| # | Bug | Resolution |
|---|---|---|
| B1 | Price shown + persisted + payment wording in WA | Remove price from form/API/WA message (§5.1–5.2) |
| B2 | WA number duplicated in 30+ places | Single `constants.ts` source (§5.3) |
| B3 | Vanta/three.js still loaded despite "removed" commit | Delete component + loader + vendor files (§5.4) |
| B4 | Schema/eBot mention removed services | Trim to Web/Mobile/Maintenance (§5.4–5.5) |
| B5 | Fake hreflang to non-existent locale routes | Remove hreflang loop (§5.5) |
| B6 | LocalBusiness schema with bogus geo for online service | Drop LocalBusiness → Organization (§5.5) |
| B7 | AdSense render-blocking | Idle-load (§5.5) |
| B8 | Submit button label reset from hardcoded literal | Reset from original text (§5.1) |
| B9 | No client-side validation depth | Add min-length + WA format validation (§5.1) |

## 7. Testing

- `astro check` (typecheck) must pass.
- `bun run test` (vitest) existing suite stays green.
- Manual smoke: submit order form → confirm `orders` + `leads` rows created with `price=null` → confirm WA redirect opens `wa.me/6281999900306` with correct message and **no price**.
- Lighthouse sanity: homepage + /order JS payload drop; no Vanta network requests.
- Verify no remaining `6281999900306`-variant typos via repo grep; confirm `LocalBusiness`/`vanta`/`three.min` references gone.

## 8. Rollout

- All changes in a single feature branch; commit message scope: order rework + dead-code + SEO/perf.
- No DB migration needed (columns already nullable).
- Deploy via existing `bun run deploy` (Cloudflare) once reviewed.
