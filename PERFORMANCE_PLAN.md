# Lumen — Photo Website Speed Optimization Plan

> Context: you just replaced all HEIC files with JPEGs in pCloud. Because every public photo is now a web-raster format (JPEG), we can apply aggressive sizing, caching, and pre-generation optimizations that were impossible or expensive while HEIC files were in the workflow.

## 0. Goals & non-goals

### Goals
- **Largest Contentful Paint (LCP)** under 2.0 s on 4G / under 1.2 s on fast 3G for `/`, `/gallery`, and `/collections/[slug]`.
- **First image paint** for above-the-fold photos under 1.0 s.
- Lightbox navigation that feels instant (preloaded adjacent images, not full-resolution previews).
- Zero broken image URLs after the migration.
- Keep the server-side watermark as the only bytes a casual visitor can fetch.

### Non-goals
- Removing the watermark / changing copy-deterrent UX.
- Moving originals out of pCloud.
- Switching to a different storage provider.
- Rewriting the design system.

## 1. Current architecture snapshot

| Layer | Current behavior | Cost |
|-------|-----------------|------|
| Source files | JPEGs in pCloud folders (`Kedarnath/`, `Sikkim/`, …) | Network + API latency per cold fetch |
| Photo source | `lib/storage/pcloudSource.ts` scans pCloud folders every 5 min (`scanCache`) | 2 API calls per scan + 1 manifest read |
| Proxy | `app/api/photos/[...path]/route.ts` fetches JPEG from pCloud, watermarks with `sharp`, caches derivative | Cold request: ~1.5–4 s; warm: cache dependent |
| Image component | `next/image` with global `unoptimized: true` | Browser loads full 1600 px watermarked JPEG even for thumbnails |
| Cache | Vercel KV when env vars present; otherwise `/tmp` filesystem on the server | KV fast but needs env; FS is single-node and cleared on redeploy |
| Placeholders | Server Action `app/actions/blur.ts` fetches all photos to attach `blurDataURL` | O(n) pCloud listing + optionally one cache read per photo |
| Collection metadata | Pages are `force-dynamic` + `revalidate = 3600` | Every request recalculates metadata, but ISR cache is ignored when `force-dynamic` is present |

**Biggest wins in order of effort/impact:**

1. Serve multiple pre-sized derivatives (thumbnail, gallery, lightbox) instead of one 1600 px JPEG for every slot.
2. Use a CDN-friendly cache strategy so the same derivative URL is cacheable at the edge.
3. Read image dimensions once at build/manual manifest time rather than defaulting to 1600×1200.
4. Pre-generate watermarked derivatives at build/deployment time instead of on first request.
5. Make collection pages static-generated and revalidated, removing `force-dynamic` where safe.

## 2. Guiding rules to keep images from breaking

Before any code change, pin these rules:

1. **Do not change public URLs.** `src` paths like `/api/photos/Kedarnath/IMG20250523192204.jpg` must remain stable. Any sizing must be expressed via query params or new routes, never by renaming existing paths.
2. **Encode filenames exactly once.** Both `pcloudSource.ts` and `gen-pcloud-manifest.mjs` already URI-encode filenames. Keep encoding/decoding symmetric between proxy route and source.
3. **Never assume extension case.** pCloud preserves case; browsers/Next.js/sharp may not. Normalize to lowercase internally but keep the original filename for the download lookup.
4. **Keep a fallback image.** If pCloud returns an empty file or a non-image, the proxy must return a 1×1 transparent pixel or a generic "image unavailable" placeholder, never a 500 that breaks layout.
5. **Cache keys must be deterministic.** Any key that includes a version/sizing param must derive from `(collection, filename, size, watermark-version)`.
6. **Test with a staging pCloud folder first.** Do not run destructive re-generations against the live folder.

## 3. Phase plan

### Phase 1 — Measure before changing (0–1 day)

1. Add temporary timing logs to `app/api/photos/[...path]/route.ts`:
   - total request time
   - cache hit/miss
   - pCloud fetch time
   - watermark time
2. In a non-production deployment, run WebPageTest or Lighthouse on `/`, `/gallery`, and `/collections/Kedarnath`.
3. Record the current LCP, TTFB for `/api/photos/*`, total image bytes transferred on first load, and on second load.
4. Save these numbers at the top of this plan (benchmarks).

**Files touched:**
- `app/api/photos/[...path]/route.ts`
- `lib/watermark.ts` (add instrumentation)

**Safety:** only logging, no user-facing change.

---

### Phase 2 — Real dimensions in the manifest (1 day)

Because JPEGs are now optimizable, Next.js image sizing needs correct `width` and `height` to avoid layout shift and to pick sensible source sets.

1. Create a new script `scripts/gen-pcloud-dimensions.mjs` that:
   - Logs into pCloud
   - Lists every collection folder
   - Downloads each JPEG once
   - Uses `sharp` to read `width`/`height` and dominant color
   - Writes a `photo-dimensions.json` file (or extends `manifest.json`) with:
     ```json
     {
       "Kedarnath/IMG20250523192204.jpg": {
         "width": 4000,
         "height": 3000,
         "dominantColor": "#5a6b7c"
       }
     }
     ```
2. Commit `photo-dimensions.json` to the repo. It is small metadata; pCloud remains the source of truth for pixels.
3. Update `lib/storage/pcloudSource.ts`:
   - At import time, load `photo-dimensions.json`.
   - In `scanCollections()`, merge real width/height into each `Photo`.
4. Keep the existing 1600×1200 fallback for any missing entry so new photos never break.

**Files touched:**
- `scripts/gen-pcloud-dimensions.mjs` (new)
- `lib/storage/pcloudSource.ts`
- `manifest.json` could also carry dimensions if you prefer a single metadata file

**Safety:**
- The script reads JPEGs but does not write to pCloud.
- Existing photos keep working via fallback dimensions.

---

### Phase 3 — Multi-size derivative pipeline (2–3 days)

Instead of one 1600 px watermarked JPEG, generate three sizes at proxy time:

| Size key | Long edge | Use case | pCloud filename suffix |
|----------|-----------|----------|------------------------|
| `thumb`  | 400 px    | Masonry grid thumbnails  | `.thumb.jpg` |
| `preview` | 900 px   | Collection cards / hero  | `.preview.jpg` |
| `lightbox` | 1600 px | Lightbox / full view      | `.lightbox.jpg` |

#### 3a. Add size-aware watermarking

Create `lib/watermark.ts#watermarkPreview(input, contentType, size)` or add a `size` option:

```ts
export type PreviewSize = "thumb" | "preview" | "lightbox";
export async function watermarkPreview(
  input: Buffer,
  contentType: string,
  size: PreviewSize = "lightbox"
): Promise<{ bytes: Buffer; contentType: string }>
```

Use different `WATERMARK_OPACITY` and font size per size so the watermark stays readable on thumbnails.

#### 3b. Add a sizing query parameter to the proxy

Keep `/api/photos/Kedarnath/IMG20250523192204.jpg` as the default (backward-compatible) lightbox size, and support:

- `/api/photos/Kedarnath/IMG20250523192204.jpg?size=thumb`
- `/api/photos/Kedarnath/IMG20250523192204.jpg?size=preview`
- `/api/photos/Kedarnath/IMG20250523192204.jpg?size=blur` (existing blur endpoint)

Implementation notes in `app/api/photos/[...path]/route.ts`:
- Parse `size` query param.
- Cache key becomes `wm:<path>:<size>` and `blur:<path>`.
- Validate size against allow-list to prevent cache-poisoning.
- For unsupported formats, fall back to the original bytes still watermarked at default size.

#### 3c. Update components to request correct size

| Component | Size to request | Priority |
|-----------|--------------|----------|
| `PhotoCard` | `?size=thumb` | All |
| `CollectionCard` cover | `?size=preview` | All |
| `Hero` slides | `?size=preview` for active, `?size=thumb` for off-screen | First active = `priority`, rest lazy |
| `collections/[slug]` cover | `?size=preview` | Yes |
| `Lightbox` current | `?size=lightbox` or default | Yes |
| `Lightbox` adjacent preloads | `?size=thumb` or `?size=preview`, **not** `lightbox` | No |

Example in `PhotoCard.tsx`:

```tsx
const thumbSrc = `${photo.src}?size=thumb`;
// keep full src for lightbox open, but card renders thumb
<ProtectedImage src={thumbSrc} ... />
```

**Files touched:**
- `lib/watermark.ts`
- `app/api/photos/[...path]/route.ts`
- `components/gallery/PhotoCard.tsx`
- `components/gallery/Lightbox.tsx`
- `components/collections/CollectionCard.tsx`
- `components/home/Hero.tsx`
- `app/collections/[slug]/page.tsx`

**Safety:**
- Default route behavior unchanged → old URLs continue to serve full-size images.
- If a size param is missing/invalid, serve the default.
- Components that do not yet pass `size` continue to work.

---

### Phase 4 — Edge-cached proxy responses (1 day)

Currently the proxy sets:

```http
Cache-Control: public, max-age=86400, immutable
```

Two issues:
- On Vercel serverless/Node runtime, this only caches in the visitor’s browser and in Vercel’s edge cache when the response is produced by a static generation path, not necessarily by a dynamic route.
- We need cache invalidation tied to the asset, not an arbitrary 24-hour window.

#### 4a. Add a content hash to the URL (optional but safest)

Introduce an `?v=<hash>` query param derived from the pCloud `fileid` + `content-modified` timestamp + a watermark version constant. This lets us set far-future cache headers safely because any real change to the source file changes the URL.

If you prefer not to change public URLs, use the existing stable URL plus a short `s-maxage` and a stale-while-revalidate window:

```http
Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800
```

#### 4b. Separate watermarked derivative caching from source caching

Today `getCachedFile(cacheKey)` stores the final watermarked JPEG. Keep that, but also cache the raw pCloud file so that generating a new size (`thumb`/`preview`) does not re-download from pCloud:

- Key `raw:<path>` → original JPEG bytes (TTL 30 days in KV, or filesystem).
- Key `wm:<path>:<size>` → watermarked derivative.

Update `toBrowserBytes` and watermark flow:
1. Check derivative cache.
2. If miss, check raw cache.
3. If raw miss, fetch from pCloud and store raw.
4. Generate sized/watermarked derivative and store.
5. Return derivative.

**Files touched:**
- `app/api/photos/[...path]/route.ts`
- `lib/cache.ts` (maybe add `getRawFile`/`setRawFile` helpers or reuse `getCachedFile` with prefix)

**Safety:**
- Existing cache keys (`wm:<path>`, `blur:<path>`) keep working; new keys are additive.
- Add a cache-bust query param only after testing; do not change the canonical image path.

---

### Phase 5 — Pre-generate derivatives at deploy time (2 days)

Cold-start image requests are the main reason first-time visitors see slow loads. Pre-generate the three sizes for every JPEG during deployment.

1. Create `scripts/prepare-pcloud-derivatives.mjs`:
   - Reads `manifest.json` or scans pCloud.
   - For every photo, calls a new internal endpoint or runs a local function that produces `thumb`, `preview`, `lightbox`, and `blur` outputs.
   - Stores them in the cache (KV or filesystem).
   - Logs progress and missing files.
2. Run this script in CI before `next build` or as a post-deploy step.
3. If using Vercel KV, the script needs `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Run it locally with env vars before deploy.

**Benefit:** the first real visitor never pays the watermark cost.

**Files touched:**
- `scripts/prepare-pcloud-derivatives.mjs` (new)
- `package.json` (add script)
- CI config or deployment notes

**Safety:**
- Pre-generation is cache-only; it never overwrites pCloud originals.
- If a photo cannot be processed, log it and continue; the live proxy still lazy-generates on request.

---

### Phase 6 — Static collection pages & metadata caching (1 day)

Right now `app/gallery/page.tsx`, `app/page.tsx`, and `app/collections/[slug]/page.tsx` are `export const dynamic = "force-dynamic"`. This disables ISR and means every page request triggers pCloud scanning.

#### 6a. Remove `force-dynamic` where possible

- `app/collections/[slug]/page.tsx` already has `generateStaticParams()` and `revalidate = 3600`. Removing `force-dynamic` enables ISR.
- `app/collections/page.tsx` can be static too: remove `force-dynamic`.
- `app/gallery/page.tsx` and `app/page.tsx` rely on `photoSource.getAllPhotos()` which calls pCloud. Convert them to static + ISR and rely on the 5-minute in-memory `scanCache` only at build/revalidate time, not at request time.

#### 6b. Add `generateStaticParams` to gallery if needed

Gallery is one page and can be static with `revalidate = 3600`.

#### 6c. Keep fallback for new photos

If a new photo is uploaded between builds, the static page will not show it until the next revalidation. That is acceptable for a photography portfolio; if not, keep `dynamic = "force-dynamic"` on `/gallery` only and make the other pages static.

**Files touched:**
- `app/page.tsx`
- `app/gallery/page.tsx`
- `app/collections/page.tsx`
- `app/collections/[slug]/page.tsx`

**Safety:**
- Test one page at a time.
- `revalidate` still refreshes content hourly.
- `/api/photos/*` stays dynamic (it serves the images); only the HTML pages become static.

---

### Phase 7 — Blur placeholders without server action stalls (1 day)

Current flow:

1. Page server render calls `photoSource.getAllPhotos()`.
2. Page calls `getBlurDataUrls(firstPageIds)` server action.
3. Server action calls `photoSource.getAllPhotos()` **again** and then checks caches.

This doubles pCloud scans and happens on every dynamic page load.

#### 7a. Embed blur data URLs at build time

Generate blur placeholders in `scripts/gen-pcloud-dimensions.mjs` (Phase 2) and store them in the committed metadata file:

```json
{
  "Kedarnath/IMG20250523192204.jpg": {
    "width": 4000,
    "height": 3000,
    "blurDataURL": "data:image/jpeg;base64,/9j/4AAQ...",
    "dominantColor": "#5a6b7c"
  }
}
```

Base64 blur strings are tiny (~300–800 bytes each). For ~100 photos this adds <100 KB to the repo and eliminates the runtime server action.

#### 7b. Remove / simplify `getBlurDataUrls`

Change `app/actions/blur.ts` to read from the committed metadata map instead of fetching from pCloud. Or delete it and read directly from the photo source.

Update `pcloudSource.ts` to attach `blurDataURL` from the metadata map.

**Files touched:**
- `scripts/gen-pcloud-dimensions.mjs`
- `lib/storage/pcloudSource.ts`
- `app/actions/blur.ts`
- `app/gallery/page.tsx`
- `app/collections/[slug]/page.tsx`
- `app/page.tsx`

**Safety:**
- Missing blur data falls back to `placeholder="empty"`; images still render.

---

### Phase 8 — Hero & lightbox load behavior (1 day)

#### 8a. Hero
- The hero slide downloads `?size=preview` for the active slide.
- Off-screen slides should use `loading="lazy"` and `?size=thumb` until they become active.
- Only the first active slide gets `priority`.

#### 8b. Lightbox
- Stop preloading adjacent images at full `lightbox` size. Preload `?size=preview` instead, or rely on browser cache after the user has already seen thumbnails.
- Add a low-quality placeholder (`?size=thumb`) under the full image so the full image fades in over an already-loaded frame.

**Files touched:**
- `components/home/Hero.tsx`
- `components/gallery/Lightbox.tsx`

**Safety:**
- These are React prop changes only; no URL changes.

---

### Phase 9 — Optional: re-enable Next.js image optimization with a custom loader (advanced, 2–3 days)

Currently `next.config.ts` sets `images.unoptimized: true`. If you want Vercel’s edge image optimization to handle resizing, you can instead:

1. Keep the proxy for watermarking.
2. Use a custom `loader` function on `next/image` that points to `/api/photos/...?size=<requested>`.
3. Set `images.unoptimized: false`.
4. Add `images.remotePatterns` if any remote direct URLs are used (not needed today).

However, because every image must be watermarked by *your* server first, the Next.js optimizer cannot directly optimize raw pCloud URLs. A custom loader that calls your own proxy gives you responsive `srcset` generation without losing watermarking.

**Decision point:** try Phase 3 first. If thumbnail bytes are still too large, enable a custom loader to let Next.js generate `srcset` automatically from your `?size=thumb` endpoint.

**Caution:** Next.js 16 image configuration may differ from Next.js 14/15. Verify against `node_modules/next/dist/docs/` before enabling.

---

### Phase 10 — Validation checklist

Before declaring the work done, verify every item.

#### 10a. Functional
- [ ] `/`, `/gallery`, `/collections`, `/collections/Kedarnath` render without 500s.
- [ ] Every image URL visible in DevTools resolves with 200.
- [ ] No broken-image icons on any page.
- [ ] Lightbox opens and navigates.
- [ ] Right-click save still deterred.
- [ ] Download gated route still returns 402 when unauthenticated / clean file when authenticated.

#### 10b. Performance
- [ ] Lighthouse LCP < 2.0 s (mobile);
- [ ] Lighthouse CLS < 0.05;
- [ ] Total image bytes on first `/gallery` load reduced by at least 50 % vs baseline;
- [ ] `/api/photos/*?size=thumb` responses are < 20 KB each;
- [ ] Second page visit (with cache) image requests served from disk/memory cache.

#### 10c. Correctness under change
- [ ] Add a new JPEG to the pCloud staging folder; re-run dimension generator; verify the new photo appears correctly sized after revalidation.
- [ ] Rename an existing file; confirm old URL returns 404 and new URL works.
- [ ] Delete a file; confirm graceful absence (no broken layout).

## 4. Rollback plan

1. Keep every change behind a single feature branch or PR.
2. For Vercel: production deployment can be reverted instantly in the dashboard.
3. For the cache: deleting KV keys with prefix `wm:` and `raw:` forces re-generation but does not break URLs.
4. If image URLs break, the quickest fix is to set `next.config.ts` back to `unoptimized: true` and revert component `size` query params so the original full-size proxy endpoint is used everywhere.

## 5. Recommended execution order

1. Phase 1 — measure.
2. Phase 2 — dimensions metadata.
3. Phase 7 — blur metadata at build time (removes server action duplication).
4. Phase 4 — raw + derivative cache split.
5. Phase 3 — multi-size pipeline.
6. Phase 8 — Hero/lightbox sizing.
7. Phase 6 — static pages.
8. Phase 5 — pre-generation.
9. Phase 9 — custom loader (optional).
10. Phase 10 — validate and record final benchmarks.

## 6. Files expected to change (summary)

- `lib/watermark.ts` — size-aware watermarking.
- `app/api/photos/[...path]/route.ts` — size query param, raw cache, cache headers.
- `lib/storage/pcloudSource.ts` — real dimensions + blur metadata.
- `components/gallery/PhotoCard.tsx` — `?size=thumb`.
- `components/gallery/Lightbox.tsx` — sized preloads, low-quality placeholder.
- `components/collections/CollectionCard.tsx` — `?size=preview`.
- `components/home/Hero.tsx` — sized slides, lazy off-screen.
- `app/collections/[slug]/page.tsx` — remove `force-dynamic` if safe.
- `app/collections/page.tsx` — remove `force-dynamic`.
- `app/gallery/page.tsx` — remove `force-dynamic`, drop server action.
- `app/page.tsx` — remove `force-dynamic`.
- `app/actions/blur.ts` — simplify or remove.
- `scripts/gen-pcloud-dimensions.mjs` — new metadata generator.
- `scripts/prepare-pcloud-derivatives.mjs` — new deploy-time pre-generator.
- `package.json` — new npm scripts.

## 7. Open questions to resolve before coding

1. **Hosting target:** Is this deployed on Vercel (KV available) or self-hosted Node (filesystem cache only)? This changes the pre-generation and cache strategy.
2. **pCloud stable IDs:** Are pCloud `fileid` values stable across file replacements? If you overwrite a JPEG in place, does the `fileid` change? This affects raw-cache invalidation.
3. **Budget for repo metadata:** Are you comfortable committing a `photo-dimensions.json` with base64 blur strings (~100 KB for 100 photos)?
4. **Next.js image optimizer:** Do you want to attempt re-enabling the built-in optimizer with a custom loader, or keep `unoptimized: true` and generate our own `srcset` manually?
5. **Build vs. runtime:** Should derivative pre-generation run in CI, or would you prefer to warm the cache on first deploy via a script you run locally?
