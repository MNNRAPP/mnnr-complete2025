# MNNR Deployment Instructions

## Quick Deploy Commands

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Or with environment variables
vercel --prod \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e STRIPE_SECRET_KEY=sk_live_xxx \
  -e STRIPE_WEBHOOK_SECRET=whsec_xxx \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Docker
```bash
# Build
docker build -t mnnr .

# Run
docker run -p 3000:3000 mnnr
```

## Environment Variables Required

### Required for Production
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# App
NEXT_PUBLIC_SITE_URL=https://mnnr.app
```

### Optional
```bash
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx

# AI (for ranking checker)
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
```

## Post-Deployment Checklist

### Immediate (Day 1)
- [ ] Verify site loads at https://mnnr.app
- [ ] Check all pages render correctly
- [ ] Test authentication flow
- [ ] Verify Stripe checkout works
- [ ] Check API endpoints respond

### SEO Setup (Day 1-2)
- [ ] Submit sitemap to Google Search Console
- [ ] Submit site to Bing Webmaster Tools
- [ ] Verify robots.txt is accessible
- [ ] Test llms.txt loads correctly
- [ ] Verify ai-plugin.json loads
- [ ] Test OpenAPI spec loads

### AI Discoverability (Day 2-7)
- [ ] Test queries on Perplexity AI
- [ ] Test queries on ChatGPT (web browsing)
- [ ] Test queries on Claude
- [ ] Monitor for crawl activity
- [ ] Check Google Search Console coverage

### Monitoring Setup (Day 1)
- [ ] Configure Sentry alerts
- [ ] Set up uptime monitoring
- [ ] Configure PostHog events
- [ ] Set up Slack alerts

## Verification Commands

```bash
# Check site is live
curl -I https://mnnr.app

# Check robots.txt
curl https://mnnr.app/robots.txt

# Check sitemap
curl https://mnnr.app/sitemap.xml

# Check llms.txt
curl https://mnnr.app/llms.txt

# Check AI plugin
curl https://mnnr.app/.well-known/ai-plugin.json

# Check OpenAPI spec
curl https://mnnr.app/openapi.yaml

# Check API health
curl https://mnnr.app/api/health

# Check structured data
# Go to: https://search.google.com/test/rich-results
# Enter: https://mnnr.app
```

## DNS Configuration

### Cloudflare (Recommended)
```
Type    Name    Content             TTL
A       @       76.76.21.21        Auto
CNAME   www     mnnr.app           Auto
```

### Vercel DNS
```
Type    Name    Content
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

## SSL/TLS Configuration

Vercel automatically provides SSL certificates.

For custom domains:
1. Add domain in Vercel dashboard
2. Update DNS records
3. Wait for SSL certificate issuance (usually < 30 min)

## CDN & Caching

### Cloudflare Settings
- SSL: Full (strict)
- Always Use HTTPS: On
- Auto Minify: HTML, CSS, JS
- Brotli: On
- Cache Level: Standard
- Browser Cache TTL: 4 hours

### Page Rules
```
*mnnr.app/api/*
  - Cache Level: Bypass

*mnnr.app/dashboard/*
  - Cache Level: Bypass

*mnnr.app/*
  - Cache Level: Cache Everything
  - Edge Cache TTL: 2 hours
```

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback

# Or promote specific deployment
vercel promote [deployment-url]
```

### Railway
```bash
# List deployments
railway deployments

# Rollback
railway rollback
```

## Health Checks

### Endpoints to Monitor
- `https://mnnr.app` - Homepage
- `https://mnnr.app/api/health` - API health
- `https://mnnr.app/pricing` - Key page
- `https://mnnr.app/docs` - Documentation

### Expected Response Times
- Homepage: < 500ms
- API health: < 100ms
- Static pages: < 300ms

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

### Environment Variables Not Loading
- Check Vercel/Railway dashboard
- Verify variable names match exactly
- Redeploy after adding variables

### Database Connection Issues
- Verify Supabase URL and keys
- Check network/firewall rules
- Verify RLS policies

### Stripe Webhooks Not Working
- Verify webhook secret
- Check endpoint URL is correct
- Ensure HTTPS is working
- Check Stripe dashboard for errors
