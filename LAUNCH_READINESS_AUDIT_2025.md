# MNNR Launch Readiness Audit Report

**Date:** February 15, 2026
**Scope:** Full-stack MVP audit - app development, security, UX, deployment
**Auditor:** Automated deep-code analysis

---

## EXECUTIVE SUMMARY

| Area | Score | Status |
|------|-------|--------|
| **Core App (Auth/Dashboard/Billing)** | 7/10 | Functional but thin |
| **API Layer** | 5/10 | Core working; 4 endpoints are mock/demo only |
| **Security** | 6/10 | Strong framework; critical secret leak |
| **Database** | 6/10 | Schema exists; missing tables for key features |
| **Frontend / UX** | 7/10 | Landing polished; dashboard is skeletal |
| **Testing** | 5/10 | Infrastructure present; coverage gaps |
| **Deployment / DevOps** | 6/10 | Configs present; Dockerfile needs work |
| **Overall MVP Readiness** | **~60%** | **Not launch-ready** |

**Bottom line:** The landing/marketing site is close to launch-ready. The authenticated product experience (dashboard, billing flows, core API features) has significant gaps that must be closed before any paying customer touches the product.

---

## SECTION 1: CRITICAL BLOCKERS (Must Fix Before Any Launch)

### 1.1 PRODUCTION SECRETS COMMITTED TO GIT
**Severity: P0 CRITICAL**
**File:** `.env.production` (tracked in git, line 16)

The file contains a real Stripe secret key:
```
STRIPE_SECRET_KEY=sk_test_51S6R0T8CWPGKXcGk...
```
And Supabase keys. These are in the git history.

**Impact:** Anyone with repo access can charge your Stripe account or read/write your database.

**Required actions:**
1. Rotate ALL Stripe keys immediately in Stripe Dashboard
2. Rotate Supabase service role key in Supabase Dashboard
3. Add `.env.production` to `.gitignore` (currently only `.env.production.local` is ignored)
4. Remove `.env.production` from the repository
5. Scrub git history with `git filter-repo` or BFG Repo Cleaner

---

### 1.2 WEBAUTHN VERIFICATION IS MOCKED
**Severity: P0 CRITICAL**
**File:** `utils/webauthn.ts:73-108`

Both `verifyPasskeyRegistration()` and `verifyPasskeyAuthentication()` return hardcoded `{ verified: true }` without performing any cryptographic verification:

```typescript
// This would contain the verification logic
// For now, return a mock successful verification
return { verified: true, ... };
```

**Impact:** If passkeys are exposed to users, ANY credential is accepted as valid - complete auth bypass.

**Required actions:**
- Either implement real `@simplewebauthn/server` verification calls (use `verifyRegistrationResponse` / `verifyAuthenticationResponse`)
- Or disable/remove the passkey feature entirely from the UI until implemented

---

### 1.3 DUAL AUTH SYSTEM CONFLICT
**Severity: P0 CRITICAL**
**Files:** `middleware.ts`, `app/dashboard/page.tsx`, `app/api/keys/route.ts`

The codebase has TWO conflicting authentication systems running simultaneously:

| Location | Auth System | Method |
|----------|-------------|--------|
| `middleware.ts` | **Clerk** (`@clerk/nextjs` `authMiddleware`) | Redirects to `/sign-in` |
| `app/dashboard/page.tsx` | **Supabase** (`supabase.auth.getUser()`) | Redirects to `/signin` |
| `app/api/keys/route.ts` | **Supabase** (`supabase.auth.getUser()`) | Returns 401 |
| `app/api/subscriptions/route.ts` | **Supabase** (`supabase.auth.getUser()`) | Returns 401 |
| `app/api/v1/keys/route.ts` | **Neither** (header `x-user-id` or test user) | Insecure fallback |

**Impact:** Users who authenticate via Clerk middleware will hit Supabase auth checks in API routes and get 401s. The product fundamentally cannot work with both systems active.

**Required actions:**
- Decide on ONE auth provider (Clerk OR Supabase Auth)
- Remove the other completely
- Ensure ALL routes use the same auth check consistently
- `app/api/v1/keys/route.ts` has a `// TODO: Replace with proper auth` and falls back to a test user - this is a security hole

---

### 1.4 V1 API KEYS ROUTE HAS NO REAL AUTH
**Severity: P0 CRITICAL**
**File:** `app/api/v1/keys/route.ts:14-26`

```typescript
// TODO: Replace with proper auth
async function getAuthenticatedUser(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (userId) return db.getUserById(userId);
  // Default to test user for development
  return db.getUserByEmail('test@mnnr.app');
}
```

Anyone can impersonate any user by setting an `x-user-id` header, or access the test user's keys with no auth at all.

---

## SECTION 2: MAJOR GAPS (Must Fix for MVP)

### 2.1 FOUR API ENDPOINTS ARE ENTIRELY MOCK/DEMO
**Severity: P1 HIGH**

These routes return hardcoded demo data with no database backing:

| Route | Feature | Status |
|-------|---------|--------|
| `app/api/agents/route.ts` | Agent Economic Identity | 100% mock data, returns `"Tables pending migration"` |
| `app/api/escrow/route.ts` | Programmable Escrow | 100% mock data, returns `"Tables pending migration"` |
| `app/api/streams/route.ts` | Payment Streams | 100% mock data, returns `"Tables pending migration"` |
| `app/api/marketplace/route.ts` | Agent Marketplace | 100% mock data, returns `"Tables pending migration"` |

**Impact:** These are marketed as MNNR differentiators vs competitors, but they do nothing. The database schema (`database/schema.sql`) has NO tables for agents, escrow, streams, or marketplace listings.

**Required actions:**
- Create database migrations for: `agents`, `agent_wallets`, `agent_transactions`, `escrow_contracts`, `payment_streams`, `marketplace_listings`, `marketplace_bids`
- Implement real CRUD operations against the database
- OR if these are post-MVP: remove them from the docs/marketing and flag as "Coming Soon"

---

### 2.2 DASHBOARD IS SKELETAL
**Severity: P1 HIGH**
**File:** `app/dashboard/DashboardContent.tsx`

The entire dashboard renders only ONE component:

```tsx
export default function DashboardContent({ user, profile, subscription }) {
  return (
    <div className="space-y-6">
      <ApiKeysManager userId={user.id} />
    </div>
  );
}
```

The `page.tsx` fetches subscription and profile data but DashboardContent ignores both `profile` and `subscription` props. A paying customer sees:
- API key manager (works)
- Nothing about their subscription status
- No usage metrics or analytics
- No billing info or invoices
- No account settings

**Required actions:**
- Add subscription status card showing plan name, renewal date, usage
- Add usage metrics visualization (usage_events data is available via API)
- Add recent invoices list
- Add account/profile management section
- Add quick actions (upgrade plan, view docs, etc.)

---

### 2.3 AI SERVICE TOOL FUNCTIONS ARE STUBS
**Severity: P1 HIGH**
**File:** `lib/ai-service.ts:458-475`

Three critical AI tool functions are unimplemented:

```typescript
async function executeDatabaseQuery(sql, params) {
  // TODO: Implement safe database query execution
  return { placeholder: 'Database query execution not yet implemented' };
}

async function getSystemMetrics(metrics, timeRange) {
  // TODO: Implement metrics retrieval
  return { placeholder: 'Metrics retrieval not yet implemented' };
}

async function executeAction(action, params, userId) {
  // TODO: Implement action execution
  return { message: `Action ${action} executed successfully` };
}
```

---

### 2.4 STRIPE CONFIG ISSUES
**Severity: P1 HIGH**

Multiple Stripe initialization patterns exist:

| File | Pattern | Issue |
|------|---------|-------|
| `utils/stripe/config.ts` | Safe singleton with `isStripeConfigured()` check | Good |
| `app/api/subscriptions/route.ts:5` | `new Stripe(process.env.STRIPE_SECRET_KEY!)` | Crashes if env var missing |
| `app/api/subscriptions/[id]/cancel/route.ts:5` | `new Stripe(process.env.STRIPE_SECRET_KEY!)` | Same crash risk |

The non-null assertion `!` means these routes will throw at import time if the env var is missing instead of returning a proper error.

**Required actions:**
- Use `getStripeClient()` from `utils/stripe/config.ts` consistently in all routes
- Remove direct `new Stripe()` instantiations

---

### 2.5 CSRF SECRET HAS WEAK FALLBACK
**Severity: P1 HIGH**
**File:** `lib/csrf.ts`

The CSRF secret falls back to `"default-csrf-secret-change-in-production"` if the env var is missing. In production this means predictable CSRF tokens.

**Required actions:**
- Add `CSRF_SECRET` to `.env.example` and `.env.production.example`
- Throw an error in production if `CSRF_SECRET` is not set

---

### 2.6 AUDIT LOG IS IN-MEMORY ONLY
**Severity: P1 HIGH**
**File:** `lib/security.ts:326-373`

```typescript
const auditLog: AuditLogEntry[] = [];
const MAX_AUDIT_ENTRIES = 10000;
```

All security audit entries are stored in a JavaScript array and lost on every restart or deployment.

**Required actions:**
- Persist audit entries to the `audit_logs` database table (already exists in schema)
- Or ship to Sentry/PostHog/external logging service

---

## SECTION 3: MODERATE ISSUES (Should Fix for MVP)

### 3.1 INCONSISTENT AUTH REDIRECTS

| Page | Redirects unauthenticated to |
|------|------------------------------|
| Clerk middleware | `/sign-in` |
| `app/dashboard/page.tsx` | `/signin` |
| `app/signup/page.tsx` | `/sign-up` |

Users bounce between different auth URLs. There are FOUR separate sign-in page directories:
- `app/sign-in/[[...sign-in]]/page.tsx` (Clerk)
- `app/sign-up/[[...sign-up]]/page.tsx` (Clerk)
- `app/signin/page.tsx` (Supabase-based)
- `app/signup/page.tsx` (redirects to `/sign-up`)

### 3.2 CSP ALLOWS UNSAFE-INLINE AND UNSAFE-EVAL

**File:** `lib/security.ts:82`
```typescript
`script-src 'self' 'unsafe-inline' 'unsafe-eval' ${domains}`,
```

This significantly weakens XSS protection. Should use nonces or hashes instead.

### 3.3 RATE LIMITING FAILS OPEN

**File:** `lib/rate-limit.ts` - If Redis/Upstash is unreachable, rate limiting silently passes all requests through instead of blocking.

### 3.4 DOCKERFILE ISSUES

**File:** `Dockerfile`
- References `pnpm-lock.yaml` but package.json uses `npm@10.2.0` as packageManager
- No multi-stage build (image larger than necessary)
- Runs as root (security risk)
- No `HEALTHCHECK` instruction
- No `.dockerignore` found

### 3.5 CONSOLE.LOG STATEMENTS IN PRODUCTION CODE

Found **51 `console.log/error/warn`** calls across 22 files in `app/`. While `next.config.js` strips `console.log` in production, `console.error` and `console.warn` remain. These should use the structured `logger` utility consistently.

### 3.6 TYPE SAFETY ISSUES

Found **58 occurrences** of `any` type across 17 files in `app/`. Notable:
- `DashboardContent.tsx:7-9` - All props typed as `any`
- `app/api/agents/route.ts:53` - Supabase client cast to `any`
- `app/api/escrow/route.ts:36` - Same issue
- `app/api/streams/route.ts:26` - Same issue

### 3.7 MISSING DATABASE TABLES

The `database/schema.sql` defines 7 tables: `users`, `api_keys`, `usage_events`, `subscriptions`, `invoices`, `usage_limits`, `audit_logs`.

Missing tables required by active API routes:
- `stripe_events` (referenced by webhook idempotency check)
- `customers` (referenced by subscription route)
- `products` (referenced by pricing page)
- `prices` (referenced by pricing page)
- `agents` / `agent_wallets` (required for agents API)
- `escrow_contracts` (required for escrow API)
- `payment_streams` (required for streams API)
- `marketplace_listings` / `marketplace_bids` (required for marketplace API)

### 3.8 PACKAGE.JSON DEPENDENCY ISSUES

- `vitest` is in `dependencies` (should be `devDependencies`)
- `@vitest/ui` is in `dependencies` (should be `devDependencies`)
- `jest` and `vitest` both present (pick one)
- `eslint-config-next: 16.1.1` mismatches `next: ^14.2.35`
- `lucide-react` is pinned to exact `0.330.0` while everything else uses `^`

---

## SECTION 4: UX AUDIT

### 4.1 LANDING PAGE (Score: 8/10)

The homepage at `app/page.tsx` renders a complete marketing funnel:
- Hero section
- Features grid
- Performance metrics
- Integrations
- Pricing (with static fallback for fast LCP)
- Pricing comparison table
- Testimonials
- FAQ
- Newsletter signup
- CTA

**Good:** Static generation enabled, hour-long revalidation, clean component composition.
**Gaps:** Need to verify testimonials are real, not placeholder.

### 4.2 DASHBOARD (Score: 3/10)

Only shows API key management. Missing:
- Account overview / welcome state
- Subscription status widget
- Usage graphs (recharts is installed but unused in dashboard)
- Billing history / invoices
- Team management UI (API routes exist but no frontend)
- Profile settings
- Notification preferences

### 4.3 PRICING PAGE (Score: 7/10)

Two implementations exist:
1. `app/pricing/page.tsx` - Server-rendered with Supabase products (proper)
2. `components/ui/Pricing/PricingSection.tsx` - Client-side with static fallback

Static fallback shows Free ($0), Pro ($49/mo), Enterprise (Custom). This is reasonable for MVP.

**Gap:** The `/signin/signup` links in static pricing may not match the active auth system.

### 4.4 DOCS (Score: 7/10)

Complete doc pages exist for: Quick Start, API Reference, x402, Marketplace, Enterprise, Security, Deployment, Changelog. Has sidebar nav, TOC, and auto-anchors.

### 4.5 LEGAL (Score: 7/10)

Privacy policy, terms of service, and security policy pages exist at both `/legal/*` and `/privacy`, `/terms` (duplicates).

### 4.6 ERROR HANDLING (Score: 8/10)

- `app/error.tsx` - Component error boundary with Sentry logging
- `app/global-error.tsx` - Root error boundary with inline styles (correct for when CSS fails)
- `app/loading.tsx` - Loading state

### 4.7 MOBILE / PWA (Score: 5/10)

- Service worker exists (`public/sw.js`)
- PWA install prompt component exists
- `next.config.mobile.js` exists but is minimal (16 lines)
- Capacitor/desktop app scaffolding exists (`desktop/main.js`)
- No evidence of mobile-specific testing or responsive QA

---

## SECTION 5: SECURITY AUDIT

### 5.1 SECURITY HEADERS (Score: 8/10)

Configured in `next.config.js`:
- HSTS: 2 years with includeSubDomains and preload
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrictive
- Cross-Origin policies set

**Weakness:** CSP includes `unsafe-inline` and `unsafe-eval`.

### 5.2 INPUT VALIDATION (Score: 8/10)

- Zod schemas used for request validation in API routes
- SQL injection detection patterns in `lib/security.ts`
- XSS prevention via HTML entity encoding
- URL sanitization
- Max 10 API keys per user enforced

### 5.3 ENCRYPTION (Score: 7/10)

- AES-256-GCM encryption available (`utils/encryption.ts`)
- PBKDF2 key derivation with 100K iterations
- Column-level DB encryption available (`utils/db-encryption.ts`)
- API keys stored as SHA-256 hashes

**Weakness:** `DB_ENCRYPTION_KEY` not documented in env examples; development fallback is weak.

### 5.4 RATE LIMITING (Score: 7/10)

Upstash Redis-backed with sliding window:
- API keys: 10 req/10s
- Auth: 5 req/60s
- General: 100 req/60s
- Webhooks: 1000 req/60s

**Weakness:** Fails open on Redis connection failure.

### 5.5 WEBHOOK SECURITY (Score: 9/10)

- Stripe signature verification via `constructEvent()`
- Idempotency check against `stripe_events` table
- Rate limiting applied
- Structured logging

### 5.6 SECRET MANAGEMENT (Score: 2/10)

- `.env.production` with real secrets committed to repo
- `.gitignore` only excludes `.env.production.local`, NOT `.env.production`
- Pre-commit hooks (gitleaks, detect-secrets) configured but clearly failed to catch this
- CSRF_SECRET has weak hardcoded fallback

---

## SECTION 6: TESTING AUDIT

### 6.1 Test Infrastructure (Score: 7/10)

- Vitest configured as primary test runner with jsdom
- 80% coverage thresholds in jest.config.js
- Playwright for E2E with Chrome, Firefox, Safari, and mobile viewports
- Testing Library for component tests

### 6.2 Test Coverage (Score: 4/10)

**Unit tests (15 files):**
- API keys route - comprehensive (432 lines)
- UI components - Badge, Button, Card, toast (basic)
- Hooks - useApi
- Utils - api-client, env-validation, logger

**E2E tests (5 suites):**
- Auth flow, checkout flow, API endpoints, dashboard, critical flows

**Major gaps - no tests for:**
- Stripe webhook handler
- Subscription creation/cancellation
- Any of the mock endpoints (agents, escrow, streams, marketplace)
- Encryption/decryption utilities
- Rate limiting behavior
- CSRF protection
- Security middleware
- Dashboard rendering with real data

---

## SECTION 7: DEPLOYMENT READINESS

### 7.1 Build Configuration (Score: 7/10)

- Coolify deployment config with health checks, SSL, auto-scaling
- `next.config.optimized.js` with SWC, gzip, image optimization, bundle splitting
- Sentry integration configured (client, server, edge)
- Sitemap generator exists

### 7.2 Observability (Score: 6/10)

- Sentry error monitoring configured
- PostHog analytics provider exists
- OpenTelemetry instrumentation file exists
- Structured logger utility with levels
- Health check endpoint at `/api/health`

**Gap:** Logger `TODO: Implement log aggregation service integration`

### 7.3 CI/CD (Score: 3/10)

- Dependabot configured for weekly updates
- Pre-commit hooks configured
- CODEOWNERS file exists
- **Missing:** GitHub Actions workflow for CI (no `.github/workflows/` found for build/test/deploy)
- **Missing:** Automated deployment pipeline
- **Missing:** Branch protection rules enforcement

---

## SECTION 8: PRIORITIZED REMEDIATION PLAN

### PHASE 1: STOP THE BLEEDING (Days 1-2)

| # | Task | Priority | Est. Effort |
|---|------|----------|-------------|
| 1 | Rotate all Stripe + Supabase keys | P0 | 30 min |
| 2 | Add `.env.production` to `.gitignore` & remove from repo | P0 | 15 min |
| 3 | Scrub secrets from git history | P0 | 1 hr |
| 4 | Fix v1/keys auth (remove test user fallback) | P0 | 30 min |
| 5 | Decide Clerk vs Supabase auth - remove the other | P0 | 2-4 hrs |

### PHASE 2: MAKE THE PRODUCT WORK (Days 3-7)

| # | Task | Priority | Est. Effort |
|---|------|----------|-------------|
| 6 | Unify all auth redirects to one system | P1 | 2 hrs |
| 7 | Build out dashboard (subscription card, usage, invoices) | P1 | 4-6 hrs |
| 8 | Fix Stripe client initialization (use singleton) | P1 | 1 hr |
| 9 | Add missing DB tables (customers, products, prices, stripe_events) | P1 | 2 hrs |
| 10 | Set CSRF_SECRET as required in production | P1 | 30 min |
| 11 | Persist audit logs to database | P1 | 2 hrs |
| 12 | Implement or disable WebAuthn verification | P1 | 2-4 hrs |

### PHASE 3: HARDEN FOR PRODUCTION (Days 8-14)

| # | Task | Priority | Est. Effort |
|---|------|----------|-------------|
| 13 | Add GitHub Actions CI workflow (lint, test, build) | P2 | 2-3 hrs |
| 14 | Fix Dockerfile (multi-stage, non-root, correct package manager) | P2 | 2 hrs |
| 15 | Remove `unsafe-inline`/`unsafe-eval` from CSP | P2 | 2-3 hrs |
| 16 | Add integration tests for Stripe webhooks | P2 | 3-4 hrs |
| 17 | Replace `any` types with proper interfaces | P2 | 2 hrs |
| 18 | Move vitest from dependencies to devDependencies | P2 | 15 min |
| 19 | Implement log aggregation | P2 | 2-3 hrs |
| 20 | Add rate-limit fail-closed mode | P2 | 1 hr |

### PHASE 4: MVP+ FEATURES (Days 15+)

| # | Task | Priority | Est. Effort |
|---|------|----------|-------------|
| 21 | Implement agents/escrow/streams/marketplace with real DB | P3 | 2-4 weeks |
| 22 | Implement AI service tool functions | P3 | 1-2 days |
| 23 | Mobile/PWA QA and optimization | P3 | 1 week |
| 24 | Team management UI | P3 | 3-5 days |
| 25 | Performance testing / load testing | P3 | 2-3 days |

---

## SECTION 9: WHAT'S WORKING WELL

To be clear, significant work has been done:

1. **Landing page** is polished with good component architecture
2. **API key management** end-to-end flow works (create, list, delete, mask)
3. **Stripe webhook handler** is well-implemented with idempotency
4. **Security infrastructure** is comprehensive (headers, CSRF, rate limiting, encryption, sanitization)
5. **Error boundaries** are properly implemented with Sentry integration
6. **Schema design** uses RLS, proper indexes, UUID PKs, audit trails
7. **Environment validation** catches misconfigurations early
8. **Pre-commit hooks** for secret detection are configured
9. **E2E test infrastructure** with multi-browser/mobile coverage is solid
10. **Documentation pages** are thorough

---

## SECTION 10: FINAL VERDICT

### Can this ship to paying customers today? **No.**

The three non-negotiable blockers are:
1. **Leaked secrets** need immediate rotation
2. **Dual auth systems** make the product non-functional for real users
3. **v1/keys endpoint** has an open auth bypass

### Can this reach MVP launch-ready? **Yes, in ~2 weeks.**

Phases 1-2 (roughly 1 week of focused work) would bring the core product to a functional state where:
- Users can sign up through ONE consistent auth flow
- Dashboard shows meaningful data (subscription, usage, keys)
- Billing works end-to-end via Stripe
- Security posture is production-grade

Phase 3 (week 2) adds the hardening needed for production confidence.

The mock endpoints (agents, escrow, streams, marketplace) can ship as "Coming Soon" or "Beta" features without blocking the core MVP launch.

---

*Report generated from automated deep-code analysis of 150+ source files across the MNNR codebase.*
