# Stripe Key Rotation Procedure

## PAY-021: Secrets Hygiene - Key Rotation

### Overview
Regular key rotation is a critical security practice. This document outlines the procedure for rotating Stripe API keys and webhook secrets.

---

## When to Rotate

### Scheduled Rotation (Recommended)
- **Production Keys:** Every 90 days
- **Test Keys:** Every 180 days or as needed

### Immediate Rotation Required
- ✅ Key exposed in logs or error messages
- ✅ Key committed to version control (even if removed)
- ✅ Employee with key access leaves company
- ✅ Suspected compromise or unauthorized access
- ✅ Security incident or breach
- ✅ Key found in client bundle or public location

---

## Pre-Rotation Checklist

- [ ] Schedule maintenance window (webhook downtime expected)
- [ ] Notify team of rotation
- [ ] Verify backup/rollback plan
- [ ] Test rotation in staging environment first
- [ ] Have Stripe dashboard access ready

---

## Rotation Procedure

### Step 1: Generate New Keys

**Stripe Dashboard:**
1. Go to [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys)
2. Click "Create secret key"
3. Name it with date: `Production Key - 2025-10-06`
4. Save the new key securely (appears only once)
5. **DO NOT delete old key yet** (needed for rollback)

**Webhook Secret:**
1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Click "Roll secret"
4. Save the new webhook secret
5. Old webhook secret becomes invalid immediately

---

### Step 2: Update Vercel Environment Variables

**Via Vercel CLI:**
```bash
# Update production environment
vercel env add STRIPE_SECRET_KEY --scope production
# Paste new key when prompted

vercel env add STRIPE_WEBHOOK_SECRET --scope production
# Paste new webhook secret when prompted

# Trigger redeployment
vercel --prod
```

**Via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Find `STRIPE_SECRET_KEY`
3. Click "Edit" → Update value → Save
4. Find `STRIPE_WEBHOOK_SECRET`
5. Click "Edit" → Update value → Save
6. Trigger redeployment from Deployments tab

---

### Step 3: Update Local Development

**Update `.env.local`:**
```bash
# .env.local (NEVER commit this file)
STRIPE_SECRET_KEY=sk_test_new_key_here
STRIPE_WEBHOOK_SECRET=whsec_new_webhook_secret_here
```

**Team Communication:**
```
Subject: Stripe Keys Rotated - Action Required

Team,

Stripe API keys were rotated on 2025-10-06.

Action Required:
1. Pull latest .env.example
2. Update your .env.local with new keys (see Notion/1Password)
3. Restart your dev server

Keys available in: [secure location]

Questions? Contact: [security team]
```

---

### Step 4: Verify New Keys Work

**Test Checklist:**
```bash
# 1. Test API calls
curl https://api.stripe.com/v1/customers \
  -u sk_live_new_key:

# 2. Test webhook delivery
# Send test webhook from Stripe Dashboard
# Verify webhook handler logs show "Webhook processed successfully"

# 3. Test checkout flow
# Create test checkout session
# Complete payment
# Verify subscription created

# 4. Monitor error rates
# Check Sentry/logs for authentication errors
# Verify no 401s from Stripe API
```

**Expected Results:**
- ✅ API calls return 200 OK
- ✅ Webhooks verified and processed
- ✅ No authentication errors in logs
- ✅ Checkout flow completes successfully

---

### Step 5: Deactivate Old Keys

**Wait Period:** 24-48 hours after rotation

**After Verification:**
1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. Find old key in "Restricted keys" or "Secret keys"
3. Click "Delete"
4. Confirm deletion

**Why Wait?**
- Allows time to detect integration issues
- Gives time for all servers to refresh
- Enables easy rollback if problems arise

---

## Rollback Procedure

If issues arise after rotation:

```bash
# Immediately revert to old keys
vercel env add STRIPE_SECRET_KEY sk_live_old_key --scope production
vercel env add STRIPE_WEBHOOK_SECRET whsec_old_secret --scope production

# Redeploy
vercel --prod

# In Stripe Dashboard, roll webhook secret back
# (if you haven't deleted the old endpoint)
```

---

## Security Checks

### Before Rotation
```bash
# Verify no keys in client bundle
npm run build
grep -r "sk_live" .next/
grep -r "sk_test" .next/
# Should return 0 matches
```

### After Rotation
```bash
# Verify old keys are revoked
curl https://api.stripe.com/v1/customers \
  -u sk_live_old_key:
# Should return 401 Unauthorized
```

---

## Automation (Future Enhancement)

**Automated Rotation Script:**
```bash
#!/bin/bash
# scripts/rotate-stripe-keys.sh

echo "⚠️  This script will rotate Stripe keys"
echo "Type 'CONFIRM' to proceed:"
read confirmation

if [ "$confirmation" != "CONFIRM" ]; then
  exit 1
fi

# 1. Create new key via Stripe API (requires Stripe CLI)
NEW_KEY=$(stripe keys create --description "Auto-rotated $(date +%Y-%m-%d)")

# 2. Update Vercel environment
vercel env add STRIPE_SECRET_KEY "$NEW_KEY" --scope production

# 3. Trigger deployment
vercel --prod

# 4. Verify
sleep 30
curl -s https://mnnr.app/api/health/stripe || echo "❌ Verification failed"

echo "✅ Rotation complete"
echo "⚠️  Remember to delete old key after 48 hours"
```

---

## Incident Response

### If Key is Compromised

**Immediate Actions (< 5 minutes):**
1. Enable maintenance mode:
   ```bash
   vercel env add MAINTENANCE_MODE true --scope production
   ```
2. Rotate keys immediately (don't wait for maintenance window)
3. Delete old keys in Stripe Dashboard immediately
4. Review Stripe Dashboard for suspicious activity
5. Check recent charges, refunds, customer data access

**Investigation (< 1 hour):**
1. Review audit logs for unauthorized access
2. Check Git history for key exposure
3. Scan error logs for key leaks
4. Review team access logs

**Communication:**
1. Notify security team
2. File incident report
3. Update stakeholders
4. Document lessons learned

---

## Key Storage Best Practices

### ✅ Secure Storage
- 1Password / Vault / Secret Manager
- Vercel Environment Variables (encrypted at rest)
- Local `.env.local` (gitignored)

### ❌ Never Store Here
- Version control (Git)
- Unencrypted files
- Slack/Email/Chat
- Documentation/Wikis
- Client-side code
- Error messages/Logs

---

## Compliance & Auditing

### Audit Trail
Document every rotation:
```
Date: 2025-10-06
Rotated By: security-team@mnnr.app
Reason: Scheduled 90-day rotation
Old Key ID: sk_live_xxxOLD
New Key ID: sk_live_xxxNEW
Verification: ✅ Passed
Deactivation: 2025-10-08 (48h later)
```

### Compliance Requirements
- **PCI DSS:** Keys must be rotated every 90 days
- **SOC 2:** Document rotation procedure and audit trail
- **GDPR:** Ensure no customer data exposed during rotation

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Security Team | security@mnnr.app | 24/7 |
| DevOps Lead | devops@mnnr.app | Business hours |
| Stripe Support | https://support.stripe.com | 24/7 |

---

**Last Updated:** 2025-10-06
**Next Review:** 2026-01-06
**Owner:** Security Team
