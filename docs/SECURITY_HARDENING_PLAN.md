# mnnr.app "Bulletproof" Hardening Plan v1.0

**SCOPE:** Next.js app (Vercel), Supabase (Auth/DB/Storage), Stripe (checkout/webhooks)
**GOAL:** Zero-trust, WAF/edge filters, strict RLS, signed webhooks, CSP/HSTS, CI supply-chain defenses, incident playbooks.

---

## EPIC 1 — CI/CD SUPPLY-CHAIN

### SEC-001: Add Security CI workflow
**Priority:** High
**Owner:** DevSecOps

**Implementation:**
- Create: `.github/workflows/security-ci.yml`
- Include:
  - SBOM generation (CycloneDX format)
  - ESLint security rules
  - Semgrep SAST scanning
  - OWASP ZAP baseline DAST
  - Artifact packaging
  - Cosign signing placeholder

**Acceptance Criteria:**
- ✅ Workflow passes on PR and main branches
- ✅ Artifacts uploaded to GitHub
- ✅ Branch protection requires this job to be green
- ✅ No high/critical findings block merge

---

### SEC-002: Lock dependencies and scan
**Priority:** High
**Owner:** DevSecOps

**Implementation:**
- Enforce `npm ci` with package-lock.json
- Enable GitHub Dependabot:
  - Vulnerability alerts
  - Security update PRs
  - Version update PRs (optional)
- Add `npm audit` to CI pipeline

**Acceptance Criteria:**
- ✅ `npm audit` shows no high/critical vulnerabilities
- ✅ Dependabot enabled in repository settings
- ✅ package-lock.json committed and enforced
- ✅ CI fails if high/critical vulns detected

---

### SEC-003: GitHub hardening
**Priority:** High
**Owner:** Admin

**Implementation:**
- Repository settings:
  - Require signed commits
  - Add CODEOWNERS file
  - Mandatory code reviews (min 1 approval)
  - Require status checks to pass
  - Limit GITHUB_TOKEN permissions to `read` by default
- Branch protection rules for `main`:
  - Require pull request reviews
  - Dismiss stale reviews on new commits
  - Require status checks
  - No force pushes
  - No deletions

**Acceptance Criteria:**
- ✅ Repository settings enforce all requirements
- ✅ PR merge blocked without passing checks
- ✅ Unsigned commits rejected
- ✅ CODEOWNERS file present and enforced

---

## EPIC 2 — SUPABASE/RLS

### DB-010: Enable deny-by-default RLS everywhere
**Priority:** Critical
**Owner:** Backend

**Implementation:**
- Run admin SQL to `ENABLE ROW LEVEL SECURITY` on all public schema tables
- For user-owned tables (users, subscriptions, etc.):
  ```sql
  -- Example for users table
  CREATE POLICY "Users can view own data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  ```
- For shared tables (products, prices):
  ```sql
  CREATE POLICY "Anyone can view products"
    ON public.products
    FOR SELECT
    USING (true);
  ```

**Acceptance Criteria:**
- ✅ Querying without auth returns zero rows for protected tables
- ✅ Authenticated user can only see own rows
- ✅ Service role bypasses RLS (tested)
- ✅ All tables have RLS enabled (no exceptions)

**Files to Create:**
- `supabase/migrations/[timestamp]_enable_rls.sql`
- `docs/RLS_POLICIES.md` (documentation)

---

### DB-011: Service key isolation
**Priority:** Critical
**Owner:** Backend

**Implementation:**
- Audit codebase for service role key usage
- Ensure service role key NEVER exposed to client:
  - Only in server-side code
  - Only in API routes
  - Never in environment variables starting with `NEXT_PUBLIC_`
- Store service role key in:
  - Vercel environment variables (server-side only)
  - Local `.env.local` (gitignored)
- Document key rotation procedure

**Acceptance Criteria:**
- ✅ `grep -r "SUPABASE_SERVICE_ROLE" client/` returns nothing
- ✅ Service key only in server utils and API routes
- ✅ Key rotation documented
- ✅ Bundle analysis shows no service key in client JS

**Files to Create:**
- `docs/KEY_ROTATION.md`

---

### DB-012: Audit trail
**Priority:** Medium
**Owner:** Backend

**Implementation:**
- Create append-only audit table:
  ```sql
  CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT
  );

  -- Lock down: service role only
  ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Service role only"
    ON public.audit_log
    USING (false);
  ```
- Create triggers for critical tables
- Log: policy changes, admin role grants, subscription changes

**Acceptance Criteria:**
- ✅ Audit entries appear on schema changes
- ✅ Table cannot be edited by app roles (only service role)
- ✅ Retention policy defined (e.g., 90 days)

**Files to Create:**
- `supabase/migrations/[timestamp]_audit_trail.sql`

---

## EPIC 3 — STRIPE WEBHOOKS

### PAY-020: Verified, idempotent handler
**Priority:** Critical
**Owner:** Backend

**Implementation:**
- Update `/api/webhooks/route.ts`:
  ```typescript
  // 1. Verify signature
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

  // 2. Check idempotency
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .single();

  if (existing) {
    return new Response(JSON.stringify({ received: true, processed: 'already' }), { status: 200 });
  }

  // 3. Process event
  await processEvent(event);

  // 4. Record event
  await supabase.from('stripe_events').insert({ id: event.id });
  ```
- Create migration:
  ```sql
  CREATE TABLE public.stripe_events (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
  );
  ```

**Acceptance Criteria:**
- ✅ Valid events flip plan→pro once
- ✅ Duplicate payload returns 200 "Already processed"
- ✅ Invalid signature returns 400
- ✅ No duplicate state changes in database

**Files to Update:**
- `app/api/webhooks/route.ts`

**Files to Create:**
- `supabase/migrations/[timestamp]_stripe_events.sql`

---

### PAY-021: Secrets hygiene
**Priority:** Critical
**Owner:** Backend

**Implementation:**
- Verify secrets are server-side only:
  - `STRIPE_SECRET_KEY` → Vercel env (server)
  - `STRIPE_WEBHOOK_SECRET` → Vercel env (server)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → OK for client
- Document rotation procedure
- Add to `.env.example` with clear comments

**Acceptance Criteria:**
- ✅ Secrets present in Vercel environment variables
- ✅ Secrets NOT exposed in client bundle
- ✅ `.env.example` documents all required secrets
- ✅ Rotation procedure documented

**Files to Update:**
- `.env.example`

**Files to Create:**
- `docs/STRIPE_KEY_ROTATION.md`

---

## EPIC 4 — EDGE/WAF/RATE LIMITS

### EDGE-030: Global security headers
**Priority:** High
**Owner:** Frontend/Infrastructure

**Implementation:**
- Update `middleware.ts` to add headers:
  ```typescript
  export async function middleware(request: NextRequest) {
    const response = await updateSession(request);

    // Security headers
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // CSP (report-only initially)
    const nonce = crypto.randomUUID();
    const csp = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' https://js.stripe.com;
      connect-src 'self' https://*.supabase.co https://api.stripe.com;
      img-src 'self' data: https:;
      frame-ancestors 'none';
      base-uri 'self';
    `.replace(/\s+/g, ' ').trim();

    response.headers.set('Content-Security-Policy-Report-Only', csp);

    return response;
  }
  ```
- Monitor CSP violations for 72 hours
- After cleanup, change to `Content-Security-Policy` (enforcing)

**Acceptance Criteria:**
- ✅ Headers present on all responses
- ✅ CSP violations collected in report-only mode for 72h
- ✅ After fixes, CSP enforced with zero production breakage
- ✅ SecurityHeaders.com scan shows A+ rating

**Files to Update:**
- `middleware.ts`

**Files to Create:**
- `docs/CSP_VIOLATIONS.md` (tracking)

---

### EDGE-031: Rate limiting
**Priority:** High
**Owner:** Infrastructure

**Implementation:**
- Use Vercel Edge Config + Upstash Redis or Vercel KV
- Implement rate limiting in middleware:
  - Unauthenticated: 5 req/min per IP
  - Authenticated: 60 req/min per user
  - Stricter for sensitive endpoints:
    - `/api/webhooks/*`: 100 req/hour per IP
    - `/api/auth/*`: 10 req/min per IP
    - `/api/admin/*`: 20 req/min per user
- Return 429 with Retry-After header

**Acceptance Criteria:**
- ✅ Flood tests hit 429 status code
- ✅ Legitimate flows unaffected
- ✅ Retry-After header present
- ✅ Rate limit info logged

**Files to Create:**
- `utils/rate-limit.ts`
- `middleware.ts` (update)

---

### EDGE-032: CORS lock
**Priority:** High
**Owner:** Backend

**Implementation:**
- Configure CORS in API routes and middleware:
  ```typescript
  const allowedOrigins = [
    'https://mnnr.app',
    'https://www.mnnr.app',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ];

  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response('CORS not allowed', { status: 403 });
  }
  ```
- Block wildcard origins
- Implement preflight handling

**Acceptance Criteria:**
- ✅ Only mnnr.app and www.mnnr.app allowed
- ✅ Preflight to unknown origin rejected
- ✅ Development localhost allowed in dev mode only

**Files to Update:**
- `middleware.ts`
- API route files as needed

---

### EDGE-033: Maintenance kill-switch
**Priority:** Medium
**Owner:** Infrastructure

**Implementation:**
- Add maintenance mode check in middleware:
  ```typescript
  if (process.env.MAINTENANCE_MODE === 'true') {
    return new Response('Service temporarily unavailable', {
      status: 503,
      headers: {
        'Retry-After': '3600',
        'Content-Type': 'text/html'
      }
    });
  }
  ```
- Create maintenance page
- Document activation procedure

**Acceptance Criteria:**
- ✅ Flipping `MAINTENANCE_MODE=true` instantly gates traffic
- ✅ Returns 503 with Retry-After header
- ✅ Maintenance page displayed
- ✅ Activation procedure documented

**Files to Update:**
- `middleware.ts`

**Files to Create:**
- `app/maintenance/page.tsx`
- `docs/MAINTENANCE_MODE.md`

---

## EPIC 5 — AUTH/SESSION

### AUTH-040: Cookies and tokens
**Priority:** High
**Owner:** Backend

**Implementation:**
- Verify Supabase cookie configuration:
  ```typescript
  // In utils/supabase/middleware.ts
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
  ```
- Configure token expiration:
  - Access token: 1 hour
  - Refresh token: 7 days with rotation
- Server-side validation for privileged operations

**Acceptance Criteria:**
- ✅ Cookie flags verified (HttpOnly, Secure, SameSite=Strict)
- ✅ Access tokens expire and rotate
- ✅ Refresh tokens rotate on use
- ✅ Privileged ops validated server-side

**Files to Update:**
- `utils/supabase/middleware.ts`
- `utils/supabase/server.ts`

---

### AUTH-041: MFA for admins
**Priority:** Medium
**Owner:** Backend

**Implementation:**
- Enable Supabase MFA:
  - WebAuthn/U2F for admin users
  - TOTP as backup
- Document enforcement:
  - Admin role requires MFA
  - CI/CD service accounts use OIDC tokens
  - Release owners require MFA

**Acceptance Criteria:**
- ✅ Admin logins require MFA
- ✅ MFA enrollment enforced for admin role
- ✅ Backup codes generated and stored securely

**Files to Create:**
- `docs/MFA_POLICY.md`
- `utils/auth/enforce-mfa.ts`

---

## EPIC 6 — FRONTEND HARDENING

### FE-050: Eliminate dangerous sinks
**Priority:** High
**Owner:** Frontend

**Implementation:**
- Audit for dangerous patterns:
  - `dangerouslySetInnerHTML`
  - `eval()`
  - `Function()` constructor
  - `innerHTML`
- If user HTML needed, use DOMPurify:
  ```typescript
  import DOMPurify from 'isomorphic-dompurify';

  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userHtml) }} />
  ```
- Add ESLint rules to prevent

**Acceptance Criteria:**
- ✅ `grep -r "dangerouslySetInnerHTML" .` shows only sanitized usage
- ✅ No `eval()` or `Function()` in codebase
- ✅ Tests pass with malicious input (XSS attempts)
- ✅ ESLint rules prevent dangerous patterns

**Files to Create:**
- `.eslintrc.json` (update with security rules)

---

### FE-051: Secrets boundary
**Priority:** Critical
**Owner:** Frontend/Backend

**Implementation:**
- Audit environment variables:
  - Only `NEXT_PUBLIC_*` allowed in client
  - All secrets must be server-side only
- Add bundle analyzer to CI
- Grep for common secret patterns:
  ```bash
  # Check for leaked secrets
  grep -r "sk_live" .next/
  grep -r "SERVICE_ROLE" .next/
  ```

**Acceptance Criteria:**
- ✅ Only `NEXT_PUBLIC_*` vars in client bundle
- ✅ Bundle scan shows no secret patterns
- ✅ CI fails if secrets detected in bundle
- ✅ `.env.example` clearly documents public vs private

**Files to Create:**
- `scripts/scan-bundle.sh`
- `.github/workflows/bundle-security.yml`

---

## EPIC 7 — MONITORING/DECEPTION

### MON-060: Centralized logs + alerts
**Priority:** High
**Owner:** DevOps

**Implementation:**
- Ship logs to SIEM (Datadog, Sentry, etc.):
  - Authentication events
  - Webhook events
  - RLS policy changes
  - Query volume anomalies
- Configure alerts:
  - JWT with `alg:none` → P0
  - Webhook replay attempts → P1
  - RLS policy changes → P1
  - Large data exports → P2
  - Login spikes (>100/min) → P2

**Acceptance Criteria:**
- ✅ Synthetic events trigger alerts
- ✅ Alert routing configured
- ✅ Runbook created for each alert
- ✅ Test alerts verified

**Files to Create:**
- `utils/logger.ts` (structured logging)
- `docs/ALERT_RUNBOOKS.md`

---

### MON-061: Honeypots
**Priority:** Low
**Owner:** Security

**Implementation:**
- Create honeypot endpoints:
  ```typescript
  // app/api/internal/config/route.ts
  export async function GET(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // Log P0 alert
    await logSecurityEvent({
      type: 'honeypot_triggered',
      severity: 'critical',
      ip,
      path: '/api/internal/config'
    });

    // Temporarily ban IP (rate limit)
    await banIP(ip, '24h');

    // Return harmless response
    return Response.json({ status: 'ok' });
  }
  ```
- Endpoints:
  - `/internal/console`
  - `/api/internal/config`
  - `/.env`
  - `/admin/config.php`

**Acceptance Criteria:**
- ✅ Probe triggers P0 alert
- ✅ IP temporarily banned
- ✅ Returns harmless 200 response
- ✅ Alert includes IP, path, timestamp

**Files to Create:**
- `app/api/internal/config/route.ts`
- `app/internal/console/page.tsx`
- `utils/honeypot.ts`

---

## EPIC 8 — INCIDENT PLAYBOOK

### IR-070: Containment script
**Priority:** High
**Owner:** Security

**Implementation:**
- Create incident containment script:
  ```bash
  #!/bin/bash
  # scripts/incident-containment.sh

  echo "=== INCIDENT CONTAINMENT SCRIPT ==="
  echo "This script will:"
  echo "1. Enable maintenance mode"
  echo "2. Snapshot the database"
  echo "3. Guide key rotation"
  echo ""
  echo "Type 'CONFIRM' to proceed:"
  read confirmation

  if [ "$confirmation" != "CONFIRM" ]; then
    echo "Aborted."
    exit 1
  fi

  # Enable maintenance mode
  vercel env add MAINTENANCE_MODE true --scope production

  # Snapshot database
  pg_dump $DATABASE_URL > incident_snapshot_$(date +%s).sql

  # Guide key rotation
  echo "Next steps:"
  echo "1. Rotate Stripe keys: https://dashboard.stripe.com/apikeys"
  echo "2. Rotate Supabase keys: https://app.supabase.com/project/_/settings/api"
  echo "3. Investigate logs for unauthorized access"
  ```

**Acceptance Criteria:**
- ✅ Dry-run logs intended actions
- ✅ Real run gates traffic and snapshots DB
- ✅ Requires typed "CONFIRM"
- ✅ M-of-N approval process documented

**Files to Create:**
- `scripts/incident-containment.sh`
- `docs/INCIDENT_RESPONSE.md`

---

### IR-071: Backups and restores
**Priority:** High
**Owner:** DevOps

**Implementation:**
- Configure Supabase backups:
  - Enable PITR (Point-in-Time Recovery)
  - Or: nightly pg_dump to encrypted S3
- Monthly restore test:
  - Restore to staging environment
  - Verify data integrity
  - Measure RTO/RPO
- Document procedures

**Acceptance Criteria:**
- ✅ Restore test succeeds monthly
- ✅ RTO documented (target: <1 hour)
- ✅ RPO documented (target: <15 minutes)
- ✅ Backup encryption verified

**Files to Create:**
- `scripts/backup.sh`
- `scripts/restore-test.sh`
- `docs/BACKUP_RESTORE.md`

---

## EPIC 9 — SECRETS & KMS

### KMS-080: Vault/KMS integration
**Priority:** Medium
**Owner:** DevOps

**Implementation:**
- Integrate with secrets management:
  - Option A: Vercel Secret Management
  - Option B: HashiCorp Vault
  - Option C: AWS Secrets Manager
- Short-lived tokens in CI via OIDC:
  ```yaml
  permissions:
    id-token: write
    contents: read
  ```
- Document procedures:
  - Secret creation
  - Secret rotation
  - Emergency access

**Acceptance Criteria:**
- ✅ No plaintext secrets in repo
- ✅ No secrets in logs or artifacts
- ✅ CI uses OIDC tokens
- ✅ Secret rotation automated

**Files to Create:**
- `docs/SECRETS_MANAGEMENT.md`
- `.github/workflows/` (update with OIDC)

---

## EPIC 10 — SUPPLY-CHAIN EXTRAS

### SC-090: SBOM + signing
**Priority:** Medium
**Owner:** DevSecOps

**Implementation:**
- Generate SBOM on each build:
  ```yaml
  - name: Generate SBOM
    run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json

  - name: Upload SBOM
    uses: actions/upload-artifact@v3
    with:
      name: sbom
      path: sbom.json
  ```
- Sign artifacts with Cosign:
  ```yaml
  - name: Sign artifacts
    run: cosign sign-blob --key cosign.key sbom.json > sbom.json.sig
  ```
- Verify on deploy

**Acceptance Criteria:**
- ✅ SBOM generated each build
- ✅ SBOM stored as artifact
- ✅ Artifacts signed
- ✅ Signature verified pre-deploy

**Files to Update:**
- `.github/workflows/security-ci.yml`

---

## TEST MATRIX

All tests must pass before enforcement:

### T-1: Stripe Webhook Idempotency
```bash
# Send duplicate event
curl -X POST localhost:3000/api/webhooks \
  -H "stripe-signature: $SIG" \
  -d @event.json

# Second call should return "Already processed"
```

### T-2: JWT with alg:none
```bash
# Attempt to use unsigned JWT
curl -H "Authorization: Bearer $UNSIGNED_JWT" \
  localhost:3000/api/protected

# Should return 401 and trigger alert
```

### T-3: Unauth access to admin
```bash
curl localhost:3000/api/admin/users
# Should always return 401/403
```

### T-4: CSP Violations
- Enable report-only mode
- Monitor violations for 72h
- Fix violations
- Enforce CSP
- Verify no production breakage

### T-5: RLS User Isolation
```sql
-- User A tries to read User B's data
SELECT * FROM users WHERE id = 'user-b-id';
-- Should return 0 rows
```

### T-6: Rate Limiting
```bash
# Send >5 requests/min unauthenticated
for i in {1..10}; do
  curl localhost:3000/api/endpoint
done
# Should hit 429 after 5 requests
```

### T-7: Honeypot Trigger
```bash
curl localhost:3000/internal/console
# Should trigger P0 alert and temporary ban
```

### T-8: Bundle Secret Scan
```bash
npm run build
grep -r "sk_live" .next/
grep -r "SERVICE_ROLE" .next/
# Should return 0 matches
```

---

## ROLL-OUT ORDER

Execute in this sequence:

1. **Phase 1: Headers & Limits**
   - EDGE-030 (report-only CSP)
   - EDGE-032 (CORS)
   - EDGE-031 (rate limits)
   - EDGE-033 (maintenance mode)

2. **Phase 2: Payment Security**
   - PAY-020 (webhook verification + idempotency)
   - PAY-021 (secrets hygiene)

3. **Phase 3: Database Security**
   - DB-010 (RLS on staging → prod)
   - DB-011 (service key audit)
   - DB-012 (audit trail)

4. **Phase 4: CI/CD**
   - SEC-002 (dependency scanning)
   - SEC-001 (security CI workflow)
   - SEC-003 (GitHub hardening)

5. **Phase 5: Monitoring**
   - MON-060 (SIEM + alerts)
   - MON-061 (honeypots)

6. **Phase 6: Secrets**
   - KMS-080 (Vault/KMS)
   - Rotate all keys

7. **Phase 7: Incident Prep**
   - IR-070 (containment script)
   - IR-071 (backup/restore)

8. **Phase 8: Finalize**
   - EDGE-030 (enforce CSP)
   - AUTH-041 (MFA)
   - SC-090 (SBOM signing)

---

## ENVIRONMENT VARIABLES (Server-Side Only)

Required in Vercel environment:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # SERVER ONLY

# Feature flags
MAINTENANCE_MODE=false

# Optional
VERCEL_PROJECT_ID=prj_...
VERCEL_TOKEN=...
PG_DSN=postgresql://...
```

---

## ACCEPTANCE CRITERIA (Go/No-Go)

Before production deployment:

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

## PROGRESS TRACKING

See [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md) for current status.
