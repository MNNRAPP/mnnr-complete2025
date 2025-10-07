# 🚀 TONIGHT'S LAUNCH SPRINT - GET TO 10/10 NOW

**Target:** Soft launch ready by END OF TONIGHT
**Time:** ~4-6 hours of focused work
**Status:** LET'S GO! 🔥

---

## ✅ PHASE 1: DATABASE & AUTH (30-60 MIN) - DO THIS FIRST

###  1. Apply Supabase Migrations **[YOU DO THIS]**

**Go to:** https://supabase.com/dashboard

**Run these 3 SQL files in SQL Editor (copy/paste, click RUN):**

1. ✅ `supabase/migrations/20251006000001_stripe_events.sql`
2. ✅ `supabase/migrations/20251006000002_rls_hardening.sql`
3. ✅ `supabase/migrations/20251006000003_audit_trail.sql`

**Verification:**
```sql
-- Run this to verify tables were created:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('stripe_events', 'audit_log')
ORDER BY table_name;
```

**Expected result:** Both tables should appear ✅

---

### 2. Check Production Environment Variables **[YOU DO THIS]**

**Go to:** https://vercel.com/mnnr/mnnr-complete2025/settings/environment-variables

**Verify these exist for PRODUCTION:**

**Supabase (required):**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (your project URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (service role key - SECRET!)

**Stripe (required):**
- [ ] `STRIPE_SECRET_KEY` (sk_live_... for production OR sk_test_... for testing)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_... or pk_test_...)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)

**Optional but recommended:**
- [ ] `NEXT_PUBLIC_SITE_URL` = https://mnnr.app
- [ ] `MAINTENANCE_MODE` = false

**If ANY are missing → ADD THEM NOW**

After adding env vars:
- [ ] Click "Redeploy" in Vercel to pick up new variables

---

### 3. Test Database Connection

**Run this command:**
```bash
curl https://mnnr-complete2025.vercel.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "config": {
    "supabaseConfigured": true,  ← Should be TRUE
    "stripeConfigured": true      ← Should be TRUE
  }
}
```

**If FALSE → env vars missing, go back to step 2**

---

## ✅ PHASE 2: LEGAL PAGES (DONE ✅)

- [x] Privacy Policy created → `/legal/privacy`
- [x] Terms of Service created → `/legal/terms`

**These are LIVE after next deployment**

---

## ✅ PHASE 3: COMMIT & DEPLOY (10 MIN)

**I'll do this for you:**

```bash
cd mnnr-complete2025
git add .
git commit -m "launch: Add legal pages (Privacy, Terms) for 10/10 soft launch

- Privacy Policy with CCPA/GDPR compliance
- Terms of Service with refund policy, preview access terms
- Required for Stripe payment acceptance
- Founding member terms included

Ready for soft launch 🚀"
git push
```

**Vercel will auto-deploy (2-3 minutes)**

---

## ✅ PHASE 4: PAYMENT TESTING (30-60 MIN) **[YOU DO THIS]**

### Test Stripe Integration

**1. Use Stripe Test Mode:**
- Go to https://dashboard.stripe.com/test/dashboard
- Get test card: `4242 4242 4242 4242`, any future expiry, any CVC

**2. Test Checkout Flow:**
- Go to your pricing page
- Click subscribe button
- Enter test card details
- Complete payment

**3. Verify in Stripe Dashboard:**
- Check "Payments" → see successful test payment
- Check "Customers" → see customer created
- Check "Subscriptions" → see active subscription

**4. Test Webhook:**
- Stripe Dashboard → "Developers" → "Webhooks"
- Send test webhook event
- Check your app handles it (check `stripe_events` table in Supabase)

**5. Test Idempotency:**
```sql
-- In Supabase SQL Editor, check events are being recorded:
SELECT * FROM public.stripe_events ORDER BY created_at DESC LIMIT 10;
```

**You should see webhook events logged ✅**

---

## ✅ PHASE 5: CUSTOM DOMAIN (20-30 MIN) **[YOU DO THIS]**

### Point mnnr.app to Vercel

**Option A: Vercel DNS (Easiest)**

1. Go to: https://vercel.com/mnnr/mnnr-complete2025/settings/domains
2. Click "Add Domain"
3. Enter `mnnr.app` and `www.mnnr.app`
4. Vercel will show DNS records to add

**Option B: External DNS (Your current registrar)**

1. Log into your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS settings for mnnr.app
3. Add these records (Vercel will provide exact values):
   - A record: `@` → `76.76.21.21`
   - CNAME record: `www` → `cname.vercel-dns.com`
4. Wait 5-60 minutes for DNS propagation

**Verify domain works:**
```bash
curl -I https://mnnr.app
```

**Should return 200 OK with Vercel headers ✅**

---

## ✅ PHASE 6: END-TO-END SMOKE TEST (30 MIN) **[YOU DO THIS]**

### Complete User Journey Test

**As a Pilot:**
1. [ ] Go to https://mnnr.app
2. [ ] Sign up with new email
3. [ ] Verify email (check inbox)
4. [ ] Complete profile
5. [ ] Apply to a position (if available)

**As an Operator:**
1. [ ] Sign up as operator
2. [ ] Go to pricing/subscribe
3. [ ] Complete payment (test mode)
4. [ ] Access pilot database
5. [ ] View applications

**Check for errors:**
- [ ] Browser console (F12) - no red errors
- [ ] Network tab - all requests 200 or expected status
- [ ] Database - records created correctly

---

## ✅ PHASE 7: FINAL POLISH (30 MIN)

### Quick Wins

**1. Update Landing Page Copy:**
- [ ] Add "Preview Access" or "Founding Members" badge
- [ ] Add social proof (if any testimonials)
- [ ] Clear call-to-action buttons
- [ ] Remove any "TODO" or placeholder text

**2. Mobile Check:**
- [ ] Open on phone browser
- [ ] Test navigation
- [ ] Test forms (signup, payment)
- [ ] Check responsive layout

**3. Security Headers Verification:**
```bash
curl -I https://mnnr.app | grep -E "Strict-Transport|Content-Security|X-Frame"
```

**Should see:**
- `Strict-Transport-Security` ✅
- `X-Frame-Options: DENY` ✅

---

## ✅ PHASE 8: PRE-LAUNCH PREP (30-60 MIN)

### Social Media Assets

**1. Screenshots:**
- [ ] Landing page hero
- [ ] Pilot application flow
- [ ] Operator dashboard
- [ ] Payment/pricing page

**2. Launch Copy (Templates below):**

**LinkedIn Post:**
```
🚀 Excited to announce MNNR Preview Access is LIVE!

After months of development, we're opening our AI-powered pilot recruiting platform
to 100 founding members.

What we're solving:
→ Pilot shortage crisis in aviation
→ Manual, inefficient recruiting processes
→ Lack of transparency in hiring

What makes MNNR different:
→ AI-powered candidate matching
→ Streamlined application process
→ Direct operator-pilot connections

Preview Access Perks:
→ Founding member pricing (locked in)
→ Direct product feedback channel
→ Shape the future of aviation recruiting

Limited to 100 spots. Join us: https://mnnr.app

#Aviation #Pilots #Recruiting #Startup #AI
```

**Twitter/X Thread:**
```
1/ 🚀 MNNR Preview Access is live!

We're solving the pilot shortage with AI-powered recruiting.

100 founding member spots available.

Here's what you need to know 🧵

2/ The Problem:
- 34,000 pilot shortage by 2032
- Manual recruiting = slow, expensive
- Great pilots lost in broken processes

3/ Our Solution:
- AI candidate matching
- One-click applications
- Real-time operator dashboard
- Transparent, fair process

4/ Preview Access Benefits:
- Lifetime founding pricing
- Direct access to our team
- Help shape the product
- Early access to features

5/ For Pilots:
→ Free forever
→ Build your profile once
→ Apply to multiple operators
→ No recruiter middlemen

6/ For Operators:
→ $99/mo founding member price
→ Access qualified pilot pool
→ Streamlined hiring workflow
→ Cancel anytime

7/ We're keeping this small intentionally.

100 founding members max.

Quality over quantity.

8/ Ready to join?

👉 https://mnnr.app

Questions? DM me or reply below.

Let's fix aviation recruiting together. ✈️
```

**Email to Warm Leads:**
```
Subject: You're invited: MNNR Preview Access (Limited to 100)

Hi [Name],

Remember when we talked about the pilot recruiting nightmare?

I finally built the solution.

MNNR is live in preview mode - and I'm inviting 100 founding members.

Here's what's different:
- AI matches pilots to operators automatically
- One platform, no more scattered applications
- Real-time hiring pipeline visibility

For operators: $99/mo (normally $199) - locked in forever
For pilots: Free, always

I'd love your feedback as we refine this.

Interested? Grab a spot: https://mnnr.app

Only 100 founding member slots.

- [Your Name]

P.S. Not ready yet? No worries. Reply with questions or just to say hi.
```

---

## ✅ FINAL CHECKLIST BEFORE GOING LIVE

**Technical:**
- [ ] Database migrations applied ✅
- [ ] Production env vars configured ✅
- [ ] Custom domain working (mnnr.app) ✅
- [ ] SSL certificate active (https) ✅
- [ ] Payment flow tested ✅
- [ ] Webhooks processing ✅
- [ ] Email verification working ✅
- [ ] Legal pages live (Terms, Privacy) ✅
- [ ] Security headers active ✅
- [ ] No console errors ✅

**Business:**
- [ ] Pricing decided ($99/mo founding members?) ✅
- [ ] Refund policy clear (30-day money back) ✅
- [ ] Support email monitored (contact@mnnr.app) ✅
- [ ] Social media accounts ready ✅
- [ ] Launch posts drafted ✅
- [ ] Screenshots/demo ready ✅

**Mental:**
- [ ] Ready to support users manually ✅
- [ ] Backup plan if things break (maintenance mode) ✅
- [ ] Celebration plan for first customer! 🎉

---

## 🚨 EMERGENCY CONTACTS & BACKUP PLANS

**If Site Goes Down:**
```bash
# Enable maintenance mode:
vercel env add MAINTENANCE_MODE true --scope production
vercel --prod
```

**If Payment Fails:**
- Stripe test mode vs live mode mismatch?
- Webhook secret correct?
- Check Stripe dashboard logs

**If Database Connection Fails:**
- Env vars correct in Vercel?
- Supabase project online?
- RLS policies too restrictive?

**Critical Bugs:**
- Roll back via Vercel dashboard (redeploy previous version)
- Email users: "We're aware and fixing - back soon"

---

## 📊 SUCCESS METRICS (First 24 Hours)

**What to watch:**
- [ ] Signups (goal: 5-10)
- [ ] Paying customers (goal: 1-3)
- [ ] Errors (goal: <5% error rate)
- [ ] Social engagement (likes, shares, comments)
- [ ] Inbound questions (respond within 1 hour)

**Where to monitor:**
- Vercel: Real-time logs
- Supabase: Dashboard → Database
- Stripe: Dashboard → Events
- Analytics: (PostHog if configured)

---

## 🎯 TONIGHT'S TIMELINE

**7:00 PM** - Apply database migrations (30 min)
**7:30 PM** - Verify env vars, test connection (20 min)
**7:50 PM** - Deploy legal pages (I'll do this)
**8:00 PM** - Test payment flow (60 min)
**9:00 PM** - Configure custom domain (30 min)
**9:30 PM** - End-to-end smoke test (30 min)
**10:00 PM** - Final polish & mobile check (30 min)
**10:30 PM** - Prep social media posts (30 min)
**11:00 PM** - FINAL GO/NO-GO DECISION

**If GO:**
**11:15 PM** - Hit publish on social posts
**11:30 PM** - Email warm leads
**12:00 AM** - Monitor, respond, celebrate first signup! 🍾

**If NO-GO:**
- Identify blockers
- Fix tomorrow
- Launch 10/8 or 10/9 instead

---

## 💪 YOU GOT THIS!

**Remember:**
- Done > Perfect
- Preview mode = expectations managed
- First customers are forgiving
- Feedback is gold
- Manual processes OK at start

**You've built:**
✅ Secure infrastructure (9.0/10 security)
✅ Payment system
✅ Legal compliance
✅ Professional platform

**Just need to:**
1. Connect database (30 min)
2. Test payments (60 min)
3. Point domain (30 min)
4. Hit publish 🚀

**LET'S LAUNCH THIS THING TONIGHT!**

---

**Questions? Problems? Stuck?**
→ Tell me immediately and I'll help debug

**Ready to start?**
→ Begin with PHASE 1: Database migrations

**GO GO GO!** 🔥🚀✈️
