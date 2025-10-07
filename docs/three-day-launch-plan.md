# mnnr.app Three-Day Launch Plan

This document captures the hyper-focused three-day plan required to launch **mnnr.app** with production-ready security and functionality. Each day is organized around a clear objective with timeboxed tasks to maintain momentum.

> 💡 **Automation assist:** run `npm run launch:manager` to see an actionable readiness summary that checks environment variables, security headers, rate limiting, legal policy coverage, analytics instrumentation, and even surfaces outstanding checklist items before you start each day.

## Day 1 – Solidify the Core

**Primary objective:** Deliver a fully functional and secure application foundation.

### Morning (3–4 hours) – Database & Authentication
- Apply the three Supabase SQL migrations outlined in `APPLY_MIGRATIONS.md`, then verify that Row Level Security (RLS) policies are active.
- Configure production Supabase and Stripe environment variables in Vercel to avoid exposing service role keys.
- Test the entire authentication flow: sign-up, email verification, password reset, and session persistence.
- Execute the admin SQL from `SECURITY_HARDENING_PLAN.md` to enforce deny-by-default RLS on all tables in the public schema.

### Afternoon (2–3 hours) – Payments & User Flow
- Exercise the Stripe integration end-to-end, including checkout, webhook handling, subscription lifecycle, and failure states; confirm webhook signature validation.
- Complete a full pilot user journey from application through dashboard access to ensure no critical UX gaps remain.

**End-of-day target:** Database, authentication, and payment subsystems are production-ready.

## Day 2 – Polish and Harden

**Primary objective:** Ship a professionally polished, security-focused experience on the production domain.

### Morning (3–4 hours) – Domain & Legal
- Point `mnnr.app` to Vercel, confirming DNS propagation and SSL certificate issuance.
- Add comprehensive security headers (HSTS, X-Frame-Options, Content-Security-Policy, etc.) via middleware.
- Publish Privacy Policy, Terms of Service, and Refund Policy pages to satisfy compliance expectations and Stripe requirements.

### Afternoon (3–4 hours) – Monitoring & UX Polish
- Configure analytics and monitoring (e.g., PostHog) for conversion tracking and error visibility.
- Perform UI/UX sweeps across devices and browsers, refining loading, error, and success states for clarity.
- Implement rate limiting using Vercel Edge Config with Upstash or Vercel KV for both authenticated and guest traffic.

**End-of-day target:** Production deployment on `mnnr.app` with hardened security posture and refined UX.

## Day 3 – Pre-Launch & Go-Live

**Primary objective:** Validate end-to-end readiness and launch publicly.

### Morning (4 hours) – Testing & Launch Prep
- Conduct full end-to-end testing—from signup through payment and onboarding—on multiple devices/browsers; validate headers via securityheaders.com.
- Prepare launch collateral: announcement copy, product screenshots, and social media assets.

### Afternoon – Soft Launch & Monitoring
- Execute a final smoke test of critical flows prior to announcement.
- Announce the launch across social channels and relevant communities.
- Monitor analytics and support channels closely to resolve issues rapidly and engage early adopters.

## Confidence Checklist

Before proceeding, confirm the readiness criteria from `LAUNCH_READINESS_10_10.md`:
- Availability of 5–6 hours of focused effort per day during the three-day push.
- Acceptance that the MVP is "good enough" for launch.
- Willingness to manage user support manually.
- Database and authentication verified as operational by the end of Day 1.

## Post-Launch Security Enhancements

To align with the "quantum-level" security vision, prioritize the following after launch:
- Initiate SOC 2 readiness using the roadmap in `SOC2_STARTUP_CHECKLIST.md`, potentially with an automation partner like Vanta.
- Implement the CI-based security workflow from `SECURITY_HARDENING_PLAN.md` for SBOM generation, SAST scanning, and dependency locking.
- Ensure the Stripe webhook handler is idempotent to guard against duplicate event processing.

Following this plan keeps the focus on high-impact tasks, enabling a confident, secure launch within three days while setting the stage for ongoing hardening and compliance.
