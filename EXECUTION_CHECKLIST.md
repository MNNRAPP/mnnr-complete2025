# MNNR EXECUTION CHECKLIST
## From Vaporware to Working Product in 7 Days

**Current Reality:** Score 6.5/10 (C+) - Great landing page, no working product
**Target:** Score 8.5/10 (B+) - MVP with real users
**Timeline:** 7 days of focused execution

---

## IMMEDIATE PRIORITY: Fix the Vaporware Problem

### Current Blockers
- [ ] **Supabase bill outstanding** - Auth doesn't work
- [ ] **No database** - Can't store anything
- [ ] **False claims** - "10M+ API calls", "50+ teams"
- [ ] **SDK doesn't exist** - npm install @mnnr/sdk fails

---

## DAY 1 (TODAY): Database & Basic Auth

### Morning: Setup Neon Database (FREE)
- [ ] Go to https://neon.tech
- [ ] Create account with GitHub OAuth
- [ ] Create project: `mnnr-production`
- [ ] Copy DATABASE_URL to Vercel env vars
- [ ] Run: `./setup-mnnr.sh`

### Afternoon: Implement NextAuth (Replace Supabase Auth)
- [ ] Install: `npm install next-auth @auth/core`
- [ ] Create `/app/api/auth/[...nextauth]/route.ts`
- [ ] Configure GitHub OAuth provider
- [ ] Update sign-in page to use NextAuth
- [ ] Test: Create account, sign in, sign out

### Evening: Verify Working Auth
- [ ] Production deploy: `git push origin main`
- [ ] Test on https://mnnr.app
- [ ] Verify: Can create account
- [ ] Verify: Can sign in
- [ ] Verify: Can access dashboard

**Day 1 Success Criteria:** User can sign up and see empty dashboard

---

## DAY 2: Working Dashboard

### Morning: Database Schema
```sql
-- Run in Neon SQL Editor
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id),
  model TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### Afternoon: Dashboard UI
- [ ] Display user's API keys (empty state first)
- [ ] "Create API Key" button
- [ ] Show key ONCE on creation
- [ ] Copy-to-clipboard functionality
- [ ] Delete/revoke API key

### Evening: API Key Generation
- [ ] `POST /api/keys` - Create key
- [ ] `GET /api/keys` - List keys
- [ ] `DELETE /api/keys/:id` - Revoke key
- [ ] Test with curl

**Day 2 Success Criteria:** User can create and manage API keys

---

## DAY 3: Usage Tracking API

### Morning: Track Endpoint
```typescript
// POST /api/v1/track
{
  "model": "gpt-4",
  "tokens": 1500,
  "userId": "optional"
}
```

### Afternoon: Validation & Rate Limiting
- [ ] Validate API key
- [ ] Check rate limits
- [ ] Store usage event
- [ ] Return success response

### Evening: Usage Dashboard
- [ ] Show total tokens used
- [ ] Show requests today
- [ ] Basic chart (last 7 days)
- [ ] Current billing period

**Day 3 Success Criteria:** Can track usage via API and see it in dashboard

---

## DAY 4: Remove False Claims & Fix Landing Page

### Morning: Audit Landing Page
- [ ] Remove "10M+ API Calls/Day" (unverified)
- [ ] Remove "50+ Teams" (false)
- [ ] Remove "127 reviews" aggregateRating (fake)
- [ ] Change to honest metrics:
  - "Public Beta"
  - "Early Access"
  - "Join the waitlist"

### Afternoon: Update Marketing Copy
```
BEFORE: "10M+ API Calls/Day"
AFTER: "Built for Scale" or remove entirely

BEFORE: "50+ Teams in Beta"
AFTER: "Join Early Access" or actual number

BEFORE: "4.9 stars (127 reviews)"
AFTER: Remove or "New - Be First to Review"
```

### Evening: Update Schema.org Data
- [ ] Remove fake aggregateRating
- [ ] Update offers to reflect actual pricing
- [ ] Ensure all claims are verifiable

**Day 4 Success Criteria:** No false claims on landing page

---

## DAY 5: Real Documentation

### Morning: Quick Start Guide
```markdown
# Quick Start

## 1. Get Your API Key
Sign up at mnnr.app → Dashboard → Create API Key

## 2. Install SDK
npm install @mnnr/sdk  # Coming soon
OR
Use direct API calls

## 3. Track Usage
curl -X POST https://api.mnnr.app/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"gpt-4","tokens":1500}'
```

### Afternoon: API Reference
- [ ] `POST /api/v1/track` - Track usage
- [ ] `GET /api/v1/usage` - Get usage stats
- [ ] `GET /api/v1/keys` - List API keys
- [ ] Response formats
- [ ] Error codes

### Evening: Deploy Docs
- [ ] Update `/docs/quick-start` page
- [ ] Add code examples
- [ ] Test all examples work

**Day 5 Success Criteria:** Someone can integrate MNNR using docs

---

## DAY 6: Stripe Integration

### Morning: Pricing Page
- [ ] Verify Stripe products exist
- [ ] Connect "Subscribe" buttons
- [ ] Test checkout flow

### Afternoon: Webhook Handling
- [ ] `checkout.session.completed`
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.deleted`

### Evening: Subscription Display
- [ ] Show current plan in dashboard
- [ ] Show billing period
- [ ] "Manage Subscription" → Stripe portal

**Day 6 Success Criteria:** User can subscribe and see their plan

---

## DAY 7: Launch Prep & First Users

### Morning: End-to-End Test
- [ ] Fresh signup flow
- [ ] Create API key
- [ ] Track usage via API
- [ ] View dashboard
- [ ] Subscribe to paid plan

### Afternoon: Get First Users
- [ ] Post on Twitter/X
- [ ] Post on LinkedIn
- [ ] Submit to HackerNews
- [ ] Email 5 developer friends

### Evening: Monitor & Respond
- [ ] Watch for errors in Vercel
- [ ] Respond to any signups
- [ ] Fix any critical bugs

**Day 7 Success Criteria:** 3+ real signups

---

## Post-Week Tasks

### Week 2: SDK & Integrations
- [ ] Publish `@mnnr/sdk` to npm
- [ ] Python SDK: `pip install mnnr`
- [ ] OpenAI integration example
- [ ] Anthropic integration example

### Week 3: Analytics & Growth
- [ ] Advanced usage charts
- [ ] Team features
- [ ] Invoice generation
- [ ] Referral program

### Week 4: Enterprise Features
- [ ] SSO integration
- [ ] Custom billing
- [ ] SLA dashboard
- [ ] Audit logs

---

## Quick Reference Commands

```bash
# Local Development
npm run dev

# Run Tests
npm test

# Build Check
npm run build

# Deploy (auto via GitHub)
git add . && git commit -m "feat: description" && git push

# Database (Neon)
# Go to console.neon.tech → SQL Editor

# Vercel
vercel --prod
```

---

## Environment Variables Needed

### Neon (Database)
```
DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```

### NextAuth (Auth)
```
NEXTAUTH_URL=https://mnnr.app
NEXTAUTH_SECRET=generate-with-openssl
GITHUB_ID=your-github-oauth-id
GITHUB_SECRET=your-github-oauth-secret
```

### Stripe (Payments)
```
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Success Metrics

### Day 7 Targets
- [ ] 3+ real signups
- [ ] 1+ API key created
- [ ] 0 false claims
- [ ] Working auth flow
- [ ] Working dashboard

### Month 1 Targets
- [ ] 50 signups
- [ ] 10 active API keys
- [ ] 1 paying customer
- [ ] SDK published
- [ ] 5-star review request sent

### Month 3 Targets
- [ ] 500 signups
- [ ] 50 active API keys
- [ ] $500 MRR
- [ ] Integration with 3 AI providers
- [ ] Featured on Product Hunt

---

## Emergency Contacts

**Vercel Issues:**
- Rollback: Vercel Dashboard → Deployments → Redeploy Previous

**Database Issues:**
- Neon Console: https://console.neon.tech

**Payment Issues:**
- Stripe Dashboard: https://dashboard.stripe.com

---

## Final Checklist Before Announcing

- [ ] All pages load without errors
- [ ] Sign up works
- [ ] Dashboard shows correct data
- [ ] API key creation works
- [ ] Documentation is accurate
- [ ] No false claims anywhere
- [ ] Terms & Privacy links work
- [ ] Mobile responsive
- [ ] HTTPS working
- [ ] Favicon loads

---

**Remember:** Done > Perfect. Ship something real today.

**Current Status:** Run `./setup-mnnr.sh` to begin
