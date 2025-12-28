# Secret Rotation Plan - CRITICAL

**Date**: December 27, 2025  
**Status**: 4 Exposed Secrets Detected  
**Priority**: CRITICAL - Immediate Action Required

---

## 🚨 EXPOSED SECRETS

### 1. Sentry Organization Token (Alert #4)
**Secret Type**: Sentry Organization Token  
**Status**: Public leak  
**Location**: Pull request #6  
**Detected**: 12 minutes ago  
**Partial Value**: `sntrys_eyJpYXQiOjE3NTk2OTU0OTcuOTgzOTA0...`

**Impact**: 
- Full access to Sentry organization
- Can view all error logs and sensitive data
- Can modify Sentry configuration
- Access to user data in error reports

**Remediation**:
1. Revoke token immediately in Sentry dashboard
2. Generate new organization token
3. Update environment variables in deployment
4. Remove from PR #6 and git history

---

### 2. Stripe Webhook Signing Secret (Alert #3)
**Secret Type**: Stripe Webhook Signing Secret  
**Status**: Public leak  
**Location**: `quick-stripe-setup.ps1:7`  
**Detected**: October 7  
**Value**: `whsec_wRNftLajMZNeslQOP6vEPm4iVx5NlZ6z`

**Impact**:
- Attackers can forge webhook signatures
- Bypass payment verification
- Trigger unauthorized payment events
- Manipulate subscription states

**Remediation**:
1. Roll webhook signing secret in Stripe dashboard
2. Update webhook endpoint configuration
3. Update environment variable `STRIPE_WEBHOOK_SECRET`
4. Remove from quick-stripe-setup.ps1
5. Add to .gitignore

---

### 3. Stripe Test API Secret Key (Alert #2)
**Secret Type**: Stripe Test API Secret Key  
**Status**: Public leak  
**Location**: `deploy-railway.ps1:68`  
**Detected**: October 7  
**Value**: `sk_test_51S6R0T8CWPGKXcGknkw727t8KJ8DyQyIqwtgGxJolLRvnupNPUnIYoAHmlAC9JmSYAoEjTq3rWiv0VJEa8YWuJNg00xzZvkFFx`

**Impact**:
- Full access to Stripe test mode
- Can create/modify test payments
- Access to test customer data
- Can view all test transactions
- **NOTE**: Test mode only, no production impact

**Remediation**:
1. Roll API key in Stripe dashboard (test mode)
2. Update environment variable `STRIPE_SECRET_KEY`
3. Remove from deploy-railway.ps1
4. Add to .gitignore

---

### 4. Supabase Service Key (Alert #1)
**Secret Type**: Supabase Service Key (JWT)  
**Status**: Public leak  
**Location**: `deploy-railway.ps1:62`  
**Detected**: October 7  
**Partial Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Impact**:
- **CRITICAL**: Full admin access to Supabase database
- Bypass Row Level Security (RLS)
- Read/write/delete all data
- Access to all user records
- Can modify database schema

**Remediation**:
1. **IMMEDIATE**: Rotate service role key in Supabase dashboard
2. Update environment variable `SUPABASE_SERVICE_ROLE_KEY`
3. Audit database access logs for unauthorized activity
4. Remove from deploy-railway.ps1
5. Review and strengthen RLS policies
6. Add to .gitignore

---

## 📋 ROTATION CHECKLIST

### Phase 1: Immediate Revocation (Within 1 hour)
- [ ] Revoke Sentry organization token
- [ ] Roll Stripe webhook signing secret
- [ ] Roll Stripe test API key
- [ ] **CRITICAL**: Rotate Supabase service key

### Phase 2: Update Deployments (Within 2 hours)
- [ ] Update Vercel environment variables
- [ ] Update Railway environment variables (if applicable)
- [ ] Update local .env files
- [ ] Update CI/CD secrets

### Phase 3: Code Cleanup (Within 4 hours)
- [ ] Remove secrets from quick-stripe-setup.ps1
- [ ] Remove secrets from deploy-railway.ps1
- [ ] Add these files to .gitignore or use .env.example templates
- [ ] Commit changes

### Phase 4: Git History Cleanup (Within 24 hours)
- [ ] Use git-filter-repo to remove secrets from history
- [ ] Force push cleaned history (coordinate with team)
- [ ] Close secret scanning alerts as resolved

### Phase 5: Prevention (Within 1 week)
- [ ] Implement pre-commit hooks for secret detection
- [ ] Add git-secrets or similar tool
- [ ] Document secret management best practices
- [ ] Train team on secure credential handling
- [ ] Set up secret rotation schedule

---

## 🔧 ROTATION COMMANDS

### Sentry
```bash
# Navigate to: https://sentry.io/settings/mnnr/auth-tokens/
# 1. Find the exposed token
# 2. Click "Revoke"
# 3. Create new token with same permissions
# 4. Update environment variable
```

### Stripe
```bash
# Webhook Secret
# Navigate to: https://dashboard.stripe.com/test/webhooks
# 1. Click on webhook endpoint
# 2. Click "Roll secret"
# 3. Update STRIPE_WEBHOOK_SECRET

# API Key
# Navigate to: https://dashboard.stripe.com/test/apikeys
# 1. Find the exposed key
# 2. Click "Roll key"
# 3. Update STRIPE_SECRET_KEY
```

### Supabase
```bash
# Navigate to: https://supabase.com/dashboard/project/waykhwdysouihtgqwged/settings/api
# 1. Go to API Settings
# 2. Click "Reset service_role key"
# 3. Confirm reset
# 4. Copy new key
# 5. Update SUPABASE_SERVICE_ROLE_KEY immediately
```

---

## 🛡️ FILES TO UPDATE

### Environment Files
- `.env.local`
- `.env.production`
- Vercel environment variables
- Railway environment variables (if used)

### Scripts to Clean
- `quick-stripe-setup.ps1` - Remove hardcoded secrets
- `deploy-railway.ps1` - Remove hardcoded secrets
- Any other PowerShell/bash scripts with credentials

### Git History
```bash
# Use git-filter-repo to remove secrets
git filter-repo --path quick-stripe-setup.ps1 --invert-paths
git filter-repo --path deploy-railway.ps1 --invert-paths

# Or use BFG Repo-Cleaner
bfg --replace-text secrets.txt
```

---

## 📊 RISK ASSESSMENT

| Secret | Severity | Exposure Time | Risk Level |
|--------|----------|---------------|------------|
| Supabase Service Key | CRITICAL | ~80 days | 🔴 CRITICAL |
| Stripe Webhook Secret | HIGH | ~80 days | 🔴 HIGH |
| Stripe Test API Key | MODERATE | ~80 days | 🟡 MODERATE |
| Sentry Org Token | HIGH | 12 minutes | 🟡 HIGH |

**Overall Risk**: 🔴 **CRITICAL**

---

## 🎯 SUCCESS CRITERIA

- ✅ All 4 secrets rotated within 2 hours
- ✅ All deployments updated with new secrets
- ✅ All secret scanning alerts closed
- ✅ No hardcoded secrets in codebase
- ✅ Pre-commit hooks installed
- ✅ Security score improved to 10/10

---

## 📝 NOTES

1. **Supabase is the highest priority** - service key gives full database access
2. Stripe keys are test mode only, but should still be rotated
3. Sentry token is recent (12 minutes), minimize exposure window
4. All secrets have been public for ~80 days (except Sentry)
5. **Audit logs should be reviewed** for any unauthorized access

---

*This document contains sensitive information about security vulnerabilities. Handle with care.*
