# 🚀 MNNR Documentation Deployment Guide

Complete guide to deploy docs.mnnr.app to production.

## 📋 Prerequisites

- [x] Node.js 20+ installed
- [x] Vercel account (https://vercel.com)
- [x] Access to mnnr.app domain registrar
- [x] Production environment variables configured

## 🎯 Quick Start

### Option 1: Automated Deployment (Recommended)

```powershell
# 1. Verify local setup
npm run verify

# 2. Deploy to production
npm run deploy:docs
```

### Option 2: Manual Deployment

```powershell
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Build and deploy
npm run build
vercel --prod
```

## 🔧 Environment Configuration

### 1. Create Production Environment File

Copy `.env.local.example` to `.env.production`:

```powershell
Copy-Item .env.local.example .env.production
```

### 2. Configure Production Variables

Edit `.env.production` with your production credentials:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://docs.mnnr.app

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry (Optional but recommended)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Redis/Upstash (For rate limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### 3. Add Variables to Vercel

```powershell
# Via Vercel CLI
vercel env add NEXT_PUBLIC_SITE_URL production
# (repeat for each variable)

# Or via Dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Settings → Environment Variables
# 4. Add each variable for "Production" environment
```

## 🌐 DNS Configuration

### Step 1: Configure DNS Record

Add this CNAME record at your domain registrar:

```
Type:  CNAME
Name:  docs
Value: cname.vercel-dns.com
TTL:   3600
```

**Provider-specific instructions:** See [DNS-SETUP.md](./DNS-SETUP.md)

### Step 2: Add Domain to Vercel

```powershell
# Via CLI
vercel domains add docs.mnnr.app

# Or via Dashboard:
# Project → Settings → Domains → Add → docs.mnnr.app
```

### Step 3: Verify DNS

```powershell
# Check DNS propagation
nslookup docs.mnnr.app

# Should return Vercel's IP addresses
```

## 🧪 Testing & Verification

### Run Automated Tests

```powershell
npm run verify
```

This checks:
- ✅ Local development server
- ✅ DNS configuration
- ✅ Production deployment
- ✅ SSL certificate
- ✅ API endpoints
- ✅ Environment variables

### Manual Testing

```powershell
# Test health endpoint
curl https://docs.mnnr.app/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-10-06T...",
#   "environment": "production"
# }

# Open docs in browser
start https://docs.mnnr.app/docs
```

## 📊 Monitoring Setup

### 1. Sentry Error Tracking

```powershell
# Install Sentry CLI
npm install -g @sentry/cli

# Login
sentry-cli login

# Create project
sentry-cli projects create -t node -o your-org -n mnnr-docs
```

### 2. Vercel Analytics

Enable in Vercel dashboard:
1. Project → Analytics
2. Enable "Web Analytics"
3. Enable "Speed Insights"

### 3. PostHog Analytics

1. Sign up at https://posthog.com
2. Create new project
3. Copy project API key to `NEXT_PUBLIC_POSTHOG_KEY`

## 🔒 Security Checklist

- [ ] All environment variables use production credentials
- [ ] SSL certificate is valid (https)
- [ ] Security headers configured (check with securityheaders.com)
- [ ] Rate limiting enabled (Upstash Redis configured)
- [ ] Sentry error tracking active
- [ ] No secrets in code repository
- [ ] `.env.production` in `.gitignore`

## 🐛 Troubleshooting

### Build Fails

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install

# Try build again
npm run build
```

### DNS Not Resolving

```powershell
# Clear DNS cache
ipconfig /flushdns

# Check DNS propagation globally
# Visit: https://dnschecker.org
# Enter: docs.mnnr.app
```

### SSL Certificate Issues

- Wait 5-10 minutes after DNS configuration
- Verify domain is added in Vercel
- Check Vercel dashboard for certificate status
- Try removing and re-adding domain

### 404 Errors

1. Verify deployment succeeded in Vercel dashboard
2. Check domain is added and verified
3. Ensure production deployment (not preview)
4. Check `vercel.json` configuration

### Environment Variables Not Working

```powershell
# List all environment variables in Vercel
vercel env ls

# Pull environment variables locally
vercel env pull .env.production

# Verify variables are set correctly
vercel env ls production
```

## 📝 Deployment Checklist

Before deploying to production:

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passes: `npm run lint`
- [ ] Code formatted: `npm run prettier-fix`
- [ ] Build succeeds locally: `npm run build`

### Configuration
- [ ] `.env.production` configured
- [ ] All required env vars in Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` set to `https://docs.mnnr.app`
- [ ] Stripe webhook endpoint updated

### DNS & Domain
- [ ] CNAME record added: `docs → cname.vercel-dns.com`
- [ ] Domain added in Vercel
- [ ] DNS propagated (verify with `nslookup`)
- [ ] SSL certificate issued

### Testing
- [ ] Local dev works: `npm run dev`
- [ ] Production build works: `npm run build && npm start`
- [ ] Health endpoint returns 200
- [ ] All docs pages load correctly
- [ ] No console errors in browser

### Monitoring
- [ ] Sentry configured and receiving events
- [ ] Vercel analytics enabled
- [ ] PostHog tracking active
- [ ] Error alerts configured

## 🎉 Post-Deployment

### 1. Verify Deployment

```powershell
npm run verify
```

### 2. Monitor Logs

```powershell
# View Vercel logs
vercel logs

# View Sentry errors
# Visit: https://sentry.io
```

### 3. Performance Testing

- Lighthouse: https://pagespeed.web.dev
- Security Headers: https://securityheaders.com
- SSL Test: https://www.ssllabs.com/ssltest

### 4. Set Up Alerts

Configure alerts for:
- Error rate spikes (Sentry)
- Performance degradation (Vercel)
- SSL expiration (usually auto-renewed)

## 📚 Additional Resources

- [DNS Configuration Guide](./DNS-SETUP.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production](https://supabase.com/docs/guides/platform/going-into-prod)

## 🆘 Support

If you encounter issues:

1. **Run diagnostic**: `npm run verify`
2. **Check logs**: `vercel logs --follow`
3. **Review docs**: [DNS-SETUP.md](./DNS-SETUP.md)
4. **Vercel Support**: https://vercel.com/help
5. **GitHub Issues**: (your repo URL)

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to main:

```powershell
git add .
git commit -m "Update documentation"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Runs tests
# 4. Deploys to production
```

### Preview Deployments

Every pull request gets a preview URL:

```powershell
git checkout -b feature/new-docs
# Make changes
git push origin feature/new-docs

# Create PR on GitHub
# Vercel comment with preview URL appears
```

## 📈 Performance Optimization

### Enable Turbopack (Already configured)

```json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/hero.png"
  width={800}
  height={600}
  alt="Hero"
/>
```

### Font Optimization

Already configured in layout:

```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

---

**Last Updated**: 2025-10-06
**Version**: 1.0.0
