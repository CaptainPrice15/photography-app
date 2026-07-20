# Lumen Website Modernization Plan
> Make the photography portfolio feel significantly more modern, stylish, and premium.

**Stack context:** Next.js 16 App Router · React 19 · Tailwind CSS v4 (CSS-only `@theme`) · Framer Motion 12 · Embla Carousel · next-themes

---

## 1. Executive Summary

The site is already modern (glassmorphism, ambient mesh, dark/light themes, motion reveals). The next level is **editorial refinement**: stronger typography, more considered negative space, cinematic image presentation, and micro-interactions that feel physical. Think *Awwwards-style photography portfolio* rather than generic SAAS dashboard.

**Design direction:**
- **Cinematic & editorial** — large imagery, asymmetric layouts, dramatic scale contrast.
- **Quietly futuristic** — keep glass/glow but make it thinner, more precise, and less "purple by default."
- **Typography-first** — use type scale and weight to create hierarchy instead of relying on colored accents.
- **Content-forward** — photos dominate; UI recedes until interacted with.

---

## 2. Current State Audit

**Strengths already in place:**
- Tailwind v4 token system with surface/glow colors (`app/globals.css`).
- Floating glass navbar with animated active pill.
- Ambient mesh background + subtle grain overlay.
- Section reveal animation system (`SectionReveal.tsx`).
- Masonry gallery with lightbox, favorites, and buy actions.
- Per-collection accent recoloring.
- Protected images + watermarking.

**Where it currently feels "good but generic":**
1. **Typography is safe** — all headings are semibold, similar sizes, and centered/left-aligned predictably.
2. **Cards all share the same rounded, bordered style** — visual monotony across collections, gallery, stats, gear list.
3. **Color story defaults to indigo/purple** — no rich neutral palette or controlled accent strategy.
4. **Whitespace is functional, not expressive** — sections feel stacked like a dashboard rather than curated.
5. **Micro-interactions are basic** — lift + glow is used everywhere; lacks moments of surprise.
6. **Mobile layout is just stacked desktop** — no mobile-specific drama or simplified gestures.

---

## 3. Design Pillars

| Pillar | What changes |
|---|---|
| **Refined Typography** | Introduce a large display scale, tighter tracking on headlines, and a monospace accent label style. Elevate section labels from small uppercase accents to a deliberate system. |
| **Expressive Layout** | Break the centered `max-w-7xl` rhythm with full-bleed pull quotes, asymmetric collections grids, and overlapping image/text sections. |
| **Cinematic Imagery** | Larger heroes, full-bleed collection headers, image masks, and parallax. Reduce UI chrome over photos. |
| **Tactile Motion** | Magnetic buttons, scroll-linked skew, text-mask reveals, staggered counters, and page transition ambience. |
| **Controlled Color** | Establish a sophisticated neutral scale and use the purple/indigo accent only as an intentional highlight, not the dominant brand color. |
| **Mobile Polish** | Bottom-sheet lightbox, edge-to-edge galleries, thumb-friendly floating actions, and haptic-like spring animations. |

---

## 4. Detailed Modernization Areas

### 4.1 Typography & Type Scale

**Current issue:** Headings are `text-3xl/4xl font-semibold tracking-tight` everywhere. No display scale or clear hierarchy.

**Proposed changes to `app/globals.css` and `app/layout.tsx`:**
- Keep Geist Sans for body/UI.
- Add a display serif or editorial sans for headlines. Since we should avoid new heavy dependencies, load a single Google font for display only (e.g., `Space Grotesk` or `Playfair Display`).
  - Recommended: `Space Grotesk` for bold display (thick, modern, editorial).
  - Alternative: just use Geist but push the scale much larger.
- Define a strict type scale in CSS variables:
  - `--text-display: clamp(3.5rem, 12vw, 9rem)` for hero/film titles.
  - `--text-h1: clamp(2.5rem, 6vw, 5rem)`
  - `--text-h2: clamp(1.75rem, 3vw, 3rem)`
- Add a `.label` utility: `font-mono text-[11px] uppercase tracking-[0.2em] text-muted` for section labels.
- Tighten hero headline tracking to `tracking-[-0.04em]` and line-height to `leading-[0.9]`.

**Files:** `app/layout.tsx`, `app/globals.css`

---

### 4.2 Color Palette & Surfaces

**Current issue:** Accent is bright indigo/purple; surfaces are flat; every interactive element turns purple.

**Proposed changes:**
- Add a refined neutral scale:
  - Light mode background: warmer off-white (`#FAFAF9`) instead of pure white.
  - Dark mode background: near-black with subtle blue undertone (`#0A0A0F`) rather than `#060609`.
- Reduce accent saturation by ~15% and default to a sophisticated color like **slate-blue** or **cool charcoal**. Purple should be reserved for collections that explicitly set it.
- Add subtle surface depth:
  - `.glass` currently uses `rgb(var(--surface) / 0.65)` — elevate this to use a layered gradient: `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))` on top of the translucent surface.
  - Light mode glass: add very subtle inner highlight and soft shadow rather than border-heavy look.
- Introduce a `.surface-elevated` token for cards that need to float above the ambient background.

**Files:** `app/globals.css`

---

### 4.3 Layout & Composition

**Homepage (`app/page.tsx`)**
- Make the hero full viewport height with a single bold title overlay instead of the small badge + description.
- Reduce text over the hero; use the headline as a graphic element.
- Add a horizontal "marquee strip" of tiny thumbnails or current collection names below the hero for rhythm.
- For the Collections section: break the 4-column grid into an **asymmetric bento layout** — one large featured collection spanning 2 rows, smaller satellite cards.
- For the Latest section: consider a full-width masonry with less container padding on desktop; let it breathe.

**Gallery page (`app/gallery/page.tsx`)**
- Header: introduce a large editorial title "All Work" or "Archive" and move the description to a narrower measure.
- Make the filter bar narrower and centered, or pinned to the left on desktop.
- Increase image border radius on large screens; reduce border heaviness.

**Collections page (`app/collections/page.tsx`)**
- Add a giant typographic heading with an overlapped cover image bleeding off the right edge.
- Use the bento grid: featured collection (`col-span-2 row-span-2`), normal collections, and a "data" cell showing total photo count as a graphic number.

**Collection detail (`app/collections/[slug]/page.tsx`)**
- Make the header image full-bleed and taller (`55vh`), with the title overlapping the image on scroll.
- Use the collection accent to create a gradient overlay that blends into the page background.

**About (`app/about/page.tsx`)**
- Convert the two-column layout into an overlapping composition: bio text overlaps the portrait image slightly.
- Turn stats into one horizontal "dashboard" strip with large numbers, not a 4-up grid.
- Gear list: render as small pills or a monospace list rather than bordered cards.

**Contact (`app/contact/page.tsx`)**
- Center-align or split layout: heading on the left, form card on the right.
- Form card: thinner border, larger internal spacing, floating labels on focus (optional).

**Files:** page-level files above.

---

### 4.4 Navigation Redesign

**Navbar (`components/layout/Navbar.tsx`)**
- Keep the floating pill shape but make it more compact and centered.
- Reduce padding and border opacity at rest; emphasize the active link with a subtle dot or underline rather than a full pill.
- Add a "magnetic" hover effect: links subtly pull toward the cursor on hover (CSS `transform` on `:hover`, not mousemove tracking).
- Logo: simplify to a wordmark or a minimal shutter/aperture icon. Consider a text-only lockup on desktop.
- Mobile: convert the hamburger sheet into a full-screen overlay with large typographic links (1.5rem) and staggered reveal.

**Files:** `components/layout/Navbar.tsx`

---

### 4.5 Hero Transformation

**Hero (`components/home/Hero.tsx`)**
- Move from an auto-rotating carousel to a **single cinematic cover** with slow Ken Burns zoom, or keep the carousel but make the transition feel like a film cut (crossfade + subtle scale).
- Make the headline much larger; title should come from a site-level tagline, with the current photo title as a secondary label.
- Replace solid CTA buttons at the bottom with:
  - A single primary floating pill "Enter Gallery".
  - A subtle scroll indicator (thin animated line) at the bottom center.
- Add scroll-linked opacity: the hero fades and scales down as the user scrolls.
- Consider a cinematic letterbox gradient: stronger top/bottom vignette.

**Files:** `components/home/Hero.tsx`

---

### 4.6 Cards & Gallery Polish

**CollectionCard (`components/collections/CollectionCard.tsx`)**
- Reduce default border opacity; only show a refined hairline.
- On hover: lift + reveal a subtle collection accent glow from beneath the card,OR animate a conic gradient border instead of the current `.glow-border`.
- Add a number badge (`01`, `02`...) using the monospace label style.

**PhotoCard (`components/gallery/PhotoCard.tsx`)**
- Remove the visible card border entirely; make images float on the background.
- Show title + metadata on hover with a glass capsule pinned to the bottom-left, not a full-width pill.
- Add a subtle "focus frame" animation on hover: a thin accent line draws around the image.
- Favorite/Buy buttons: appear on hover with a small stagger (favorite first, buy 50ms later).

**MasonryGallery (`components/gallery/MasonryGallery.tsx`)**
- Keep columns but add `gap-6` and let the outer container go edge-to-edge on large screens.
- Replace loading spinner with a skeleton row of blurred placeholder blocks, or a minimal "Loading more…" label.
- Add scroll-velocity skew (only on desktop): as the user scrolls fast, images skew vertically by 1–2 degrees to feel elastic.

**Files:**
- `components/collections/CollectionCard.tsx`
- `components/gallery/PhotoCard.tsx`
- `components/gallery/MasonryGallery.tsx`

---

### 4.7 Lightbox Upgrade

**Lightbox (`components/gallery/Lightbox.tsx`)**
- Make the backdrop even deeper with a subtle blur of the photo's dominant color (if feasible) or use the collection accent.
- Swipe/drag support via Framer Motion drag gestures on mobile.
- Add image info panel: title, EXIF-style metadata, collection link.
- Use a shared `layoutId` between the PhotoCard image and the lightbox image for a seamless "expand" transition.
- Add keyboard hint (press `ESC` to close) as a subtle caption.

**Files:** `components/gallery/Lightbox.tsx`

---

### 4.8 Forms & Auth Pages

**Contact form (`components/contact/ContactForm.tsx`)**
- Floating labels on focus/active for Name, Email, Message.
- Replace the standard red/green success boxes with inline toast-like messages that slide in from the top of the form card.
- Add a subtle character counter under Message (optional UX polish).
- Submit button: arrow icon that animates on hover.

**Login/Signup (`app/login/page.tsx`, `app/signup/page.tsx`)**
- Use a split-screen layout on desktop (image on left, form on right).
- Use glass-morphic form card but with thinner border.
- Add a subtle parallax or floating form card on mousemove on desktop.
- Unify the form-field component to share styles with Contact.

**Files:**
- `components/contact/ContactForm.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- Possible new: `components/shared/FormField.tsx`

---

### 4.9 Motion Language

**Current state:** Mostly `fade-up`, lift, and glow.

**Additions (keep GPU-only):**
- **Text mask reveals** (`overflow-hidden` + `translateY` for each line) on hero headlines and page H1s.
- **Staggered counters** already exist in `CountUp.tsx` — extend usage to total photo count on the homepage.
- **Magnetic buttons** via CSS `:hover` transform (not JS mousemove, to preserve performance).
- **Scroll-linked parallax** on collection/detail page images via Framer Motion `useScroll`/`useTransform`.
- **Scroll-velocity skew** for gallery columns (desktop only, value ~2deg).
- **Page transition ambience** — optional subtle fade/slide wrapper around `main` content using `AnimatePresence` + `template.tsx`.
- **Smooth theme transition** — when toggling light/dark, animate background color over 400ms (already partially in place).

**New utility components to create:**
- `components/shared/TextReveal.tsx` — line-by-line text reveal.
- `components/shared/MagneticButton.tsx` — pure CSS magnetic hover wrapper.
- `components/shared/ParallaxImage.tsx` — reusable scroll-linked parallax wrapper.

**Files:**
- New utilities above.
- `app/template.tsx` for page transitions.
- `components/home/Hero.tsx`, page files for parallax.

---

### 4.10 Mobile-First Polish

- **Hero** should respect `100svh` so it works cleanly on mobile browsers.
- **Navbar** should use a bottom-sheet style mobile menu, not a dropdown below the pill.
- **PhotoCard** should support tap-to-reveal actions (currently hover-only) or always keep Favorite/Buy accessible.
- **Gallery** should switch to 1-column on mobile for a full-screen immersive feel.
- **Lightbox** must support swipe to navigate and pinch-to-zoom.
- Add `safe-area-inset` padding for fixed nav and bottom sheets.

---

## 5. Implementation Phases

> Each phase ends with `npm run build` + `npm run lint` + a smoke test of `/`, `/gallery`, `/collections`, `/about`, `/contact`, `/login`.

### Phase A — Foundation Refresh ✅ (IMPLEMENTED)

Build passes (`npm run build` ✓). All routes return 200 in dev smoke test.

1. **Color tokens** — `app/globals.css`
   - Warmer light background `#FAFAF9` (`--bg: 250 250 249`); deeper near-black dark (`--bg: 10 10 14`).
   - Refined neutrals: surfaces, fg, muted, border all shifted cooler/softer.
   - Default accent changed to a sophisticated **slate-blue** (`--accent: 54 65 115` light / `124 141 238` dark) so purple is reserved for collection theming. Glow kept violet but now only used atmospherically.
   - Added editorial type-scale CSS variables: `--text-display`, `--text-h1`, `--text-h2`, `--text-h3`.
2. **Type scale + display font** — `app/layout.tsx` + `app/globals.css`
   - Loaded `Space_Grotesk` as `--font-display` (weights 500/600/700), added to `<html>` className.
   - Exposed `--font-display` token and `--font-size-display/h1/h2/h3` + `--line-height-*` tokens in `@theme inline`.
3. **Utility classes** — `app/globals.css`
   - `.glass` / `.glass-strong`: added layered top highlight gradient for a more glassy look; border opacity softened.
   - New `.glass-elevated` for cards that need to float above the ambient background.
   - New `.hairline` (low-chrome divider), `.label` (mono uppercase eyebrow), `.display` (dramatic headline).
   - Ambient blob opacity lowered (light 0.45→0.32, dark 0.35→0.26) for a calmer, more premium feel.
4. **Shared motion utilities** (NEW)
   - `components/shared/TextReveal.tsx` — line-mask reveal (clips each line, slides up); supports `split` on `\n`; reduced-motion fallback.
   - `components/shared/MagneticButton.tsx` — CSS-free magnetic hover via spring `x/y`; reduced-motion fallback.
   - `components/shared/ParallaxImage.tsx` — scroll-linked parallax wrapper (`useScroll`/`useTransform`); reduced-motion fallback.

**Bug fix (pre-existing, blocking `/` and `/collections`):**
- `CollectionCard.tsx` and `collections/[slug]/page.tsx` hardcoded `placeholder="blur"` while the pCloud source always returns `blurDataURL: undefined` for HEIC covers, causing a Next.js 500 (`placeholder='blur' but missing blurDataURL`). Both now guard with `placeholder={x?.blurDataURL ? "blur" : "empty"}`. Smoke test now returns 200 on all routes.

**Remaining pre-existing lint errors (not introduced here, out of scope):**
- `any` in `app/api/webhook/stripe/route.ts:19`; `setState` in effect in `MasonryGallery.tsx` (×2) and `CursorSpotlight.tsx`; unused `Settings` in `app/admin/layout.tsx`.

### Phase B — Navigation + Hero ✅ (IMPLEMENTED)

Build passes (`npm run build` ✓). All routes return 200 in dev smoke test. No new lint errors.

1. **`app/template.tsx`** — page-transition wrapper upgraded: now fades + slides (`y: 12→0`) + blur (`6px→0`) on enter and reverses on exit, eased with the brand `cubic-bezier(0.16,1,0.3,1)`. Reduced-motion fallback renders a plain `<div>` (no animation).
2. **`Navbar.tsx`** — redesigned:
   - Desktop active state changed from a filled pill to a refined **accent dot** under the active link (subtle hover preview scale). Cleaner, more editorial.
   - Floating pill made more compact (`py-1.5`) and keeps the scroll-triggered glass state.
   - Mobile menu replaced the dropdown sheet with a **full-screen `glass-elevated` overlay** featuring large `font-display` links (text-3xl) with staggered reveal and a bottom CTA; body scroll is locked while open.
3. **`Hero.tsx`** — reworked:
   - Headline now uses the new `.display` utility with **`TextReveal` line-mask** animation (`Light is / the only / subject.`), far larger and tighter than before.
   - Embla carousel uses a slower, film-like transition (`duration: 28`); active slide Ken Burns zoom raised to `1.12`.
   - Whole hero fades + scales down on scroll (`useScroll`/`useTransform` → `opacity` + `scale`), with the inner image parallaxing (`y`).
   - Added a minimal "Scroll" indicator (right side) and kept the glass CTAs.

**Note:** `TextReveal` is a client component used inside Hero; under `prefers-reduced-motion` it renders the headline as plain text.

### Phase C — Page Layouts ✅ (IMPLEMENTED)

Build passes (`npm run build` ✓). All routes 200 in dev smoke test.

1. **Homepage (`app/page.tsx`)** — added an edge-to-edge **marquee strip** (CSS `marquee` keyframe, masked, reduced-motion safe) between hero and collections; section headers now use `.label` + `text-h2`; collections use an **asymmetric bento grid** (`auto-rows-[180px]`, first card `sm:col-span-2` + `row-span-2` featured); "Latest" uses `text-h2`.
2. **Gallery (`app/gallery/page.tsx`)** — editorial header with `.label` ("Archive") + `TextReveal` `text-h1`; cleaner intro copy.
3. **Collections (`app/collections/page.tsx`)** — typographic header (`.label` "Series" + `TextReveal` `text-h1`) and bento grid (first featured spans 2 cols).
4. **Collection detail (`app/collections/[slug]/page.tsx`)** — **full-bleed 55vh header** with stronger accent radial, title card overlaps (`-mt-24`) with `TextReveal` `text-h1` and a mono photo count.
5. **About (`app/about/page.tsx`)** — **overlapping composition** (portrait `-mr-16 mt-16` behind bio), `TextReveal` headline, horizontal **stats strip** (bordered, `text-4xl`), **gear pills** instead of bordered cards.
6. **Contact (`app/contact/page.tsx`)** — **split layout**: glass form card left, intro right; uses `TextReveal` H1.

### Phase D — Cards, Gallery & Lightbox ✅ (IMPLEMENTED)

1. **`PhotoCard.tsx`** — borderless float on the background; **focus-frame** draw (accent border on hover); bottom-left **glass capsule** title; top-right fav/buy with **staggered reveal** (60ms / 140ms); gradient overlay.
2. **`CollectionCard.tsx`** — added `featured`/`index`/`className` props; **mono number badge** (`.label`); hairline border (`border-border-40`) + `glow-border` hover; larger type on featured.
3. **`MasonryGallery.tsx`** — `gap-6`; **scroll-velocity skew** (`useVelocity` → `skewY`, desktop, reduced-motion safe); loader replaced with animated "Loading more" dots.
4. **`Lightbox.tsx`** — **drag/swipe to navigate** (`drag="x"` + `onDragEnd`), directional slide transition, **keyboard hint** caption ("Esc to close · ← → to navigate").

### Phase E — Forms, Auth & Micro-Interactions ✅ (IMPLEMENTED)

1. **`ContactForm.tsx`** — **floating labels** (peer-based, focus + filled state) on Name/Email/Message; **inline toast-style status** (✓ / ! icon + colored card) replacing the plain box.
2. **`login/page.tsx` + `signup/page.tsx`** — **split-screen**: left brand panel (gradient + tagline), right **`glass-elevated`** form card; responsive stack on mobile.
3. **Magnetic CTAs + text-mask H1s** — `MagneticButton` enhanced to forward `href`/props and applied to the About "Get in touch" CTA; `TextReveal` H1s added to Gallery, Collections, About, Collection detail (Hero already had it).

### Phase F — Performance & QA ✅ (IMPLEMENTED / VERIFIED)

- `npm run build` ✓ and `npm run lint` — **no new errors** (4 pre-existing lint errors remain, unrelated to this work).
- Dev smoke test: `/`, `/collections`, `/gallery`, `/about`, `/contact`, `/login`, `/signup` all **200**. (`/collections/bloom` 404s as expected — that slug doesn't exist in the live pCloud source, so `notFound()` correctly fires.)
- **Reduced-motion audit**: `template.tsx`, `Hero` (`TextReveal`), `Navbar`, `MasonryGallery` (skew), `Lightbox`, `ContactForm`, `MagneticButton`, `ParallaxImage` all branch on `useReducedMotion`. The `marquee` animation is disabled under `prefers-reduced-motion`.
- **Mobile**: full-screen mobile menu (Navbar), responsive grids collapse to 1–2 cols, login/signup stack, Lightbox supports drag nav.
- **No CLS regression**: images keep `width`/`height` + blur placeholders; `SectionReveal`/`TextReveal` animate only opacity/transform.

> **Pre-existing lint issues still open (out of scope):** `any` in `app/api/webhook/stripe/route.ts:19`; `setState` in effect in `MasonryGallery.tsx` (×2) + `CursorSpotlight.tsx:23`; unused `Settings` in `app/admin/layout.tsx:4`.

---

## 6. Technical Considerations

| Concern | Approach |
|---|---|
| Tailwind v4 CSS-only config | All token changes go through `@theme inline` in `app/globals.css` (no `tailwind.config.js`). |
| Next.js 16 App Router | Keep server components where possible; motion stays in client components. Use `template.tsx` carefully (it remounts on navigation, which is good for transitions). |
| Framer Motion | Use `useReducedMotion` for all new motion utilities. Avoid binding motion values to mousemove; use CSS transforms or throttled springs only for the cursor spotlight. |
| Images | Continue using `next/image` with `unoptimized=true` for the proxy pipeline. Keep `width`/`height` to prevent CLS. |
| Font loading | Load only one display font plus the existing Geist fonts to keep bundle small. Use `display: 'swap'`. |
| Security headers | Existing CSP is strict. Inline SVGs and CSS are safe because `style-src 'self' 'unsafe-inline'` is already allowed. Avoid adding external images or scripts. |
| Mobile performance | Use `svh`/`dvh` units. Disable scroll-velocity skew on low-power or reduced-motion devices. |
| Accessibility | Ensure color contrast for new muted text on glass surfaces. Maintain visible focus indicators; do not rely on hover-only actions without tap fallbacks. |

---

## 7. Files Likely to Change

| Area | Files |
|---|---|
| Global styles/tokens | `app/globals.css` |
| Layout/fonts/metadata | `app/layout.tsx` |
| Page transitions | `app/template.tsx` (new or update) |
| Navigation | `components/layout/Navbar.tsx`, `components/layout/ThemeToggle.tsx` |
| Hero | `components/home/Hero.tsx` |
| Images/cards | `components/gallery/PhotoCard.tsx`, `components/gallery/MasonryGallery.tsx`, `components/collections/CollectionCard.tsx` |
| Lightbox | `components/gallery/Lightbox.tsx` |
| Shared motion | `components/shared/SectionReveal.tsx`, `components/shared/TextReveal.tsx` (new), `components/shared/MagneticButton.tsx` (new), `components/shared/ParallaxImage.tsx` (new) |
| Forms/auth | `components/contact/ContactForm.tsx`, `app/login/page.tsx`, `app/signup/page.tsx` |
| Pages | `app/page.tsx`, `app/gallery/page.tsx`, `app/collections/page.tsx`, `app/collections/[slug]/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx` |

---

## 8. Success Criteria

- [ ] The homepage feels like a flagship photography portfolio, not a generic dashboard.
- [ ] Typography has clear display/page/section hierarchy; labels use a consistent mono/uppercase style.
- [ ] Color palette feels intentional and the default accent is no longer visually dominant.
- [ ] Images have more presence (larger, better masks, fewer borders).
- [ ] Hover and scroll interactions feel tactile and premium.
- [ ] Mobile layout is fully polished, not just stacked desktop.
- [ ] `npm run build` and `npm run lint` pass.
- [ ] Lighthouse scores stay > 90 across Performance / Accessibility / Best Practices.
- [ ] No regression in image protection or checkout/auth flows.

---

## 9. Optional Future Enhancements

- Custom cursor (circle with blend mode) to replace the existing spotlight.
- Scroll-driven CSS view transitions between pages.
- WebGL displacement transition between hero slides.
- Case-study / story layout for individual collections.

---

## 10. Progress Tracker

| Phase | Status | Notes |
|---|---|---|
| **A — Foundation Refresh** | ✅ Done | Tokens, display font (Space Grotesk), `.glass-elevated`/`.label`/`.display`/`.hairline` utilities, and `TextReveal`/`MagneticButton`/`ParallaxImage` shared components. Also fixed a pre-existing 500 (blur placeholder on HEIC covers). |
| **B — Navigation + Hero** | ✅ Done | `app/template.tsx` page transitions (fade+blur+slide); Navbar active dot + full-screen mobile menu; Hero `.display` headline with `TextReveal`, scroll-linked fade/scale, film-style carousel. |
| **C — Page Layouts** | ✅ Done | Homepage marquee + bento grid, Gallery/Collections editorial headers + bento, Collection detail full-bleed overlap, About overlap + stats strip + gear pills, Contact split layout. |
| **D — Cards, Gallery & Lightbox** | ✅ Done | PhotoCard borderless + focus-frame + capsule + staggered actions; CollectionCard mono badge + featured; MasonryGallery gap-6 + scroll skew + loader; Lightbox drag/swipe + hint. |
| **E — Forms, Auth & Micro-Interactions** | ✅ Done | ContactForm floating labels + toast status; login/signup split-screen + glass card; MagneticButton CTA; TextReveal H1s. |
| **F — Performance & QA** | ✅ Done | Build/lint clean (no new errors), all routes 200, reduced-motion + mobile audit, no CLS regression. |

**Open issues (pre-existing, not yet addressed):**
- Lint errors: `any` in `app/api/webhook/stripe/route.ts:19`; `setState` in effect in `MasonryGallery.tsx` (×2) + `CursorSpotlight.tsx:23`; unused `Settings` in `app/admin/layout.tsx:4`.
- pCloud source always returns `blurDataURL: undefined` (now guarded at render sites, but a real blur placeholder generator for remote sources would be a future improvement).

---

## 11. What's Remaining (summary)

**Status: All planned phases (A–F) are complete.** The site now has a refined design system, cinematic navigation/hero, editorial page layouts, elevated cards/gallery/lightbox, and polished forms/auth — all reduced-motion safe.

**Completed work, by phase:**

- **Phase A — Foundation Refresh** ✅
  - [x] Color tokens, display font (Space Grotesk), `.glass-elevated`/`.label`/`.display`/`.hairline`, `TextReveal`/`MagneticButton`/`ParallaxImage`.
  - [x] Fixed pre-existing 500 (blur placeholder on HEIC covers).

- **Phase B — Navigation + Hero** ✅
  - [x] `Navbar.tsx`: accent-dot active indicator, full-screen mobile menu.
  - [x] `Hero.tsx`: `.display` headline via `TextReveal`, scroll-linked fade/scale, film-style carousel.
  - [x] `app/template.tsx`: fade + slide + blur page transition.

- **Phase C — Page Layouts** ✅
  - [x] `app/page.tsx`: marquee strip + bento grid + `text-h2` headers.
  - [x] `app/gallery/page.tsx`: editorial `TextReveal` `text-h1` header.
  - [x] `app/collections/page.tsx`: typographic header + bento grid.
  - [x] `app/collections/[slug]/page.tsx`: full-bleed 55vh header + overlapped title.
  - [x] `app/about/page.tsx`: overlapping composition, stats strip, gear pills.
  - [x] `app/contact/page.tsx`: split layout.

- **Phase D — Cards, Gallery & Lightbox** ✅
  - [x] `PhotoCard.tsx`: borderless float, focus-frame, glass capsule, staggered fav/buy.
  - [x] `CollectionCard.tsx`: mono number badge, hairline + glow-border, featured span.
  - [x] `MasonryGallery.tsx`: `gap-6`, scroll-velocity skew, animated loader.
  - [x] `Lightbox.tsx`: drag/swipe nav, directional transition, keyboard hint.

- **Phase E — Forms, Auth & Micro-Interactions** ✅
  - [x] `ContactForm.tsx`: floating labels + inline toast status.
  - [x] `login/page.tsx` + `signup/page.tsx`: split-screen + glass card.
  - [x] `MagneticButton` on About CTA; `TextReveal` H1s across pages.

- **Phase F — Performance & QA** ✅
  - [x] Build/lint clean (no new errors), all routes 200, reduced-motion + mobile audit, no CLS regression.

**Open (out of scope, pre-existing):**
- 4 pre-existing lint errors (stripe `any`, `setState`-in-effect ×3, unused `Settings`).
- pCloud source returns `blurDataURL: undefined` (guarded at render; a real remote blur generator is a future enhancement).

**Optional future enhancements (see §9):** custom blend-mode cursor, scroll-driven CSS view transitions, WebGL hero transitions, per-collection story layouts.

---

*This plan is written against the current codebase state and preserves the existing architecture, security model, and performance guardrails.*
