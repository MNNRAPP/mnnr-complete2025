# 🚀 Deployment Guide for mnnr.app

Quick reference for deploying your application to production.

---

## Quick Deploy (Automated)

### Windows (PowerShell)
```powershell
.\scripts\deploy.ps1
```

### Mac/Linux (Bash)
```bash
bash scripts/deploy.sh
```

The script will:
1. ✅ Check for git changes
2. ✅ Prompt for commit message
3. ✅ Commit and push to GitHub
4. ✅ Run pre-deployment checks
5. ✅ Deploy to Vercel (production or preview)
6. ✅ Show post-deployment checklist

---

## Manual Deploy

### 1. Commit Changes
```bash
git add .
git commit -m "your commit message"
git push origin main
```

### 2. Deploy to Vercel

**Production:**
```bash
vercel --prod
```

**Preview:**
```bash
vercel
```

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied (if any)
- [ ] Security CI passing on GitHub

---

## Environment Variables

Ensure these are set in Vercel Dashboard → Project Settings → Environment Variables:

### Required (Server-Side Only)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Required (Public - OK for Client)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SITE_URL=https://mnnr.app
```

### Optional
```
MAINTENANCE_MODE=false
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

See [.env.example](.env.example) for complete list.

---

## Post-Deployment Verification

After deploying to production:

### 1. Health Checks
- [ ] Site loads: https://mnnr.app
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Webhooks functioning (check Stripe dashboard)

### 2. Security Checks
```bash
# Check security headers
curl -I https://mnnr.app | grep -E "(Strict-Transport|Content-Security|X-Frame)"

# Test rate limiting (should get 429 after 5 requests)
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" https://mnnr.app/api/test; done
```

### 3. Monitor Logs
- Vercel Dashboard → Logs
- Supabase Dashboard → Logs
- Stripe Dashboard → Events
- Sentry (if configured)

---

## Database Migrations

If you have new migrations in `supabase/migrations/`:

### Local Development
```bash
npm run supabase:reset  # Resets local DB with migrations
```

### Production (Supabase Dashboard)
1. Go to SQL Editor in Supabase Dashboard
2. Run migration SQL manually
3. Or use: `npx supabase db push` (if linked)

**New Migrations This Release:**
- `20251006000001_stripe_events.sql` - Webhook idempotency
- `20251006000002_rls_hardening.sql` - Enhanced RLS policies
- `20251006000003_audit_trail.sql` - Security audit logging

---

## Troubleshooting

### Deployment Fails - Team Access Error
```
Error: Git author must have access to the team
```

**Fix:**
```bash
# Option 1: Update git config
git config user.email "your-verified-email@domain.com"
git commit --amend --reset-author --no-edit
git push --force-with-lease

# Option 2: Login with correct account
vercel logout
vercel login
vercel --prod
```

### Build Fails
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for ESLint errors
npm run lint
```

### Environment Variables Missing
```bash
# List current Vercel env vars
vercel env ls

# Add missing variable
vercel env add VARIABLE_NAME
```

### Webhook Not Working
1. Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe Dashboard
2. Check webhook endpoint URL in Stripe: `https://mnnr.app/api/webhooks`
3. Review Vercel function logs for errors
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks`

---

## Rollback Procedure

If deployment causes issues:

### 1. Quick Rollback (Vercel Dashboard)
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### 2. Git Rollback
```bash
# View recent commits
git log --oneline -10

# Revert to previous commit
git revert HEAD
git push origin main

# Or hard reset (destructive!)
git reset --hard <commit-hash>
git push --force origin main
```

### 3. Emergency: Enable Maintenance Mode
```bash
vercel env add MAINTENANCE_MODE true --scope production
```

This will return 503 to all requests while you fix issues.

To disable:
```bash
vercel env add MAINTENANCE_MODE false --scope production
```

---

## Deployment Checklist Template

Copy this for each production deployment:

```markdown
## Deployment - [DATE]

### Pre-Deployment
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Security CI passing
- [ ] Team notified
- [ ] Maintenance window scheduled (if needed)

### Deployment
- [ ] Code committed and pushed
- [ ] Database migrations applied
- [ ] Environment variables verified
- [ ] Deployed to Vercel production

### Post-Deployment
- [ ] Health checks pass
- [ ] Authentication works
- [ ] Webhooks functioning
- [ ] Security headers present
- [ ] Monitoring active
- [ ] Error rates normal

### Notes
[Any special considerations or issues]
```

---

## Resources

- **Deployment Scripts:** `scripts/deploy.ps1` (Windows), `scripts/deploy.sh` (Unix)
- **Security Docs:** `docs/SECURITY_HARDENING_PLAN.md`
- **Environment Variables:** `.env.example`
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repository:** https://github.com/MNNRAPP/mnnr-complete2025

---

## Support

**Issues?**
- Check Vercel logs
- Review GitHub Actions
- Contact: devops@mnnr.app

**Last Updated:** 2025-10-06
