# Production Deployment Guide

This guide will walk you through deploying this application to production with all enterprise security measures enabled.

## Pre-Deployment Checklist

### 1. Environment Setup ✅

Copy the production environment template:
```bash
cp .env.production.example .env.production
```

Fill in all required values:
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - From Supabase project settings
- ✅ `STRIPE_SECRET_KEY` - From Stripe dashboard (use `sk_live_` key)
- ✅ `STRIPE_WEBHOOK_SECRET` - From Stripe webhook configuration
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase project settings
- ✅ `NEXT_PUBLIC_SITE_URL` - Your production domain (e.g., https://yourdomain.com)

**CRITICAL:** Verify NO server-side secrets have `NEXT_PUBLIC_` prefix!

### 2. Security Validation ✅

Run the built-in environment validator:
```bash
npm run build
```

The app will fail to build if:
- Required environment variables are missing
- Secrets are accidentally exposed with `NEXT_PUBLIC_` prefix
- Environment configuration is invalid

### 3. Dependencies Audit ✅

Check for security vulnerabilities:
```bash
npm audit
npm audit fix
```

Update outdated packages:
```bash
npm outdated
npm update
```

### 4. Database Setup ✅

**Supabase Configuration:**

1. **Enable Row Level Security (RLS)** on all tables:
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
   ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
   ```

2. **Create RLS Policies** (example for users table):
   ```sql
   -- Users can read their own data
   CREATE POLICY "Users can view own data"
   ON users FOR SELECT
   USING (auth.uid() = id);

   -- Users can update their own data
   CREATE POLICY "Users can update own data"
   ON users FOR UPDATE
   USING (auth.uid() = id);
   ```

3. **Add database indexes** for performance:
   ```sql
   CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
   CREATE INDEX idx_subscriptions_status ON subscriptions(status);
   CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);
   CREATE INDEX idx_prices_product_id ON prices(product_id);
   ```

### 5. Stripe Setup ✅

1. **Create webhook endpoint** in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhooks`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.completed`
     - `product.created`
     - `product.updated`
     - `product.deleted`
     - `price.created`
     - `price.updated`
     - `price.deleted`

2. **Copy webhook signing secret** to `STRIPE_WEBHOOK_SECRET`

3. **Test webhook** with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks
   stripe trigger customer.subscription.created
   ```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production`
   - Ensure server-side secrets are NOT exposed

4. **Configure domains:**
   - Add your custom domain in Vercel dashboard
   - Update `NEXT_PUBLIC_SITE_URL` to match
   - Update `next.config.js` allowed origins

5. **Enable Vercel features:**
   - ✅ Analytics (for performance monitoring)
   - ✅ Web Analytics (for user behavior)
   - ✅ Speed Insights (for Core Web Vitals)

### Option 2: Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN npm install -g pnpm && pnpm install --frozen-lockfile

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production

   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static

   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Build and run:**
   ```bash
   docker build -t your-app .
   docker run -p 3000:3000 --env-file .env.production your-app
   ```

### Option 3: Self-Hosted (VPS/AWS/GCP)

1. **Install Node.js 18+:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and build:**
   ```bash
   git clone your-repo.git
   cd your-app
   npm install
   npm run build
   ```

3. **Set up process manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "your-app" -- start
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

5. **Enable SSL with Let's Encrypt:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Post-Deployment Configuration

### 1. Rate Limiting (CRITICAL) ⚠️

The current implementation uses in-memory rate limiting, which doesn't work in distributed environments.

**For Vercel:**
Use Vercel's built-in rate limiting or Upstash Redis:

```typescript
// Install: npm install @upstash/ratelimit @upstash/redis

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// Use in API routes
const { success } = await ratelimit.limit(identifier);
if (!success) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

**For self-hosted:**
Set up Redis and update `utils/rate-limit.ts`.

### 2. Error Monitoring

**Install Sentry:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configure in `utils/logger.ts`:**
```typescript
import * as Sentry from '@sentry/nextjs';

export const logger = {
  error(message: string, error?: Error, metadata?: LogMetadata) {
    // Send to Sentry
    Sentry.captureException(error, {
      tags: { message },
      extra: metadata
    });

    // ... existing logging
  }
};
```

### 3. Log Aggregation

**Options:**
- **Vercel:** Built-in log streaming
- **Self-hosted:** Use Logtail, Better Stack, or CloudWatch

**Configure structured logging:**
```typescript
// In production, send logs to service
if (process.env.NODE_ENV === 'production') {
  fetch(process.env.LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData)
  });
}
```

### 4. Performance Monitoring

**Add Vercel Analytics:**
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 5. Database Connection Pooling

**Supabase Pooler:**
Enable connection pooling in Supabase Dashboard → Settings → Database.

Update connection string to use pooler:
```
postgresql://postgres:[PASSWORD]@[PROJECT].pooler.supabase.com:6543/postgres
```

### 6. CDN Configuration

**For Vercel:**
Automatic Edge caching enabled.

**For self-hosted:**
Configure CloudFlare or AWS CloudFront:
- Cache static assets (JS, CSS, images)
- Set proper cache headers
- Enable gzip/brotli compression

## Security Hardening

### 1. Content Security Policy

Update CSP in `next.config.js` for your domains:
```javascript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
`;
```

### 2. API Route Protection

Ensure all API routes have:
- ✅ Rate limiting
- ✅ Authentication checks
- ✅ Input validation
- ✅ Error handling

### 3. Secrets Rotation

Set up regular rotation schedule:
- Stripe API keys: Every 90 days
- Supabase service role key: Every 90 days
- Webhook secrets: After any security incident

### 4. Monitoring & Alerts

Set up alerts for:
- Multiple failed auth attempts
- Rate limit violations
- Webhook signature failures
- Database query errors
- Environment variable access errors

## Testing in Production

### 1. Smoke Tests

After deployment, test:
- ✅ Homepage loads
- ✅ User signup flow
- ✅ User login flow
- ✅ Subscription checkout
- ✅ Webhook processing (use Stripe CLI)
- ✅ Account management
- ✅ Error pages (404, 500)

### 2. Security Tests

Verify:
- ✅ HTTPS enabled
- ✅ Security headers present (check with securityheaders.com)
- ✅ Rate limiting works
- ✅ Environment variables not exposed in client bundle
- ✅ CSP violations logged (check browser console)

### 3. Performance Tests

Check:
- ✅ Core Web Vitals scores
- ✅ Lighthouse score > 90
- ✅ API response times < 200ms
- ✅ Database query performance

## Rollback Plan

If issues occur:

1. **Vercel:**
   ```bash
   vercel rollback
   ```

2. **Docker:**
   ```bash
   docker stop your-app
   docker run previous-version
   ```

3. **PM2:**
   ```bash
   pm2 stop your-app
   git checkout previous-commit
   npm install
   npm run build
   pm2 restart your-app
   ```

## Maintenance

### Daily
- Monitor error rates in Sentry
- Check rate limit violations
- Review webhook delivery status in Stripe

### Weekly
- Review application logs
- Check database performance metrics
- Monitor API response times

### Monthly
- Run `npm audit` and update dependencies
- Review and rotate API keys if needed
- Check for Supabase updates
- Review CSP violations

### Quarterly
- Full security audit
- Performance optimization review
- Update documentation
- Disaster recovery drill

## Support & Troubleshooting

### Common Issues

**Environment variables not working:**
```bash
# Verify they're set
vercel env pull .env.production
cat .env.production

# Redeploy
vercel --prod
```

**Webhook failing:**
```bash
# Test locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks
stripe trigger customer.subscription.created

# Check Stripe Dashboard → Developers → Webhooks for delivery logs
```

**Rate limiting too strict:**
Adjust in `utils/rate-limit.ts`:
```typescript
export const rateLimitConfigs = {
  api: {
    interval: 60 * 1000,
    maxRequests: 100 // Increase this
  }
};
```

**Database connection errors:**
Enable Supabase connection pooling and check connection limits.

## Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [OWASP Security Guide](https://owasp.org/www-project-top-ten/)

## Emergency Contacts

- **Security Issues:** security@yourdomain.com
- **Infrastructure:** ops@yourdomain.com
- **On-call:** +1-xxx-xxx-xxxx

---

**Last Updated:** 2025-10-04
**Deployment Status:** Ready for Production
**Next Review:** After first deployment
