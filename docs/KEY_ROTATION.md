# Supabase Key Rotation Procedure

## DB-011: Service Key Isolation & Rotation

### Overview
Supabase service role keys bypass Row Level Security (RLS) and have full database access. Proper isolation and regular rotation are critical security practices.

---

## Key Types & Security Levels

### 1. Supabase Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Security Level:** PUBLIC (safe for client-side)
- **Access:** Respects RLS policies
- **Usage:** Client-side API calls, authentication
- **Prefix:** `eyJhbGc...` (JWT)
- **Rotation:** Every 6-12 months or on compromise

### 2. Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)
- **Security Level:** CRITICAL (server-side only)
- **Access:** Bypasses ALL RLS policies
- **Usage:** Admin operations, webhook handlers, migrations
- **Prefix:** `eyJhbGc...` (JWT with `role: service_role`)
- **Rotation:** Every 90 days or immediately on compromise

### 3. Database Connection String (`DATABASE_URL`)
- **Security Level:** CRITICAL (server-side only)
- **Access:** Direct PostgreSQL access
- **Usage:** Migrations, backups, direct SQL
- **Format:** `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`
- **Rotation:** Every 90 days or on compromise

---

## Service Key Isolation Verification

### Current Implementation ✅

**Server-Side Usage Only:**
- `utils/supabase/admin.ts` - Admin client creation
- `utils/env-validation.ts` - Environment validation
- `app/api/webhooks/route.ts` - Webhook handling

**No Client-Side Usage:**
- ✅ No usage in `/app` directories (pages)
- ✅ No usage in `/components`
- ✅ Not prefixed with `NEXT_PUBLIC_`
- ✅ Security check in `env-validation.ts` (line 51-55)

**Security Guard:**
```typescript
// utils/env-validation.ts
if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'WARNING: Found NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY - this exposes admin privileges!'
  );
}
```

---

## When to Rotate

### Scheduled Rotation (Recommended)
- **Service Role Key:** Every 90 days
- **Anon Key:** Every 180 days
- **Database Password:** Every 90 days

### Immediate Rotation Required
- ✅ Key exposed in logs, error messages, or client bundle
- ✅ Key committed to version control (even if removed)
- ✅ Team member with key access leaves
- ✅ Suspected compromise or unauthorized access
- ✅ Security incident or data breach
- ✅ Failed security audit

---

## Pre-Rotation Checklist

- [ ] Schedule maintenance window (brief API downtime expected)
- [ ] Notify development team
- [ ] Test rotation in staging environment
- [ ] Verify backup/rollback plan
- [ ] Have Supabase dashboard access ready
- [ ] Document current key (for rollback)

---

## Rotation Procedure

### Step 1: Generate New Keys

**Supabase Dashboard:**
1. Go to [Project Settings → API](https://app.supabase.com/project/_/settings/api)
2. Scroll to "Project API keys"
3. Click "Generate new service role key"
4. Save the new key securely (appears only once)
5. **DO NOT delete old key yet** (needed for rollback)

**Database Password:**
1. Go to [Project Settings → Database](https://app.supabase.com/project/_/settings/database)
2. Click "Reset database password"
3. Save new password securely
4. Old password remains valid for 24 hours

---

### Step 2: Update Vercel Environment Variables

**Via Vercel CLI:**
```bash
# Update service role key
vercel env add SUPABASE_SERVICE_ROLE_KEY --scope production
# Paste new key when prompted

# If rotating database password
vercel env add DATABASE_URL --scope production
# Paste new connection string

# Trigger redeployment
vercel --prod
```

**Via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Find `SUPABASE_SERVICE_ROLE_KEY`
3. Click "Edit" → Update value → Save
4. Trigger redeployment from Deployments tab

---

### Step 3: Update Local Development

**Update `.env.local`:**
```bash
# .env.local (NEVER commit this file)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...new_key_here
```

**Team Communication:**
```
Subject: Supabase Keys Rotated - Action Required

Team,

Supabase service role key was rotated on 2025-10-06.

Action Required:
1. Pull latest code
2. Update your .env.local with new key (see 1Password/Vault)
3. Restart your dev server

Keys available in: [secure location]

Questions? Contact: [security team]
```

---

### Step 4: Verify New Keys Work

**Test Checklist:**
```bash
# 1. Test service role access
curl https://[project-ref].supabase.co/rest/v1/users \
  -H "apikey: new_service_role_key" \
  -H "Authorization: Bearer new_service_role_key"

# 2. Test webhook handler
# Send test event to /api/webhooks
# Verify successful processing in logs

# 3. Test RLS bypass
# Run admin query that requires service role
# Verify returns all rows (not filtered by RLS)

# 4. Monitor error rates
# Check logs for authentication errors
# Verify no 401/403s from Supabase API
```

**Expected Results:**
- ✅ API calls return 200 OK with full data
- ✅ Webhooks process successfully
- ✅ Admin queries bypass RLS
- ✅ No authentication errors in logs

---

### Step 5: Deactivate Old Keys

**Wait Period:** 48 hours after rotation

**After Verification:**
1. Go to [Project Settings → API](https://app.supabase.com/project/_/settings/api)
2. Old service role key automatically expires
3. For database password, old password expires after 24 hours

**Why Wait?**
- Allows time to detect integration issues
- Gives time for all servers/deployments to refresh
- Enables easy rollback if problems arise

---

## Rollback Procedure

If issues arise after rotation:

```bash
# Immediately revert to old keys
vercel env add SUPABASE_SERVICE_ROLE_KEY [old_key] --scope production

# Redeploy
vercel --prod

# Verify rollback successful
curl https://mnnr.app/api/health
```

---

## Security Checks

### Before Rotation
```bash
# Verify service key not in client bundle
npm run build
grep -r "service_role" .next/
grep -r "SUPABASE_SERVICE_ROLE" .next/
# Should return 0 matches

# Verify no NEXT_PUBLIC_ prefix
grep -r "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE" .
# Should return 0 matches (or only in security check)
```

### After Rotation
```bash
# Verify old key is revoked (should fail)
curl https://[project-ref].supabase.co/rest/v1/users \
  -H "apikey: old_service_role_key" \
  -H "Authorization: Bearer old_service_role_key"
# Should return 401 Unauthorized after expiration
```

---

## Incident Response

### If Service Role Key is Compromised

**Immediate Actions (< 5 minutes):**
1. Enable maintenance mode:
   ```bash
   vercel env add MAINTENANCE_MODE true --scope production
   ```
2. Rotate service role key immediately (don't wait)
3. Rotate database password
4. Review Supabase logs for suspicious activity
5. Check for unauthorized:
   - Data access or exports
   - Schema modifications
   - Policy changes
   - User account access

**Investigation (< 1 hour):**
1. Review audit logs (`SELECT * FROM public.audit_log WHERE severity='critical'`)
2. Check Git history for key exposure
3. Scan error logs for key leaks
4. Review Supabase Dashboard → Logs
5. Check for RLS policy modifications

**Communication:**
1. Notify security team immediately
2. File incident report
3. Update stakeholders
4. Document lessons learned
5. Consider:
   - User notification (if data accessed)
   - Regulatory reporting (GDPR, etc.)

---

## Automation (Future Enhancement)

**Automated Rotation Script:**
```bash
#!/bin/bash
# scripts/rotate-supabase-keys.sh

echo "⚠️  This script will rotate Supabase service role key"
echo "Type 'CONFIRM' to proceed:"
read confirmation

if [ "$confirmation" != "CONFIRM" ]; then
  exit 1
fi

# 1. Generate new key via Supabase API (requires management token)
NEW_KEY=$(supabase keys create service_role)

# 2. Update Vercel environment
vercel env add SUPABASE_SERVICE_ROLE_KEY "$NEW_KEY" --scope production

# 3. Trigger deployment
vercel --prod

# 4. Verify
sleep 30
curl -s https://mnnr.app/api/health || echo "❌ Verification failed"

# 5. Log to audit trail
psql $DATABASE_URL -c "SELECT public.audit_log_event('key_rotation', 'supabase_service_role', NULL, NULL, NULL, 'critical', '{\"automated\": true}');"

echo "✅ Rotation complete"
echo "⚠️  Old key will expire in 48 hours"
```

---

## Key Storage Best Practices

### ✅ Secure Storage
- 1Password / Vault / KMS
- Vercel Environment Variables (encrypted at rest)
- Local `.env.local` (gitignored)
- CI/CD secrets (encrypted)

### ❌ Never Store Here
- Version control (Git) - even in private repos
- Unencrypted files
- Chat apps (Slack, Discord, Teams)
- Documentation / Wikis
- Client-side code
- Error messages / Logs
- Screenshots / Screen recordings

---

## RLS Bypass Detection

### Monitoring Service Role Usage

**Log all service role operations:**
```typescript
// utils/supabase/admin.ts
export function createAdminClient() {
  logger.info('Service role client created', {
    caller: new Error().stack,
    timestamp: new Date().toISOString()
  });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

**Alert on unexpected service role usage:**
- Service role accessed from unexpected IP
- Service role used outside webhook handlers
- Large data exports using service role
- Schema modifications via service role

---

## Compliance & Auditing

### Audit Trail
Document every rotation:
```
Date: 2025-10-06
Rotated By: security-team@mnnr.app
Reason: Scheduled 90-day rotation
Old Key ID: eyJ...OLD (last 10 chars)
New Key ID: eyJ...NEW (last 10 chars)
Verification: ✅ Passed
Expiration: Old key expires 2025-10-08
```

### Compliance Requirements
- **SOC 2:** Document rotation procedure and audit trail
- **GDPR:** Ensure no customer data exposed during rotation
- **PCI DSS:** Keys with elevated privileges rotated every 90 days
- **HIPAA:** Access to PHI secured with regularly rotated credentials

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Security Team | security@mnnr.app | 24/7 |
| DevOps Lead | devops@mnnr.app | Business hours |
| Supabase Support | https://supabase.com/support | 24/7 |

---

## Related Documentation

- [Stripe Key Rotation](./STRIPE_KEY_ROTATION.md)
- [Incident Response](./INCIDENT_RESPONSE.md)
- [RLS Policies](./RLS_POLICIES.md)
- [Security Hardening Plan](./SECURITY_HARDENING_PLAN.md)

---

**Last Updated:** 2025-10-06
**Next Review:** 2026-01-06
**Owner:** Security Team
