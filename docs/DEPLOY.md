# Deployment — Cloudflare Workers

This project deploys to **Cloudflare Workers** (Static Assets model — **not** Pages)
via `wrangler deploy`. The live Worker is named **`ekalliptus`** and serves the
apex `ekalliptus.com`.

## How it works

- `astro build` (with `@astrojs/cloudflare`) emits:
  - `dist/server/entry.mjs` (+ chunks) → the Worker code
  - `dist/client/**` → static assets (served via the `ASSETS` binding)
  - `dist/server/wrangler.json` → generated Workers deploy config
  - `.wrangler/deploy/config.json` → a redirect so a root `wrangler deploy`
    automatically uses the generated config
- `scripts/post-build.mjs` strips dot-prefixed asset filenames (Cloudflare does
  not serve hidden files) and rewrites references in the built Worker.
- `wrangler deploy` (run from repo root) uploads the Worker + assets.

`wrangler.toml` pins: `name = "ekalliptus"`, `account_id`, and the `SESSION` KV
namespace id.

## Environment variables (CRITICAL)

Env is **inlined at build time** (Vite `import.meta.env`; `readEnv()` falls back
to it). The local `.env` is **gitignored**, so **CI must provide the same vars at
build time** or Supabase/AI will be missing in the bundle. See `.env.example` for
the full list. Required:

| Variable | Notes |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | public, client-visible |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | server mirror (same values) |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret**, server-only |
| `ZAI_API_URL`, `ZAI_API_KEY`, `ZAI_MODEL` | consult eBot |
| `CONSULT_SECRET` | consult widget token |
| `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_BING_SITE_VERIFICATION` | optional SEO |
| `PUBLIC_URL` | site URL |

## Manual deploy (local)

```bash
bun install
bun run deploy        # build + wrangler deploy
bun run deploy:dry    # build + dry-run (validate, no upload)
```

Requires a populated `.env` and `wrangler login` (account
`ekalliptus@gmail.com`, id `f24eb3f70bf59379632e280f8756b9e4`).

## CI auto-deploy (Cloudflare Workers Builds)

Deploy on every push to `main`. One-time dashboard setup:

1. **Cloudflare dashboard → Workers & Pages → `ekalliptus` → Settings → Builds**
   (or *Connect to Git* if not yet linked).
2. **Connect repository**: `anrdart/ekalliptus`, production branch **`main`**.
3. **Build settings**:
   - Build command: `bun run build`
   - Deploy command: `wrangler deploy`
   - Root directory: `/`
4. **Build variables & secrets**: add every var from the table above (these are
   needed at **build** time, not just runtime). Mark `SUPABASE_SERVICE_ROLE_KEY`,
   `ZAI_API_KEY`, `CONSULT_SECRET` as **encrypted/secret**.
5. Save. Push to `main` → Cloudflare builds and deploys automatically.

> Note: `account_id` and the `SESSION` KV id are already in `wrangler.toml`, so
> the deploy is deterministic. The KV namespace is `ekalliptus-session`
> (`fa54633d534d4662a0365aaffe577c75`).
