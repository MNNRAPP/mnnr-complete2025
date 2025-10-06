# mnnr.app Security Hardening - Implementation Progress

**Started:** 2025-10-06
**Status:** 🟡 In Progress
**Current Phase:** Phase 1 - Headers & Limits

---

## Overview

This document tracks the implementation progress of the [Security Hardening Plan](./SECURITY_HARDENING_PLAN.md).

**Legend:**
- 🟢 **Completed** - Fully implemented and tested
- 🟡 **In Progress** - Currently being worked on
- ⚪ **Pending** - Not started
- 🔴 **Blocked** - Blocked by dependency or issue

---

## Epic Status

| Epic | Status | Tasks Complete | Notes |
|------|--------|----------------|-------|
| EPIC 1: CI/CD Supply-Chain | ⚪ Pending | 0/3 | |
| EPIC 2: Supabase/RLS | ⚪ Pending | 0/3 | |
| EPIC 3: Stripe Webhooks | ⚪ Pending | 0/2 | |
| EPIC 4: Edge/WAF/Rate Limits | ⚪ Pending | 0/4 | |
| EPIC 5: Auth/Session | ⚪ Pending | 0/2 | |
| EPIC 6: Frontend Hardening | ⚪ Pending | 0/2 | |
| EPIC 7: Monitoring/Deception | ⚪ Pending | 0/2 | |
| EPIC 8: Incident Playbook | ⚪ Pending | 0/2 | |
| EPIC 9: Secrets & KMS | ⚪ Pending | 0/1 | |
| EPIC 10: Supply-Chain Extras | ⚪ Pending | 0/1 | |

---

## Phase 1: Headers & Limits (Roll-out Order #1)

**Target Completion:** TBD

### EDGE-030: Global Security Headers
**Status:** ⚪ Pending
**Priority:** High
**Owner:** Frontend/Infrastructure

**Tasks:**
- [ ] Update middleware.ts with security headers
- [ ] Add HSTS header
- [ ] Add CSP header (report-only mode)
- [ ] Add X-Content-Type-Options
- [ ] Add X-Frame-Options
- [ ] Add Referrer-Policy
- [ ] Add Permissions-Policy
- [ ] Monitor CSP violations for 72 hours
- [ ] Fix CSP violations
- [ ] Switch CSP to enforcing mode

**Files:**
- `middleware.ts` (update)
- `docs/CSP_VIOLATIONS.md` (create)

---

### EDGE-032: CORS Lock
**Status:** ⚪ Pending
**Priority:** High
**Owner:** Backend

**Tasks:**
- [ ] Define allowed origins (mnnr.app, www.mnnr.app)
- [ ] Implement CORS check in middleware
- [ ] Add preflight handling
- [ ] Test with unauthorized origin
- [ ] Test with authorized origin

**Files:**
- `middleware.ts` (update)

---

### EDGE-031: Rate Limiting
**Status:** ⚪ Pending
**Priority:** High
**Owner:** Infrastructure

**Tasks:**
- [ ] Setup Upstash Redis or Vercel KV
- [ ] Create rate-limit utility
- [ ] Implement per-IP rate limiting (unauth: 5/min)
- [ ] Implement per-user rate limiting (auth: 60/min)
- [ ] Stricter limits for sensitive endpoints
- [ ] Add Retry-After header
- [ ] Test flood scenarios
- [ ] Test legitimate flows

**Files:**
- `utils/rate-limit.ts` (create)
- `middleware.ts` (update)

---

### EDGE-033: Maintenance Kill-Switch
**Status:** ⚪ Pending
**Priority:** Medium
**Owner:** Infrastructure

**Tasks:**
- [ ] Add maintenance mode check in middleware
- [ ] Create maintenance page
- [ ] Add 503 response with Retry-After
- [ ] Document activation procedure
- [ ] Test enabling/disabling maintenance mode

**Files:**
- `middleware.ts` (update)
- `app/maintenance/page.tsx` (create)
- `docs/MAINTENANCE_MODE.md` (create)

---

## Phase 2: Payment Security (Roll-out Order #2)

**Target Completion:** TBD

### PAY-020: Verified, Idempotent Webhook Handler
**Status:** ⚪ Pending
**Priority:** Critical
**Owner:** Backend

**Tasks:**
- [ ] Create stripe_events table migration
- [ ] Add idempotency check to webhook handler
- [ ] Test duplicate webhook delivery
- [ ] Test signature verification
- [ ] Verify no duplicate state changes

**Files:**
- `app/api/webhooks/route.ts` (update)
- `supabase/migrations/[timestamp]_stripe_events.sql` (create)

---

### PAY-021: Secrets Hygiene
**Status:** ⚪ Pending
**Priority:** Critical
**Owner:** Backend

**Tasks:**
- [ ] Audit codebase for Stripe secret usage
- [ ] Verify secrets only in server env
- [ ] Update .env.example
- [ ] Document key rotation procedure
- [ ] Test client bundle for secrets

**Files:**
- `.env.example` (update)
- `docs/STRIPE_KEY_ROTATION.md` (create)

---

## Phase 3: Database Security (Roll-out Order #3)

**Target Completion:** TBD

### DB-010: Enable Deny-by-Default RLS
**Status:** ⚪ Pending
**Priority:** Critical
**Owner:** Backend

**Tasks:**
- [ ] Create RLS enablement migration
- [ ] Enable RLS on all public tables
- [ ] Create policies for user-owned tables
- [ ] Create policies for shared tables
- [ ] Test unauthenticated access (should return 0 rows)
- [ ] Test authenticated access (should see own data only)
- [ ] Test on staging
- [ ] Deploy to production

**Files:**
- `supabase/migrations/[timestamp]_enable_rls.sql` (create)
- `docs/RLS_POLICIES.md` (create)

---

### DB-011: Service Key Isolation
**Status:** ⚪ Pending
**Priority:** Critical
**Owner:** Backend

**Tasks:**
- [ ] Audit codebase for service role key usage
- [ ] Verify service key never in client code
- [ ] Verify service key not in NEXT_PUBLIC_ env vars
- [ ] Document key rotation procedure
- [ ] Run bundle analysis

**Files:**
- `docs/KEY_ROTATION.md` (create)

---

### DB-012: Audit Trail
**Status:** ⚪ Pending
**Priority:** Medium
**Owner:** Backend

**Tasks:**
- [ ] Create audit_log table migration
- [ ] Lock down table with RLS (service role only)
- [ ] Create triggers for critical tables
- [ ] Define retention policy
- [ ] Test audit logging

**Files:**
- `supabase/migrations/[timestamp]_audit_trail.sql` (create)

---

## Phase 4: CI/CD (Roll-out Order #4)

**Target Completion:** TBD

### SEC-002: Lock Dependencies and Scan
**Status:** ⚪ Pending
**Priority:** High
**Owner:** DevSecOps

**Tasks:**
- [ ] Verify package-lock.json exists and is committed
- [ ] Add npm audit to CI pipeline
- [ ] Enable GitHub Dependabot alerts
- [ ] Enable Dependabot security updates
- [ ] Run npm audit and fix high/critical issues
- [ ] Configure Dependabot.yml

**Files:**
- `.github/dependabot.yml` (create)
- `.github/workflows/security-ci.yml` (update)

---

### SEC-001: Add Security CI Workflow
**Status:** ⚪ Pending
**Priority:** High
**Owner:** DevSecOps

**Tasks:**
- [ ] Create security-ci.yml workflow
- [ ] Add SBOM generation (CycloneDX)
- [ ] Add ESLint security rules
- [ ] Add Semgrep SAST scanning
- [ ] Add OWASP ZAP baseline DAST
- [ ] Add artifact packaging
- [ ] Add cosign signing placeholder
- [ ] Configure branch protection

**Files:**
- `.github/workflows/security-ci.yml` (create)

---

### SEC-003: GitHub Hardening
**Status:** ⚪ Pending
**Priority:** High
**Owner:** Admin

**Tasks:**
- [ ] Create CODEOWNERS file
- [ ] Enable branch protection on main
- [ ] Require signed commits
- [ ] Require code reviews (min 1)
- [ ] Require status checks to pass
- [ ] Limit GITHUB_TOKEN permissions
- [ ] Disable force pushes
- [ ] Disable branch deletion

**Files:**
- `.github/CODEOWNERS` (create)

---

## Phase 5: Monitoring (Roll-out Order #5)

**Target Completion:** TBD

### MON-060: Centralized Logs + Alerts
**Status:** ⚪ Pending
**Priority:** High
**Owner:** DevOps

**Tasks:**
- [ ] Create structured logger utility
- [ ] Ship logs to SIEM (Datadog/Sentry)
- [ ] Configure auth event logging
- [ ] Configure webhook event logging
- [ ] Configure RLS change logging
- [ ] Configure query volume monitoring
- [ ] Create alert for unsigned JWT
- [ ] Create alert for webhook replay
- [ ] Create alert for RLS changes
- [ ] Create alert for large exports
- [ ] Create alert for login spikes
- [ ] Create runbooks for each alert
- [ ] Test synthetic events

**Files:**
- `utils/logger.ts` (create)
- `docs/ALERT_RUNBOOKS.md` (create)

---

### MON-061: Honeypots
**Status:** ⚪ Pending
**Priority:** Low
**Owner:** Security

**Tasks:**
- [ ] Create honeypot utility
- [ ] Create /api/internal/config endpoint
- [ ] Create /internal/console page
- [ ] Add IP ban functionality
- [ ] Configure P0 alerts
- [ ] Test honeypot trigger
- [ ] Verify alert delivery

**Files:**
- `app/api/internal/config/route.ts` (create)
- `app/internal/console/page.tsx` (create)
- `utils/honeypot.ts` (create)

---

## Phase 6: Secrets (Roll-out Order #6)

**Target Completion:** TBD

### KMS-080: Vault/KMS Integration
**Status:** ⚪ Pending
**Priority:** Medium
**Owner:** DevOps

**Tasks:**
- [ ] Choose secrets management solution
- [ ] Document secret creation procedure
- [ ] Document secret rotation procedure
- [ ] Document emergency access procedure
- [ ] Configure OIDC for CI
- [ ] Migrate secrets to KMS
- [ ] Update CI workflows to use OIDC
- [ ] Verify no plaintext secrets in repo
- [ ] Verify no secrets in logs

**Files:**
- `docs/SECRETS_MANAGEMENT.md` (create)
- `.github/workflows/*.yml` (update)

**Blockers:**
- Need to decide on KMS solution (Vercel/Vault/AWS)

---

## Phase 7: Incident Prep (Roll-out Order #7)

**Target Completion:** TBD

### IR-070: Containment Script
**Status:** ⚪ Pending
**Priority:** High
**Owner:** Security

**Tasks:**
- [ ] Create incident containment script
- [ ] Add confirmation prompt
- [ ] Add maintenance mode enablement
- [ ] Add database snapshot
- [ ] Add key rotation guidance
- [ ] Document M-of-N approval process
- [ ] Test dry-run
- [ ] Create incident response documentation

**Files:**
- `scripts/incident-containment.sh` (create)
- `docs/INCIDENT_RESPONSE.md` (create)

---

### IR-071: Backups and Restores
**Status:** ⚪ Pending
**Priority:** High
**Owner:** DevOps

**Tasks:**
- [ ] Enable Supabase PITR or configure pg_dump
- [ ] Create backup script
- [ ] Configure encrypted storage
- [ ] Create restore test script
- [ ] Perform monthly restore test
- [ ] Measure RTO (target: <1 hour)
- [ ] Measure RPO (target: <15 minutes)
- [ ] Document procedures

**Files:**
- `scripts/backup.sh` (create)
- `scripts/restore-test.sh` (create)
- `docs/BACKUP_RESTORE.md` (create)

---

## Phase 8: Finalize (Roll-out Order #8)

**Target Completion:** TBD

### EDGE-030: Enforce CSP
**Status:** ⚪ Pending (depends on EDGE-030 report-only)
**Priority:** High
**Owner:** Frontend/Infrastructure

**Tasks:**
- [ ] Review 72 hours of CSP violation reports
- [ ] Fix all violations
- [ ] Switch from report-only to enforcing
- [ ] Monitor for production issues
- [ ] Run SecurityHeaders.com scan

**Files:**
- `middleware.ts` (update)

---

### AUTH-041: MFA for Admins
**Status:** ⚪ Pending
**Priority:** Medium
**Owner:** Backend

**Tasks:**
- [ ] Enable Supabase MFA (WebAuthn/TOTP)
- [ ] Create MFA enforcement utility
- [ ] Document MFA policy
- [ ] Configure MFA for admin users
- [ ] Test admin login with MFA
- [ ] Generate and store backup codes

**Files:**
- `docs/MFA_POLICY.md` (create)
- `utils/auth/enforce-mfa.ts` (create)

---

### AUTH-040: Cookies and Tokens
**Status:** ⚪ Pending
**Priority:** High
**Owner:** Backend

**Tasks:**
- [ ] Verify Supabase cookie configuration
- [ ] Set HttpOnly, Secure, SameSite=Strict
- [ ] Configure access token expiration (1 hour)
- [ ] Configure refresh token expiration (7 days)
- [ ] Enable refresh token rotation
- [ ] Add server-side validation for privileged ops
- [ ] Test token expiration and rotation

**Files:**
- `utils/supabase/middleware.ts` (update)
- `utils/supabase/server.ts` (update)

---

### FE-050: Eliminate Dangerous Sinks
**Status:** ⚪ Pending
**Priority:** High
**Owner:** Frontend

**Tasks:**
- [ ] Audit for dangerouslySetInnerHTML
- [ ] Audit for eval() and Function()
- [ ] Install DOMPurify if needed
- [ ] Sanitize all user HTML
- [ ] Add ESLint security rules
- [ ] Test with XSS payloads
- [ ] Run security scan

**Files:**
- `.eslintrc.json` (update)

---

### FE-051: Secrets Boundary
**Status:** ⚪ Pending
**Priority:** Critical
**Owner:** Frontend/Backend

**Tasks:**
- [ ] Audit environment variables
- [ ] Verify only NEXT_PUBLIC_* in client
- [ ] Create bundle scan script
- [ ] Add bundle security to CI
- [ ] Run bundle scan for secrets
- [ ] Update .env.example

**Files:**
- `scripts/scan-bundle.sh` (create)
- `.github/workflows/bundle-security.yml` (create)

---

### SC-090: SBOM + Signing
**Status:** ⚪ Pending
**Priority:** Medium
**Owner:** DevSecOps

**Tasks:**
- [ ] Add SBOM generation to workflow
- [ ] Upload SBOM as artifact
- [ ] Configure Cosign signing
- [ ] Sign artifacts
- [ ] Add signature verification to deploy
- [ ] Test end-to-end flow

**Files:**
- `.github/workflows/security-ci.yml` (update)

---

## Test Matrix Status

| Test | Status | Pass/Fail | Notes |
|------|--------|-----------|-------|
| T-1: Stripe Webhook Idempotency | ⚪ Not Run | - | |
| T-2: JWT with alg:none | ⚪ Not Run | - | |
| T-3: Unauth admin access | ⚪ Not Run | - | |
| T-4: CSP violations | ⚪ Not Run | - | |
| T-5: RLS user isolation | ⚪ Not Run | - | |
| T-6: Rate limiting | ⚪ Not Run | - | |
| T-7: Honeypot trigger | ⚪ Not Run | - | |
| T-8: Bundle secret scan | ⚪ Not Run | - | |

---

## Go/No-Go Checklist

**Status:** 🔴 Not Ready for Production

- [ ] All EPIC tasks show green in CI
- [ ] Tests T-1 through T-8 pass in staging and prod
- [ ] No high/critical vulnerabilities open
- [ ] CSP enforced with zero production breakage
- [ ] SIEM alerts verified live
- [ ] RLS audit shows deny-by-default across all tables
- [ ] Key rotation procedures documented and tested
- [ ] Incident response playbook tested (dry-run)
- [ ] Backup/restore tested successfully

---

## Blockers & Issues

| ID | Description | Status | Owner | Notes |
|----|-------------|--------|-------|-------|
| - | No blockers yet | - | - | - |

---

## Notes & Decisions

### 2025-10-06
- Created security hardening plan and implementation tracking
- Ready to begin Phase 1 implementation

---

## Next Steps

1. Begin Phase 1: Headers & Limits
   - Start with EDGE-030 (Security Headers)
   - Move to EDGE-032 (CORS)
   - Then EDGE-031 (Rate Limiting)
   - Finally EDGE-033 (Maintenance Mode)

2. After Phase 1 completion, review and proceed to Phase 2

3. Continue systematic rollout through Phase 8

---

**Last Updated:** 2025-10-06
**Updated By:** Claude Code
