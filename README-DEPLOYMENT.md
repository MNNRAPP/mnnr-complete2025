# 🚀 Quick Deployment Guide - docs.mnnr.app

## ✅ What I Fixed

1. **PostHog Analytics** - Added graceful fallback when key not configured
2. **Supabase Connection** - Added 2-second timeout to prevent hanging
3. **Environment Variables** - Created complete `.env.production` template
4. **Next.js Config** - Fixed `compiler.removeConsole` for dev mode compatibility

## 🎯 Deploy in 3 Steps

### Step 1: Configure DNS (5 minutes)

Add this CNAME record at your domain registrar:

```
Type:  CNAME
Name:  docs
Value: cname.vercel-dns.com
TTL:   3600
```

**Where?** Your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)

### Step 2: Set Production Environment Variables

**Your Supabase URL:** `https://waykhwdysouihtgqwged.supabase.co`

Get your **production keys** from Supabase dashboard:
1. Go to: https://waykhwdysouihtgqwged.supabase.co
2. Settings → API
3. Copy **anon public** key
4. Copy **service_role** key (keep secret!)

Add to `.env.production`:

```env
NEXT_PUBLIC_SITE_URL=https://docs.mnnr.app
NEXT_PUBLIC_SUPABASE_URL=https://waykhwdysouihtgqwged.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (your service role key)
```

### Step 3: Deploy

```powershell
# Verify everything is ready
npm run verify

# Deploy to Vercel
npm run deploy:docs
```

## 📋 Complete Deployment Commands

```powershell
# 1. Check local development
npm run dev
# Visit: http://localhost:3000/docs

# 2. Verify configuration
npm run verify

# 3. Build for production
npm run build

# 4. Deploy (automated)
npm run deploy:docs

# Or deploy manually
npm run deploy
```

## 🔑 Required Environment Variables

### Get Supabase Keys

1. Visit: https://app.supabase.com/project/waykhwdysouihtgqwged/settings/api
2. Copy these keys:
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Get Stripe Keys (Production)

1. Visit: https://dashboard.stripe.com/apikeys
2. Toggle to **LIVE mode** (top right)
3. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Get Webhook Secret

1. Visit: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://docs.mnnr.app/api/webhooks`
3. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Get PostHog Key (Optional)

1. Sign up: https://posthog.com
2. Create project
3. Copy **Project API Key** → `NEXT_PUBLIC_POSTHOG_KEY`

## 🧪 Testing After Deployment

```powershell
# Wait 5 minutes after DNS configuration, then:

# Test health endpoint
curl https://docs.mnnr.app/api/health

# Should return:
# {
#   "status": "ok",
#   "environment": "production"
# }

# Test docs page
start https://docs.mnnr.app/docs
```

## ⚡ Current Status

### ✅ Working Locally
- Health endpoint: http://localhost:3000/api/health ✓
- Docs page: http://localhost:3000/docs ✓

### 🔧 Need to Configure for Production
- [ ] DNS CNAME record
- [ ] Supabase production keys in `.env.production`
- [ ] Stripe production keys
- [ ] Deploy to Vercel

## 📚 Detailed Guides

- **Full Deployment:** [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- **DNS Setup:** [DNS-SETUP.md](./DNS-SETUP.md)
- **Scripts:**
  - [deploy-docs.ps1](./scripts/deploy-docs.ps1) - Automated deployment
  - [verify-deployment.ps1](./scripts/verify-deployment.ps1) - Health checks

## 🆘 Quick Troubleshooting

### DNS not working?
```powershell
# Clear cache
ipconfig /flushdns

# Check propagation
nslookup docs.mnnr.app
```

### Build failing?
```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force .next
npm run build
```

### Environment variables not loading?
```powershell
# Verify file exists
Get-Content .env.production

# Check Vercel dashboard
# Project → Settings → Environment Variables
```

## 🎉 What's Included

### Deployment Scripts
- ✅ **deploy-docs.ps1** - Automated deployment to Vercel
- ✅ **verify-deployment.ps1** - Test all endpoints and DNS
- ✅ **deploy-docs.sh** - Bash version for Unix systems

### Documentation
- ✅ **DEPLOYMENT-GUIDE.md** - Complete deployment instructions
- ✅ **DNS-SETUP.md** - Provider-specific DNS guides
- ✅ **README-DEPLOYMENT.md** - Quick start (this file)

### NPM Scripts
```json
{
  "deploy": "vercel --prod",
  "deploy:docs": "Full automated deployment",
  "verify": "Test everything"
}
```

---

**Your Supabase Project**: `waykhwdysouihtgqwged`
**Your Production URL**: `https://docs.mnnr.app` (once DNS configured)
**Local Dev**: `http://localhost:3000` ✓ Working

Need help? Check the detailed guides above or run `npm run verify`
