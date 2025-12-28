# 🚀 MNNR v1.0 Release Roadmap

**Current Status**: Production Beta (v0.9)  
**Target**: v1.0 General Availability  
**Gap Analysis Date**: December 27, 2025

---

## 📊 CURRENT STATE ANALYSIS

### What's Complete (v0.9)
- ✅ **13 API endpoints** (user, subscriptions, payments, invoices, usage, webhooks, admin)
- ✅ **21 pages** (landing, dashboard, settings, billing, usage, admin panel)
- ✅ **46 components** (UI library, forms, charts, tables)
- ✅ **Stripe integration** (3 products, webhook handling)
- ✅ **Supabase database** (8 tables with RLS)
- ✅ **Authentication** (basic auth flow)
- ✅ **Security** (9/10 score, 0 vulnerabilities)
- ✅ **Documentation** (20+ guides)

### What's Missing for v1.0
Based on analysis of the codebase and the landing page promises, here are the critical gaps:

1. **No functional authentication system** - Sign in button exists but no auth flow
2. **No actual payment processing** - Stripe is configured but checkout flow is incomplete
3. **No user dashboard** - Dashboard pages exist but not connected to real data
4. **No API key management** - Core feature for "Payments for Machines" not implemented
5. **No usage metering** - Promised feature not functional
6. **No wallet system** - Core value proposition not implemented
7. **No policy enforcement engine** - Main differentiator not built
8. **No real-time settlement** - Promised feature not functional

---

## 🎯 TOP 3 CRITICAL FEATURES FOR V1.0

After analyzing user value, technical dependencies, and the core value proposition ("Payments for Machines"), here are the **3 most critical features** to implement:

---

## 1. 🔐 COMPLETE AUTHENTICATION & ONBOARDING SYSTEM

### Why This is #1 Priority
**Without authentication, users cannot access any features.** This is the foundation that blocks everything else.

### Current State
- ✅ Auth API endpoints exist (`app/api/auth`)
- ✅ Supabase auth configured
- ❌ No sign-up flow
- ❌ No sign-in flow
- ❌ No onboarding wizard
- ❌ No email verification
- ❌ No password reset

### What Needs to be Built

#### A. Sign-Up Flow
**Pages**:
- `/signup` - Registration form with email/password
- `/verify-email` - Email verification page
- `/onboarding` - Multi-step wizard (company info, use case, initial setup)

**Features**:
- Email/password registration
- OAuth providers (Google, GitHub)
- Email verification with magic link
- Password strength validation
- Terms of service acceptance
- Initial workspace creation

**API Endpoints**:
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/verify-email` - Verify email token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/onboarding/complete` - Save onboarding data

#### B. Sign-In Flow
**Pages**:
- `/signin` - Login form
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form

**Features**:
- Email/password login
- OAuth login (Google, GitHub)
- "Remember me" functionality
- Password reset via email
- Account lockout after failed attempts
- Session management

**API Endpoints**:
- `POST /api/auth/signin` - Authenticate user
- `POST /api/auth/signout` - End session
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### C. Protected Routes & Middleware
**Implementation**:
- Next.js middleware for route protection
- Redirect unauthenticated users to `/signin`
- Role-based access control (user, admin)
- Session refresh logic
- Auth state management (Context/Zustand)

### Technical Specifications

**Database Changes**:
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;

-- Create verification tokens table
CREATE TABLE verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'email_verification', 'password_reset'
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Environment Variables**:
```bash
NEXTAUTH_SECRET=<generate-secret>
NEXTAUTH_URL=https://mnnr.app
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GITHUB_CLIENT_ID=<from-github-oauth>
GITHUB_CLIENT_SECRET=<from-github-oauth>
```

**Libraries to Add**:
```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.7",
  "next-auth": "^4.24.5",
  "zod": "^3.22.4",
  "react-hook-form": "^7.49.2"
}
```

### Success Criteria
- ✅ Users can sign up with email/password
- ✅ Users can sign in with OAuth (Google, GitHub)
- ✅ Email verification works
- ✅ Password reset works
- ✅ Protected routes redirect to sign-in
- ✅ Session persists across page reloads
- ✅ Onboarding wizard collects initial data

### Estimated Effort
**Time**: 16-20 hours  
**Complexity**: Medium  
**Dependencies**: None (foundational feature)

---

## 2. 💳 COMPLETE STRIPE CHECKOUT & SUBSCRIPTION MANAGEMENT

### Why This is #2 Priority
**No revenue without payment processing.** Users need to subscribe to plans before using the platform.

### Current State
- ✅ Stripe configured with 3 products
- ✅ Webhook endpoint exists
- ✅ Subscription API endpoints exist
- ❌ No checkout flow
- ❌ No payment method management
- ❌ No subscription upgrade/downgrade
- ❌ No billing portal integration

### What Needs to be Built

#### A. Stripe Checkout Flow
**Pages**:
- `/pricing` - Enhanced pricing page with "Subscribe" buttons
- `/checkout/[plan]` - Stripe Checkout redirect page
- `/checkout/success` - Post-payment success page
- `/checkout/cancel` - Payment cancellation page

**Features**:
- Stripe Checkout integration (hosted)
- Plan selection with feature comparison
- Proration handling for upgrades
- Trial period support (14 days free)
- Coupon code support
- Tax calculation (Stripe Tax)

**API Endpoints**:
- `POST /api/checkout/create-session` - Create Stripe Checkout session
- `GET /api/checkout/session/[id]` - Get session status
- `POST /api/subscriptions/upgrade` - Upgrade subscription
- `POST /api/subscriptions/downgrade` - Downgrade subscription

#### B. Billing Portal Integration
**Pages**:
- `/billing` - Enhanced billing page with portal link
- Stripe Customer Portal (hosted by Stripe)

**Features**:
- One-click access to Stripe Customer Portal
- Update payment methods
- View invoices and receipts
- Cancel subscription
- Update billing information

**API Endpoints**:
- `POST /api/billing/create-portal-session` - Create portal session
- `GET /api/billing/invoices` - List all invoices
- `GET /api/billing/upcoming-invoice` - Get upcoming invoice

#### C. Subscription Lifecycle Management
**Features**:
- Webhook handling for all subscription events
- Automatic access control based on subscription status
- Grace period for failed payments
- Dunning emails for payment failures
- Subscription renewal reminders
- Usage-based billing support

**Webhook Events to Handle**:
```typescript
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- customer.subscription.trial_will_end
- invoice.paid
- invoice.payment_failed
- invoice.payment_action_required
- payment_method.attached
- payment_method.detached
- payment_intent.succeeded
- payment_intent.payment_failed
```

### Technical Specifications

**Database Changes**:
```sql
-- Add to subscriptions table
ALTER TABLE subscriptions ADD COLUMN trial_end TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN cancel_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN canceled_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN trial_start TIMESTAMPTZ;

-- Create payment_methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'card', 'bank_account'
  last4 TEXT,
  brand TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Stripe Configuration**:
```typescript
// Enable features in Stripe Dashboard
- Customer Portal: Enabled
- Tax calculation: Enabled (Stripe Tax)
- Payment methods: Card, ACH, SEPA
- Billing thresholds: $0.50
- Invoice settings: Auto-advance enabled
```

**Libraries to Add**:
```json
{
  "@stripe/stripe-js": "^2.4.0",
  "@stripe/react-stripe-js": "^2.4.0"
}
```

### Success Criteria
- ✅ Users can subscribe to any plan via Stripe Checkout
- ✅ Users can upgrade/downgrade subscriptions
- ✅ Users can manage payment methods via Customer Portal
- ✅ Webhooks update database in real-time
- ✅ Failed payments trigger dunning emails
- ✅ Subscription status controls feature access
- ✅ Invoices are automatically generated and sent

### Estimated Effort
**Time**: 20-24 hours  
**Complexity**: High  
**Dependencies**: Feature #1 (Authentication)

---

## 3. 🔑 API KEY MANAGEMENT & USAGE METERING SYSTEM

### Why This is #3 Priority
**This is the core value proposition: "Payments for Machines".** Without API keys and metering, the platform cannot deliver on its promise.

### Current State
- ✅ Usage API endpoints exist
- ✅ Usage tracking table exists
- ❌ No API key generation
- ❌ No API key authentication
- ❌ No usage metering
- ❌ No rate limiting
- ❌ No usage-based billing

### What Needs to be Built

#### A. API Key Management System
**Pages**:
- `/dashboard/api-keys` - API key management page
- `/dashboard/api-keys/create` - Create new API key modal
- `/dashboard/api-keys/[id]` - API key details and analytics

**Features**:
- Generate API keys with custom names
- Revoke API keys instantly
- Set expiration dates
- Scope-based permissions (read, write, admin)
- Rate limit configuration per key
- Usage quotas per key
- Last used timestamp
- Key rotation

**API Endpoints**:
- `POST /api/keys/create` - Generate new API key
- `GET /api/keys` - List all API keys
- `GET /api/keys/[id]` - Get API key details
- `DELETE /api/keys/[id]` - Revoke API key
- `PUT /api/keys/[id]` - Update API key settings
- `POST /api/keys/[id]/rotate` - Rotate API key

#### B. API Key Authentication Middleware
**Implementation**:
- Next.js middleware for API key validation
- Bearer token authentication
- Key validation against database
- Permission checking
- Rate limiting enforcement
- Usage tracking on every request

**Example Usage**:
```bash
curl -H "Authorization: Bearer mnnr_live_abc123..." \
  https://mnnr.app/api/v1/payments/create
```

**Middleware Logic**:
```typescript
1. Extract API key from Authorization header
2. Validate key format (mnnr_live_* or mnnr_test_*)
3. Check if key exists and is active
4. Verify key hasn't expired
5. Check rate limits
6. Check usage quotas
7. Verify permissions for requested endpoint
8. Log usage event
9. Allow request or return 401/429
```

#### C. Usage Metering & Billing
**Features**:
- Real-time usage tracking per API key
- Aggregate usage by user/workspace
- Usage-based billing (per API call)
- Usage alerts and notifications
- Usage analytics dashboard
- Export usage data (CSV, JSON)
- Usage-based pricing tiers

**Metrics to Track**:
```typescript
- Total API calls
- API calls by endpoint
- API calls by key
- Response times
- Error rates
- Data transferred (bytes)
- Successful vs failed requests
- Geographic distribution
```

**Database Schema**:
```sql
-- Create api_keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL, -- bcrypt hash of actual key
  key_prefix TEXT NOT NULL, -- First 8 chars for display (mnnr_live_abc12345)
  scopes TEXT[] DEFAULT ARRAY['read'], -- ['read', 'write', 'admin']
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  usage_quota_monthly INTEGER, -- NULL = unlimited
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create api_usage_events table
CREATE TABLE api_usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  bytes_sent INTEGER DEFAULT 0,
  bytes_received INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_usage_events_api_key_id ON api_usage_events(api_key_id);
CREATE INDEX idx_api_usage_events_created_at ON api_usage_events(created_at);
CREATE INDEX idx_api_usage_events_user_id_created_at ON api_usage_events(user_id, created_at);
```

#### D. Rate Limiting & Quotas
**Implementation**:
- Redis-based rate limiting (Upstash Redis)
- Sliding window algorithm
- Per-key rate limits
- Per-user rate limits
- Burst allowance
- Rate limit headers in responses

**Response Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Technical Specifications

**Environment Variables**:
```bash
UPSTASH_REDIS_REST_URL=<upstash-url>
UPSTASH_REDIS_REST_TOKEN=<upstash-token>
API_KEY_ENCRYPTION_SECRET=<generate-secret>
```

**Libraries to Add**:
```json
{
  "@upstash/redis": "^1.28.0",
  "@upstash/ratelimit": "^1.0.1",
  "bcryptjs": "^2.4.3",
  "nanoid": "^5.0.4"
}
```

**API Key Format**:
```
Environment Prefix:
- Production: mnnr_live_
- Test: mnnr_test_

Full Format: mnnr_live_abc123def456ghi789jkl012mno345pqr678
             └─────┬────┘└────────────────┬───────────────────┘
               prefix            32-char random string
```

### Success Criteria
- ✅ Users can generate API keys from dashboard
- ✅ API keys authenticate requests successfully
- ✅ Rate limiting works correctly
- ✅ Usage is tracked in real-time
- ✅ Usage dashboard shows accurate metrics
- ✅ API keys can be revoked instantly
- ✅ Usage-based billing calculates correctly
- ✅ Rate limit headers are returned
- ✅ Quota exceeded returns proper error

### Estimated Effort
**Time**: 24-28 hours  
**Complexity**: High  
**Dependencies**: Feature #1 (Authentication), Feature #2 (Billing)

---

## 📋 IMPLEMENTATION SUMMARY

### Priority Order
1. **Authentication & Onboarding** (16-20 hours) - Foundation
2. **Stripe Checkout & Billing** (20-24 hours) - Revenue
3. **API Key Management & Metering** (24-28 hours) - Core Value

### Total Effort
**Total Time**: 60-72 hours (1.5-2 weeks for 1 developer)  
**Parallel Development**: Can be done in 1 week with 2 developers

### Development Sequence
```
Week 1:
├── Days 1-2: Feature #1 (Authentication)
├── Days 3-4: Feature #2 (Stripe Checkout)
└── Day 5: Feature #2 (Billing Portal)

Week 2:
├── Days 1-2: Feature #3 (API Keys)
├── Days 3-4: Feature #3 (Usage Metering)
└── Day 5: Integration Testing & Bug Fixes
```

### Dependencies Graph
```
Feature #1 (Auth)
    ↓
Feature #2 (Billing) ──→ Feature #3 (API Keys & Metering)
    ↓                           ↓
  Revenue                  Core Value Prop
```

---

## 🎯 V1.0 DEFINITION OF DONE

### Functional Requirements
- ✅ Users can sign up and sign in
- ✅ Users can subscribe to paid plans
- ✅ Users can manage their billing
- ✅ Users can generate API keys
- ✅ API keys authenticate requests
- ✅ Usage is metered and billed
- ✅ Rate limiting works correctly

### Non-Functional Requirements
- ✅ 99.9% uptime
- ✅ < 200ms API response time (p95)
- ✅ Security audit passed
- ✅ Load testing passed (1000 req/s)
- ✅ Documentation complete
- ✅ Onboarding flow tested
- ✅ Payment flow tested

### Launch Checklist
- ✅ All 3 critical features implemented
- ✅ Integration tests passing
- ✅ Security review complete
- ✅ Performance testing complete
- ✅ Documentation updated
- ✅ Customer support ready
- ✅ Monitoring and alerts configured
- ✅ Backup and disaster recovery tested
- ✅ Legal terms updated (ToS, Privacy Policy)
- ✅ Marketing materials ready

---

## 🚀 POST-V1.0 ROADMAP (v1.1+)

### High Priority (v1.1)
- Team/workspace management
- Usage analytics dashboard
- Webhook management UI
- Custom pricing plans
- Enterprise SSO

### Medium Priority (v1.2)
- Multi-currency support
- Invoice customization
- Referral program
- API documentation portal
- SDK libraries (Python, Node.js, Go)

### Future Considerations (v2.0)
- Policy enforcement engine (as promised on landing page)
- Wallet system for agents
- Real-time settlement
- Multi-rail support (crypto, ACH)
- AI-powered anomaly detection

---

## 📊 SUCCESS METRICS

### Business Metrics
- **Conversion Rate**: 10% of signups → paid customers
- **MRR Growth**: 20% month-over-month
- **Churn Rate**: < 5% monthly
- **Average Revenue Per User**: $50/month

### Technical Metrics
- **API Uptime**: 99.9%
- **API Response Time**: < 200ms (p95)
- **Error Rate**: < 0.1%
- **Time to First API Call**: < 5 minutes after signup

### User Metrics
- **Time to First Value**: < 10 minutes
- **Activation Rate**: 80% complete onboarding
- **Daily Active Users**: 40% of total users
- **API Keys per User**: 2.5 average

---

## 💡 RECOMMENDATIONS

### Immediate Actions
1. **Start with Feature #1 (Auth)** - Blocks everything else
2. **Use NextAuth.js** - Faster than building from scratch
3. **Use Stripe Checkout** - Don't build custom checkout
4. **Use Upstash Redis** - Serverless, no infrastructure

### Best Practices
- **Implement feature flags** - For gradual rollout
- **Write integration tests** - For critical flows
- **Set up monitoring** - Before launch
- **Create runbooks** - For common issues
- **Plan for rollback** - In case of issues

### Risk Mitigation
- **Beta test with 10 users** - Before public launch
- **Soft launch to existing list** - Gradual traffic increase
- **Monitor error rates closely** - First 48 hours critical
- **Have support team ready** - For launch day issues

---

## 🎉 CONCLUSION

These **3 critical features** will transform MNNR from a production beta (v0.9) to a fully functional v1.0 SaaS platform ready for paying customers.

**Current State**: Beautiful landing page, solid infrastructure, but no user-facing functionality  
**After Implementation**: Complete SaaS platform with auth, billing, and core API key management

**Estimated Timeline**: 1-2 weeks  
**Estimated Effort**: 60-72 hours  
**Expected Outcome**: Revenue-generating v1.0 platform

---

*Roadmap created by Manus AI - December 27, 2025*
