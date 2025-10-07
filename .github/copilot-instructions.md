# Copilot Instructions for MNNR - Payments for Machines

## Project Overview
MNNR is a "Payments for Machines" platform enabling pay-per-call billing for AI agents and APIs. Built as a Next.js 14 SaaS with Supabase backend and Stripe payments, featuring agent wallets, spend caps, cryptographic receipts, and multi-rail settlement (USDC + Stripe).

## Architecture & Key Components
- **Frontend** (`app/`, `components/`): Next.js 14 App Router with TypeScript, Tailwind CSS, and Radix UI components
- **Backend API** (`app/api/`): Next.js API routes for auth, webhooks, and v1 endpoints
- **Database** (`supabase/`): Supabase with PostgreSQL, RLS policies, and real-time subscriptions
- **Payments** (`utils/stripe/`, `app/api/webhooks/`): Stripe integration with webhook handling and subscription management
- **Security** (`middleware.ts`, `utils/security/`): Enterprise-grade security with rate limiting, CORS, headers, and audit trails

## Developer Workflows
- **Local Development**:
  ```bash
  pnpm install
  pnpm supabase:start  # Local Supabase instance
  pnpm stripe:listen   # Webhook forwarding
  pnpm dev            # Start Next.js dev server
  ```
- **Database Management**: Use Supabase CLI for migrations, type generation, and schema changes
- **Deployment**: Vercel auto-deploy from GitHub main branch, or manual with `pnpm deploy`
- **Environment Setup**: Copy `.env.local.example` → `.env.local` and configure Supabase/Stripe keys

## Project-Specific Patterns & Conventions
- **Pay-per-call Billing**: Core business logic centers around metering API calls with cryptographic receipts
- **Agent Wallets**: Each agent/API has wallet-level spend caps and rate limits managed via Redis/Upstash
- **Multi-rail Settlement**: Unified API supporting both USDC (crypto) and Stripe (traditional) payments
- **Security-First**: 9.0/10 security score with comprehensive hardening (see `SECURITY_IMPLEMENTATION_COMPLETE.md`)
- **Component Structure**: Modular UI components in `components/ui/` with consistent Tailwind styling
- **API Versioning**: Use `/api/v1/` for all public endpoints, maintain backward compatibility

## Integration Points
- **Supabase**: Auth, database, RLS policies, real-time subscriptions
- **Stripe**: Payments, webhooks, customer portal, subscription management
- **Upstash Redis**: Rate limiting and caching for agent wallets
- **Sentry**: Error monitoring and performance tracking
- **Vercel**: Hosting, edge functions, analytics
- **PostHog**: User analytics and feature flags

## Critical Workflows
- **Agent Registration**: `/partners/register` flow for onboarding new agents/APIs
- **Webhook Processing**: Stripe webhooks sync subscription status to Supabase
- **Spend Cap Enforcement**: Redis-backed rate limiting prevents overspend
- **Receipt Generation**: Cryptographic signatures for payment verification
- **Emergency Procedures**: Maintenance mode toggles in `middleware.ts`

## Deployment & Operations
- **Production**: https://mnnr-complete2025.vercel.app (auto-deploy from GitHub)
- **Database**: Supabase hosted PostgreSQL with connection pooling
- **Monitoring**: Comprehensive logging, Sentry integration, health checks
- **Security**: SOC2-ready implementation with incident response playbooks
- **Scripts**: PowerShell deployment scripts in `scripts/` for Windows environments

## Key Files & References
- Landing page: `app/page.tsx`, `components/ui/Hero/Hero.tsx`
- API routes: `app/api/v1/`, `app/api/webhooks/`
- Security config: `middleware.ts`, `SECURITY_IMPLEMENTATION_COMPLETE.md`
- Deployment: `DEPLOYMENT_STATUS.md`, `LAUNCH_READINESS_10_10.md`
- Database schema: `supabase/migrations/`, `types_db.ts`

---

**For AI agents:**
- Focus on agent-centric payment flows and wallet management
- Prioritize security and compliance in all implementations
- Use TypeScript strictly - leverage `types_db.ts` for database types
- Follow existing component patterns and Tailwind conventions
- Always consider spend caps and rate limiting for agent endpoints