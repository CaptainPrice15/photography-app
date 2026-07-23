# Lumen — Next.js → Angular 19 Migration

**Goal:** Migrate from Next.js 16 (App Router) to Angular 19 standalone with SSR, resolving hydration errors and providing a stable, maintainable foundation.

**Stack:** Angular 19 · Express (Node.js API) · Prisma · Tailwind v4 · Stripe · pCloud

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    pnpm monorepo                         │
│                                                         │
│  apps/lumen/          Angular 19 app (SSR)              │
│  apps/api/            Express REST API (images/auth/     │
│                       payments/cache)                   │
│  libs/shared/         Shared types, Zod schemas, utils   │
│  prisma/              Database schema + migrations       │
│  scripts/             CLI tooling (gen-pcloud-meta, etc) │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
```
Browser ──→ Angular SSR ──→ Express API ──→ pCloud (images)
                            Express API ──→ Prisma/Postgres (users, orders, favs)
                            Express API ──→ Stripe (payments, webhooks)
                            Express API ──→ Sharp (watermark, resize, format convert)
                            Express API ──→ Vercel KV / FS (image cache)
```

---

## Phase 1 — Scaffold & Core ✅

Monorepo setup, Angular 19 app scaffold, Express API, shared types, Prisma.

### 1.1 pnpm workspace
- [x] Root `package.json` + `pnpm-workspace.yaml`
- [x] `/apps/lumen` — Angular 19 SSR
- [x] `/apps/api` — Express + TypeScript
- [x] `/libs/shared` — shared types/schemas

### 1.2 Angular 19 app
- [x] `npx @angular/cli new lumen` with SSR
- [x] Standalone components (no NgModules)
- [x] Tailwind v4 via PostCSS
- [x] `@angular/animations`, `@angular/cdk`

### 1.3 Express API
- [x] TypeScript + `tsx` dev runner
- [x] Prisma client, Sharp, Stripe SDK, pCloud fetch
- [x] `/api/photos/*`, `/api/auth/*`, `/api/favorites/*`, `/api/payment/*`, `/api/contact`
- [x] Cookie-based session (HMAC-signed, same as current)

### 1.4 Shared lib
- [x] `@lumen/shared` — `Photo`, `Collection`, `PhotoSource`, `Session`, `Order` interfaces
- [x] Zod validation schemas for auth/contact forms

### 1.5 Prisma
- [x] Copy existing `schema.prisma` (User, Favorite, Order)
- [x] Set up Postgres connection

### Files created
- [x] `pnpm-workspace.yaml`
- [x] `apps/lumen/` (Angular scaffold)
- [x] `apps/api/` (Express scaffold)
- [x] `libs/shared/src/index.ts` (types)

---

## Phase 2 — Backend API ✅

Migrate all Next.js API routes and server actions to Express routes.

### 2.1 Authentication routes — `apps/api/src/routes/auth.ts`
- [x] `POST /api/auth/login` — loginAction equivalent
- [x] `POST /api/auth/register` — registerAction equivalent
- [x] `POST /api/auth/logout` — logoutAction equivalent
- [x] `GET /api/auth/session` — getSession equivalent

### 2.2 Photo routes — `apps/api/src/routes/photos.ts`
- [x] `GET /api/photos/*` — image proxy (pCloud fetch → cache → watermark → serve)
- [x] `GET /api/photos/collections` — list collections
- [x] `GET /api/photos/collections/:slug` — single collection
- [x] `GET /api/photos/featured` — featured photos

### 2.3 Download route — `apps/api/src/routes/download.ts`
- [x] `GET /api/download/*` — full-res download (paid guard)

### 2.4 Favorites routes — `apps/api/src/routes/favorites.ts`
- [x] `GET /api/favorites` — get favorite photo IDs
- [x] `POST /api/favorites/toggle` — toggle favorite
- [x] `GET /api/favorites/photos` — get full favorite photo objects

### 2.5 Payment routes — `apps/api/src/routes/payment.ts`
- [x] `POST /api/checkout` — create Stripe checkout session
- [x] `POST /api/webhook/stripe` — Stripe webhook
- [x] `GET /api/orders` — user order history

### 2.6 Contact route — `apps/api/src/routes/contact.ts`
- [x] `POST /api/contact` — submit contact form

### 2.7 Core libs (copy from Next.js project)
- [x] `apps/api/src/lib/cache.ts` — dual-backend cache (KV/FS)
- [x] `apps/api/src/lib/watermark.ts` — Sharp watermark engine
- [x] `apps/api/src/lib/storage/*.ts` — pCloud + local source adapters
- [x] `apps/api/src/lib/auth.ts` — HMAC session management
- [x] `apps/api/src/lib/db.ts` — Prisma client singleton
- [x] `apps/api/src/lib/stripe.ts` — Stripe client singleton

---

## Phase 3 — Angular App — Services & Guards (Weeks 2-3)

### 3.1 Core services
| Service | Responsibility |
|---------|---------------|
| `AuthService` | Login/register/logout API calls, session cookie management |
| `PhotoService` | Fetch collections, photos, featured from API |
| `FavoritesService` | Toggle/get favorites via API |
| `PaymentService` | Stripe checkout, order history |
| `ThemeService` | Dark/light theme with system preference |
| `CacheService` | In-memory photo metadata cache |

### 3.2 Route guards
| Guard | Purpose |
|-------|---------|
| `authGuard` | Redirect to /login if not authenticated |
| `adminGuard` | Redirect if role !== admin |
| `paidGuard` | Show 402 if not paid |

### 3.3 Interceptors
| Interceptor | Purpose |
|-------------|---------|
| `authInterceptor` | Attach session cookie to outgoing requests |

---

## Phase 4 — Angular App — Shared Components (Week 3)

| Category | Components | Animation migration |
|----------|-----------|-------------------|
| Layout | `NavbarComponent`, `FooterComponent`, `ThemeToggleComponent` | CSS + `@angular/animations` |
| Theme | `AmbientBackgroundComponent`, `CollectionThemeSetterDirective`, `CursorSpotlightComponent` | CSS keyframes + `Renderer2` |
| Gallery | `MasonryGalleryComponent`, `PhotoCardComponent`, `LightboxComponent`, `CollectionFilterComponent`, `FavoriteButtonComponent`, `BuyButtonComponent` | CSS columns, CDK overlay |
| Shared | `ProtectedImageDirective`, `ButtonComponent`, `SectionRevealDirective`, `TextRevealDirective`, `MagneticButtonDirective`, `CountUpComponent`, `ParallaxImageDirective` | IntersectionObserver + animations |
| Home | `HeroCarouselComponent` | CDK or custom RxJS carousel |
| Contact | `ContactFormComponent` | Reactive forms + Zod |

---

## Phase 5 — Angular App — Pages (Weeks 3-4)

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | `HomePageComponent` | Hero + collection grid + masonry |
| `/login` | `LoginPageComponent` | Reactive form → AuthService |
| `/signup` | `SignupPageComponent` | Reactive form → AuthService |
| `/gallery` | `GalleryPageComponent` | Masonry + filter + lightbox |
| `/collections` | `CollectionsPageComponent` | Collection cards |
| `/collections/:slug` | `CollectionDetailComponent` | Header + masonry |
| `/favourites` | `FavouritesPageComponent` | Auth guard + masonry |
| `/about` | `AboutPageComponent` | Static + CountUp |
| `/contact` | `ContactPageComponent` | Reactive form |
| `/payment` | `PaymentPageComponent` | Order history |
| `/payment/checkout` | `CheckoutPageComponent` | Stripe Elements |
| `/checkout/success` | `CheckoutSuccessComponent` | Success message |
| `/admin` | `AdminDashboardComponent` | Admin guard |
| `/admin/collections` | `AdminCollectionsComponent` | Table |
| `/admin/orders` | `AdminOrdersComponent` | Table |

---

## Phase 6 — Animations (Week 4)

### framer-motion → Angular mapping

| framer-motion | Angular |
|--------------|---------|
| `motion.div` + `initial/animate` | `@angular/animations` `trigger('fade')` |
| `AnimatePresence` | `*ngIf` + leave transitions |
| `useScroll`, `useTransform` | `@HostListener('window:scroll')` + `Renderer2` |
| `variants` + `staggerChildren` | `query()` + `stagger()` |
| `drag` + `dragConstraints` | CDK DragDrop |
| `whileInView` | IntersectionObserver directive |
| `useReducedMotion` | CDK a11y `ReduceMotion` token |

---

## Phase 7 — Testing + Deploy (Week 4-5)

- Unit tests: Jest + `@testing-library/angular`
- E2E: Playwright (login → browse → checkout flow)
- Vercel deploy: Angular via `@analogjs/platform` or custom Docker
- Env vars: all existing vars in Vercel dashboard
- Smoke test: all routes 200, auth flows, image loading, payment

---

## Scope guardrails (will NOT change)

- pCloud storage backend stays the same
- Prisma schema/data stays the same
- Stripe integration stays the same (just different HTTP layer)
- Sharp watermarking logic stays the same
- Tailwind v4 design system stays the same
- All CSS/design tokens stay the same
