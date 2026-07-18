# Plan: Filen Cloud Storage as Photo Backend (+ Login, Payment Gate, Admin)

## Context

The gallery currently reads from local `public/photos`. The goal is to make **Filen**
(E2E-encrypted cloud storage) the source of truth for photos, served via a decrypting
proxy Route Handler. Folder structure + a `manifest.json` live in Filen (folders are
created manually; a ready-to-use `manifest.json` is provided). Auth to Filen uses
**email + password only**. Downloading original files is gated: free users must **log in
and complete payment**; an **admin account bypasses payment** (for testing).

The repo has **no auth / payment / session code** yet, so a lightweight, self-contained
auth + payment flow is scaffolded (no external Stripe dependency required — designed so
Stripe can drop in later). The Filen SDK is **Node-only**, so the proxy runs on the Node
runtime.

## Filen folder layout (created manually in Filen)

```
/photos/
  manifest.json        # provided (collections: title / description / accent)
  aurora/  sunset/  mono/  bloom/   # each holds image files (jpg / png / webp / heic / ...)
```

`manifest.json` shape matches the existing generated format. The app reads it for
collection metadata and falls back to folder-name titles + a default accent when absent.

## Part 1 — Filen storage source

### `lib/storage/filenSource.ts` (new)
- Singleton `FilenSDK` from `@filen/sdk`, constructed with `email` / `password`
  (+ optional `twoFactorCode`) from env; `metadataCache: true`, `tmpPath` set.
  Lazy `login()` once (cached promise).
- Implements `PhotoSource` (mirrors `localSource`):
  - `getCollections()` → `fs().readdir({ path: "/photos" })` → filter directories →
    per directory list image files → build `Collection` / `Photo`. Reads
    `/photos/manifest.json` (if present) for metadata.
  - `src` = `/api/photos/<slug>/<file>` (proxy path), carries `format` + `unoptimized`
    (reuses `isOptimizable`).
  - `getCollection`, `getFeatured`, `getAllPhotos` analogous.

### `lib/storage/index.ts` (modify)
- Add `filen` case to the `SOURCE` switch → `filenSource`. Update comments.

### `app/api/photos/[...path]/route.ts` (new) — decrypting image proxy
- `export const runtime = "nodejs"`; `Cache-Control: public, max-age=86400, immutable`.
- Resolve path → Filen `/photos/<...path>`; `fs().stat` for metadata; stream decrypted
  bytes:
  - Fast path: `sdk.cloud().downloadFileToReadableStream({...})` (true streaming).
  - Fallback: `fs().readFile(...)` → `Buffer` → `Response`.
- Set `Content-Type` from stat `mime` / extension. `404` missing, `500` on decrypt error.

### `lib/cache.ts` (new) — disk-backed cache
- On-disk LRU keyed by path + size (writes decrypted bytes to OS temp /
  `node_modules/.cache/filen`, serves from cache on repeat). Fastest repeat performance
  without external infra. HTTP `Cache-Control` still set for browser / CDN.

### `next.config.ts`
- No `remotePatterns` change needed (proxy is same-origin). Unchanged.

### `.env.example` / `.env.local` (new)
- `FILEN_EMAIL`, `FILEN_PASSWORD`, `FILEN_TWO_FACTOR_CODE` (optional)
- `NEXT_PUBLIC_PHOTO_SOURCE=filen`
- `ADMIN_EMAIL` + `ADMIN_PASSWORD` (test admin; bypasses payment)
- `AUTH_SECRET` (cookie signing)

## Part 2 — Auth + payment gate (scaffold, no Stripe yet)

### `lib/auth.ts` (new)
- Cookie-based session (`next/headers` cookies), signed with `AUTH_SECRET`.
  Payload: `{ email, role: "admin" | "user", paid: boolean }`.
- `getSession()`, `setSession()`, `clearSession()`; `isAdmin(email)` checks `ADMIN_EMAIL`.

### `app/login/page.tsx` + `app/actions/auth.ts` (new)
- Login form (email / password) → `loginAction` sets session. Admin email grants
  `role: "admin"`, `paid: true`. Logout action.

### `app/api/download/[...path]/route.ts` (new) — gated original download
- Reads session. If `paid` (admin or completed payment) → stream original from Filen with
  `Content-Disposition: attachment`. If not paid → `402` JSON; client redirects to
  `/checkout?file=<path>`.

### `app/checkout/page.tsx` + `app/actions/checkout.ts` (new) — "complete payment"
- Free users who click Download land here ("Log in / pay to download").
- "Complete payment" button → `checkoutAction` (demo) sets `session.paid = true`
  (no real charge). Comment marks where `stripe.checkout.sessions.create` + webhook would
  replace the demo step. On success → redirect back to the download.

### UI wiring
- **Navbar**: add Login / Logout + "Admin" indicator when session present.
- **Lightbox.tsx** (and/or **PhotoCard.tsx**): add a **Download** button → if session paid,
  hit `/api/download/...`; else navigate to `/checkout?file=...`.
- All browsing / lightbox stays **read-only** and ungated.

## Part 3 — manifest.json
- A ready-to-use `/photos/manifest.json` matching the 4 collections
  (aurora / sunset / mono / bloom) with existing titles / descriptions / accents is
  produced to drop into Filen.

## Files summary

| File | Change |
| --- | --- |
| `lib/storage/filenSource.ts` | new |
| `lib/storage/index.ts` | modify (filen case) |
| `app/api/photos/[...path]/route.ts` | new (image proxy) |
| `lib/cache.ts` | new (disk cache) |
| `app/api/download/[...path]/route.ts` | new (gated download) |
| `lib/auth.ts` | new |
| `app/login/page.tsx`, `app/actions/auth.ts` | new |
| `app/checkout/page.tsx`, `app/actions/checkout.ts` | new |
| `components/layout/Navbar.tsx` | modify (auth UI) |
| `components/gallery/Lightbox.tsx` | modify (download button) |
| `next.config.ts` | unchanged |
| `package.json` | add `@filen/sdk` |
| `.env.example` | new |

## Verification
- `npm install @filen/sdk`; set env; `npm run dev`.
- Browse `/gallery`, `/collections/aurora`, lightbox → images stream from Filen
  (jpg via optimizer, heic `unoptimized`).
- As free user: click Download → `/checkout` → Complete payment → download succeeds.
- As admin (`ADMIN_EMAIL`): Download works immediately, payment bypassed.
- `npx tsc --noEmit` + `npm run lint` pass.

## Notes / tradeoffs
- **No Stripe in this pass** — payment is a functional demo step (flag flip), explicitly
  Stripe-ready. Real Stripe needs keys + webhook.
- Decrypt proxy adds latency on cold cache; disk cache mitigates.
- Admin creds are env-based for now (fine for testing; not a real user system).
