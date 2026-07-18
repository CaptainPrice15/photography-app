# Lumen — Modern Futuristic UI Modernization

**Goal:** Transform the site into a premium, futuristic photography experience with glass/glow aesthetics, purposeful
animations, and polished micro-interactions — without hurting Core Web Vitals.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 (CSS-only config) · Framer Motion 12 · Embla · next-themes

---

## Performance Guardrails (applied to every phase)

- GPU-only motion: `transform` / `opacity` (no width/height/top/left/margin/padding animations).
- Lazy-load below-fold effects; `content-visibility: auto` for off-screen sections.
- `contain: layout style paint` on card surfaces; `will-change` only where animating.
- `prefers-reduced-motion` fallback for every keyframe and Framer Motion variant.
- Keep `next/image`; `priority` only above the fold. Global `unoptimized` stays (remote HEIC workflow).
- No new heavy UI libraries unless strictly necessary.
- Lighthouse budget after each phase: LCP < 2.5s, CLS < 0.1, INP < 200ms.

---

## ✅ Phase 1 — Design System & Global Foundation (DONE)

Foundation for all later phases. Build passes (`npm run build` ✓).

### 1.1 Design tokens — `app/globals.css`
- Added surface-alpha colors: `--color-surface-65`, `--color-surface-85`, plus `--color-border-{50,40,25}`.
- Added accent-alpha scales: `--color-accent-{50,25,15,10}`, `--color-accent-soft`.
- Added new glow palette: `--glow`, `--glow-soft` (light + dark values) + `--color-glow`, `--color-glow-soft`.
- Richer dark palette (deeper bg/surface, brighter fg) and crisper light palette.
- Custom easings: `--ease-out-expo`, `--ease-out-quart`, `--ease-elastic`.

### 1.2 Elevation & glow tokens — `app/globals.css`
- Shadow scale: `--shadow-card`, `--shadow-card-hover`, `--shadow-card-strong`.
- Glow scale: `--shadow-glow`, `--shadow-glow-sm`, `--shadow-glow-lg`, `--shadow-glow-xl`.
- `--shadow-inset` / `--shadow-inset-light` for glass top highlights.

### 1.3 Shared motion primitives — `app/globals.css`
Keyframes (GPU friendly, all `transform`/`opacity`):
- `fade-up`, `fade-in`, `slide-up`, `scale-in` (entrance)
- `glow-pulse`, `float`, `shimmer`, `border-spin`
- `mesh-drift-a/b/c/d` (ambient background)
- Exposed as Tailwind utilities via `--animate-*` tokens (e.g. `animate-fade-up`).

### 1.4 Utility components — `app/globals.css`
- `.glass` — translucent surface + `backdrop-blur` + inset highlight + card shadow.
- `.glass-strong` — higher-opacity variant for dialogs/overlays.
- `.glow-border` — masked gradient border that fades in on hover.
- `.surface-contain` — `contain: layout style paint` for stable cards.
- `.underline-draw` — center-out underline for links.
- Expanded `prefers-reduced-motion` block (kills all animations/transitions).
- Extended accent recolor transition to include `--glow`.

### 1.5 MotionProvider — `components/shared/MotionProvider.tsx` (NEW)
- Client wrapper around Framer Motion `<MotionConfig reducedMotion="user">`.
- Wired into `app/layout.tsx` inside `ThemeProvider` so all motion respects OS reduced-motion.

### 1.6 Ambient background — `components/theme/AmbientBackground.tsx`
- Upgraded from 3 blobs to a 4-blob **mesh gradient** (glow + accent + accent-soft + glow-soft).
- New `ambient-grid` overlay: faint structural grid, masked to fade at edges.
- Uses new `animate-mesh-drift-*` utilities; grain overlay retained.
- Slower, lower-opacity drift = calmer, more premium feel.

### Files changed
- `app/globals.css`
- `app/layout.tsx`
- `components/theme/AmbientBackground.tsx`
- `components/shared/MotionProvider.tsx` (new)

---

## ✅ Phase 2 — Core Components (DONE)

Build passes (`npm run build` ✓) and lint clean. All components upgraded to the glass/glow design system.

### 2.1 Navbar `components/layout/Navbar.tsx`
- Floating glass pill bar appears on scroll (`.glass` + `shadow-card-hover`); transparent at top.
- Desktop links: pill group with sliding active highlight via shared `layoutId="nav-active"` (spring).
- Mobile: glass sheet with staggered link reveal (`AnimatePresence` + per-item delay).

### 2.2 Hero `components/home/Hero.tsx`
- Full-viewport (88vh) slides; stronger `from-black/80` vignette + radial vignette overlay.
- Staggered text reveal (`container`/`item` variants, `delayChildren` + `staggerChildren`).
- Glass CTA pills (`glass`) with `-translate-y-0.5` + `shadow-glow` on hover.
- Ken Burns slow `scale3d` (`scale: 1.08`) on active slide; crossfade between slides.

### 2.3 PhotoCard `components/gallery/PhotoCard.tsx`
- Floating glass overlay (`.glass-strong`) on hover; 3D lift (`y:-6 scale:1.015`) + `shadow-glow-sm`.
- Image zoom inside `overflow-hidden` container; staggered `whileInView` entrance.

### 2.4 CollectionCard `components/collections/CollectionCard.tsx`
- Animated gradient border (`.glow-border`, fades in on hover).
- Stronger lift (`-translate-y-1.5`) + accent `shadow-glow`; slow cover zoom (`scale-[1.07]`, 700ms).

### 2.5 CollectionFilter `components/gallery/CollectionFilter.tsx`
- Sticky floating glass pill bar (`sticky top-[76px]`, `.glass`). Active chip: `bg-accent` + `shadow-glow-sm`.

### 2.6 Lightbox `components/gallery/Lightbox.tsx`
- Deeper backdrop blur (`backdrop-blur-xl`) + radial vignette; scale+fade image enter (`scale:0.96`).
- Glass circular controls (`.glass-strong`) with `shadow-glow` hover.

### 2.7 Footer `components/layout/Footer.tsx`
- Glass-top panel with top-border (`.glass`, `border-t`); staggered `fade-up` links (`whileInView`).
- `.underline-draw` nav links; glass social chips with accent glow on hover.

## ✅ Phase 3 — Page-Level Motion & Reveals (DONE)

Build passes (`npm run build` ✓) and lint clean.

### 3.0 Reveal primitives (NEW)
- `components/shared/SectionReveal.tsx` — `useInView` (framer-motion), reveal once at `amount: 0.15`. Supports `stagger` (delayChildren + staggerChildren) and `as` tag. Full `useReducedMotion` fallback (renders plain element).
- `components/shared/SectionReveal.tsx` exposes `RevealItem` for sequenced children.
- `components/shared/CountUp.tsx` (NEW) — `requestAnimationFrame` count-up on `useInView`; short-circuits to final value under reduced motion.

### 3.1 Homepage `app/page.tsx`
- Featured Collections section wrapped in `SectionReveal stagger`; header + "View all" as `RevealItem`s. PhotoCards already `whileInView`.
- Latest section wrapped in `SectionReveal`; header fades up.

### 3.2 Gallery `app/gallery/page.tsx`
- Header wrapped in `SectionReveal`; filter row + masonry grid reveal via existing `whileInView` PhotoCards (row-batch stagger).

### 3.3 Collections `app/collections/page.tsx`
- Header `SectionReveal`; grid uses `whileInView` CollectionCards.

### 3.4 Collection page `app/collections/[slug]/page.tsx`
- Title card `SectionReveal` (keeps per-collection glow `boxShadow`); masonry uses `whileInView` PhotoCards.

### 3.5 About `app/about/page.tsx`
- Portrait wrapped in `animate-float` (CSS, GPU-only) inside `RevealItem`; bio column `RevealItem`.
- Stats grid `SectionReveal stagger` with `CountUp` per stat.
- Gear list `SectionReveal stagger` with `RevealItem as="li"`.

### 3.6 Contact `app/contact/page.tsx` + `ContactForm.tsx`
- Header + form card wrapped in `SectionReveal`.
- Fields stagger in (`motion.form` staggerChildren + `Field` variant); submit button gets `animate-shimmer` overlay while pending; success/error message `AnimatePresence` fade-up.

---

## ⏳ Phase 4 — Micro-Interactions (NEXT)

- Buttons: `translateY(-1px) scale(1.02)` + glow on hover; `scale(0.98)` active; focus ring glow.
- Links: `.underline-draw` center-out underline; arrow `translateX` on external links.
- Theme toggle: keep `AnimatePresence`; add glow ring in dark mode.
- Inputs: glass fields, focus glow, optional floating labels.

---

## ✅ Phase 4 — Micro-Interactions (DONE)

Build passes (`npm run build` ✓) and lint clean.

### 4.1 Button primitive `components/shared/Button.tsx` (NEW)
- Shared `Button` (renders `<button>` or `<Link>`); `primary`/`secondary`/`ghost` + `sm`/`md`.
- Hover: `translateY(-1px)` + `shadow-glow`; active: `scale(0.98)`; `focus-glow` ring.

### 4.2 Buttons applied
- Navbar login/logout: lift + glow + `focus-glow` + active scale (`components/layout/Navbar.tsx`).
- Hero CTAs: `focus-glow active:scale-[0.98]` added (`components/home/Hero.tsx`).
- About CTAs, not-found, login + checkout submit: lift + glow + `focus-glow` + active scale.

### 4.3 Links
- `.underline-draw` already used in Footer nav (Phase 2); Footer social links upgraded to `.ext-link` with `translateX` arrow on hover (`components/layout/Footer.tsx`).
- Homepage "View all"/"Open gallery" links: glass pill + lift + glow + `focus-glow`.

### 4.4 Theme toggle
- `components/layout/ThemeToggle.tsx` — `focus-glow` + `dark:shadow-glow-sm dark:hover:shadow-glow` ring in dark mode (keeps `AnimatePresence` icon swap).

### 4.5 Inputs
- Login inputs: glass (`bg-surface-65` + `backdrop-blur`) + `focus:border-accent focus:shadow-glow-sm`.
- ContactForm inputs (Phase 3): glass + `focus:border-accent focus:shadow-glow-sm`.

---

## ✅ Phase 5 — Performance Polish & QA (DONE)

Build passes (`npm run build` ✓), lint clean, and a production `next start` smoke test returned
HTTP 200 for `/`, `/gallery`, `/collections`, `/about`, `/contact`, `/login` with no runtime
errors in the server log and correct motion/glass markup present in the HTML.

- **Build / `force-dynamic`**: no Phase-introduced regression. `force-dynamic` remains only on
  the pre-existing pages (`/`, `/about`, `/gallery`, `/collections`, `/contact`); collection
  pages are `●` SSG via `generateStaticParams`. Lighthouse could not run (no Chrome binary /
  lighthouse pkg in this env) — deferred to a real browser pass.
- **CLS**: masonry uses intrinsic image dimensions (`PhotoCard` sets `width`/`height`) + blur
  placeholders; `SectionReveal`/`RevealItem` animate only `opacity`/`translate` (no layout
  shift). `cv-auto` added below-fold with `contain-intrinsic-size` so `content-visibility`
  cannot cause scroll jumps.
- **Bundle**: Framer Motion is code-split into client page chunks (no global import on server
  routes). Largest chunk ~222 KB; CSS ~48 KB. No new heavy libs added.
- **`content-visibility`**: `.cv-auto` utility added (`app/globals.css`); applied to homepage
  Latest section + `MasonryGallery` grid.
- **Accessibility / reduced-motion**:
  - Global `:focus-visible` outline (accent) added as a safety net; `.focus-glow` provides the
    premium ring on key controls.
  - `MotionConfig reducedMotion="user"` (Phase 1) + full `prefers-reduced-motion` kill-switch in
    CSS; `SectionReveal`/`RevealItem`/`CountUp` short-circuit to final state under reduced motion.
  - Glass surfaces use `text-fg`/`text-muted` over `bg-surface/65` for sufficient contrast.

---

## ✅ Image Protection — Watermark + Copy Deterrents (DONE)

Build passes (`npm run build` ✓), lint clean (1 false-positive alt warning on the
spread `alt` prop in `ProtectedImage`). Smoke test: download route returns `402`
unauthenticated; global security headers present on every route; watermark pipeline
validated (valid resized JPEG with tiled watermark).

### Reality check
"Block screenshot / right-click / open-in-new-tab" are **client-side deterrents
only** — bypassable via DevTools/JS-disabled. Real protection = server-side
watermark baked into the *only* bytes the browser receives. Approved approach:
watermark via `sharp` + client deterrents (Tier A + Tier B).

### Phase 1 — Server-side watermark engine
- `lib/watermark.ts` (NEW): `watermarkPreview()` — downscales to 1600px long edge,
  composites a tiled, rotated `lumen.photo` text pattern (opacity 0.22) via SVG,
  outputs `image/jpeg` q82 (mozjpeg). Wrapped in try/catch so non-raster formats
  fall back to a plain (still header-hardened) preview.
- `app/api/photos/[...path]/route.ts`: now serves **only** the watermarked derivative
  (cached under `wm:<key>` in `lib/cache`); adds `Content-Disposition: inline`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`,
  `Cross-Origin-Resource-Policy: same-origin`.
- `package.json`: `sharp` moved from `devDependencies` → `dependencies` (runs at
  request time in the proxy).

### Phase 2 — Copy-deterrent UI (`ProtectedImage`)
- `components/shared/ProtectedImage.tsx` (NEW): `next/image` wrapper, client
  component, blocks `contextmenu` / `dragstart` / `pointerdown` (long-press save).
  Exposes `unprotected` and `linkWrapped` (keeps link navigation, blocks only
  contextmenu+drag on cover images).
- Wired into `PhotoCard`, `Hero`, `Lightbox`, `CollectionCard` (cover, `linkWrapped`),
  and `collections/[slug]` cover.

### Phase 3 — Harden original download
- `app/api/download/[...path]/route.ts`: added `X-Content-Type-Options: nosniff` +
  `Referrer-Policy: no-referrer` alongside existing `Content-Disposition: attachment`
  and `Cache-Control: no-store`. Still gates on `session.paid` (402).

### Phase 4 — Global security headers
- `next.config.ts`: `headers()` adds to `/:path*` — `Referrer-Policy: no-referrer`,
  `X-Content-Type-Options: nosniff`, `Cross-Origin-Resource-Policy: same-origin`,
  and a minimal `Content-Security-Policy` (`img-src 'self'`, etc.).

### Known limits
- Screenshots yield the watermarked preview (acceptable; watermark deters reuse).
- Determined users get only the watermarked preview unless they pay for the clean
  original. Tier B deterrents are bypassable by design.

---

## ✅ Signup / Registration (DONE)

Build passes (`npm run build` ✓), lint clean (only the pre-existing false-positive
`alt` warning on `ProtectedImage`). End-to-end DB integration script verified:
register persists, duplicate detected, correct password verifies via bcrypt, wrong
password rejected, admin email reserved. Both `/signup` and `/login` render (200)
with correct fields + cross-links.

### Approach
Chosen: **Prisma + SQLite** user store, **open signup**, **env-only admin**.

### Files
- `prisma/schema.prisma` (NEW): `User` model (email unique, passwordHash, role,
  paid, createdAt). SQLite datasource.
- `lib/db.ts` (NEW): Prisma client singleton (globalThis pattern).
- `lib/auth.ts`: added `register(email, password, confirm)` (validation → bcrypt
  hash → insert → session) + shared `normalizeEmail`; `login()` now also verifies
  registered users against the DB via bcrypt (env admin still wins). Added
  `bcryptjs` import.
- `app/actions/auth.ts`: added `registerAction` (mirrors `loginAction`, maps
  `RegisterError` → messages, supports `returnTo`); `loginAction` now honors
  `returnTo`.
- `app/signup/page.tsx` (NEW): glass card form, email + password + confirm, inline
  errors, link to `/login`.
- `app/login/page.tsx`: added "Create an account" link to `/signup` (+ `Link` import).
- `package.json`: `@prisma/client`, `prisma`, `bcryptjs`, `@types/bcryptjs`; scripts
  `db:generate`, `db:push`, `postinstall: prisma generate`.
- `.env.example`: added `DATABASE_URL="file:./dev.db"`.
- `.gitignore`: `*.db`, `*.db-journal`, `/prisma/dev.db`, `/prisma/migrations`.

### Validation
Email format + lowercase normalize; password ≥ 8 chars; confirm must match;
`ADMIN_EMAIL` reserved; duplicate → `EMAIL_EXISTS`. Out of scope v1: email
verification, rate limiting, OAuth.

---

## 🔮 Optional Future Tier (after core phases)
- CSS scroll-driven animations for parallax.
- Cursor-following spotlight hover (`requestAnimationFrame`).
- Page transition loader.
- Subtle toggle-able UI sound (likely skip).

---

## Scope guardrails (will NOT change)
- Routing. No new heavy UI libraries beyond `sharp` (already present for blur gen).
  Tailwind v4 setup.

### Changed by the image-protection work (deliberate)
- Image *delivery*: gallery now serves watermarked, downscaled previews (not the
  clean original). This is a security feature, not a workflow change — HEIC/pCloud
  handling is untouched. Auth/security *was* changed (download gating hardened,
  security headers added).
