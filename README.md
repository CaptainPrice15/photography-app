# Lumen — Photography Showcase

A modern, high-performance photography display website built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

Features: dynamic theming (light/dark auto + animated ambient background + per-collection accent palettes), a responsive masonry gallery with lightbox, collections/albums, a hero showcase, and an About + Contact page. Optimized for **Vercel** (Image Optimization API, static generation + ISR, global CDN).

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Generate placeholder photos + manifest (already run once; re-run after changing `scripts/gen-blur.mjs`):

```bash
npm run gen:blur
```

Build & lint:

```bash
npm run build
npm run lint
```

## Project structure

```
app/
  layout.tsx              # ThemeProvider, fonts, ambient bg, navbar, footer, metadata
  page.tsx                # Home: Hero + featured collections + latest grid
  gallery/page.tsx        # Masonry gallery + filter + lightbox
  collections/page.tsx    # Collection cards
  collections/[slug]/    # Single collection (per-collection accent theme)
  about/page.tsx
  contact/page.tsx        # Validated contact form (Server Action)
  actions/contact.ts      # Server Action stub
  globals.css             # Tailwind + CSS variable theme tokens + ambient keyframes
components/
  layout/                 # Navbar, Footer, ThemeToggle
  theme/                  # AmbientBackground, CollectionThemeSetter
  home/Hero.tsx           # Embla carousel
  gallery/                # MasonryGallery, PhotoCard, Lightbox, CollectionFilter
  collections/CollectionCard.tsx
  contact/ContactForm.tsx
lib/
  storage/                # PhotoSource interface + local adapter (pluggable)
  theme.ts, utils.ts
public/photos/            # manifest.json + generated placeholder images
scripts/gen-blur.mjs     # placeholder image + blur placeholder generator
```

## Adding your own photos

1. Drop image files into `public/photos/<collection>/`.
2. Edit `scripts/gen-blur.mjs` (collection list / counts) or `public/photos/manifest.json` directly, then run `npm run gen:blur` to regenerate images + blur placeholders.
3. Each collection carries an `accent` / `accentSoft` hex used to theme the UI when viewed.

## Pluggable storage (Mega / Google Drive / CDN)

All data flows through the `PhotoSource` interface in `lib/storage/types.ts`. The active source is chosen in `lib/storage/index.ts` via `NEXT_PUBLIC_PHOTO_SOURCE` (default `local`). To use a remote source later, implement the same interface (e.g. `megaSource.ts`, `googleDriveSource.ts`, `cdnSource.ts`) and select it — **no UI changes required**. For remote image hosts, also whitelist `images.remotePatterns` in `next.config.ts`.

## Deploy to Vercel

Zero-config for Next.js:

- **Git import:** push this repo to GitHub/GitLab, then **Import** it in the Vercel dashboard (framework auto-detected). Set the **Root Directory** to `photo-site` if the repo root differs.
- **CLI:** `npx vercel` (preview) → `npx vercel --prod`.
- **Env vars:** add any secrets (e.g. `RESEND_API_KEY`) in the Vercel dashboard (Production), never commit `.env*`.
- **Output:** standard Node.js runtime — Vercel's Image Optimization API and Server Actions work out of the box; collections are statically generated with hourly ISR (`revalidate = 3600`).
- **Domain:** configure in the dashboard; automatic HTTPS + global CDN.

## Tech

Next.js 16 · React 19 · Tailwind CSS v4 · next-themes · framer-motion · embla-carousel-react · react-hook-form + zod · sharp (placeholder generation only).
