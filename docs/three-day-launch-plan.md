# mnnr.app Launch Sprint (One-Day Compression)

This document compresses the original three-day launch playbook into a single, high-intensity sprint so you can ship **mnnr.app** today without sacrificing security or polish. Every block includes explicit tasks, recommended owners, and linked references so nothing slips.

> 💡 **Automation assist:** run `npm run launch:execute` to automatically audit migrations, security, payments, analytics, and production builds. Follow up with `npm run launch:manager -- --accelerated` for the hour-by-hour checklist once the executor reports green.

## Hour 0–1 — Launch Kickoff & Guardrails
- Run `npm run launch:manager -- --accelerated` to surface gaps in environment variables, migrations, security headers, rate limiting, legal policies, analytics, and outstanding checklist items.
- Patch production environment variables inside Vercel (Supabase + Stripe) so no secrets leak.
- Stage the `SECURITY_HARDENING_PLAN.md` SQL to enable deny-by-default RLS immediately after migrations.

## Hour 1–3 — Database & Authentication Hardening
- Apply all Supabase migrations (`APPLY_MIGRATIONS.md`) and confirm RLS policies are active.
- Execute the admin SQL to enforce deny-by-default RLS on the public schema.
- Smoke test authentication: sign-up, email verification, password reset, and persistent sessions.

## Hour 3–5 — Payments & Billing Validation
- Verify Stripe keys, run checkout, confirm webhook signature validation, and ensure subscription lifecycle events persist correctly.
- Review webhook handler idempotency so duplicate events never double-charge or desync state.

## Hour 5–7 — Domain, Security Headers & Legal
- Point `mnnr.app` to Vercel, confirm SSL certificate issuance, and lock in DNS propagation.
- Update middleware to include HSTS, CSP, X-Frame-Options, and related headers (`SECURITY_IMPLEMENTATION_COMPLETE.md`).
- Publish Privacy Policy, Terms of Service, and Refund Policy pages (required for Stripe compliance).

## Hour 7–8 — Analytics, Monitoring & Rate Limiting
- Configure PostHog (or equivalent) using production keys, ensuring error tracking and conversion funnels are live.
- Enable rate limiting using Vercel Edge Config + Upstash/Vercel KV so both authenticated and anonymous traffic are protected.

## Hour 8–9 — UX Polish & Multi-Device QA
- Review the UI on mobile, tablet, and desktop across major browsers, polishing loading, success, and error states.
- Confirm onboarding flows, dashboards, and legal pages render correctly and quickly.

## Hour 9–10 — End-to-End Testing & Launch Collateral
- Perform a full end-to-end run: new signup → payment → onboarding → dashboard access → cancellation/refund path.
- Use `securityheaders.com` (or similar) to validate deployed headers.
- Prepare launch copy, screenshots, and social assets so announcement can happen immediately after final smoke test.

## Hour 10+ — Launch Execution & Monitoring
- Execute a final smoke test, then push the announcement on social channels and communities.
- Monitor analytics dashboards, Supabase logs, and Stripe alerts in real time to resolve issues swiftly.

## Confidence Gate
Before flipping the switch, confirm the readiness criteria from `LAUNCH_READINESS_10_10.md`:
- You have at least 10 focused hours today.
- You are comfortable shipping a "good enough" MVP and iterating live.
- You can personally handle support escalations during the launch window.
- Database, authentication, payments, and legal artifacts all passed QA in the steps above.

## Post-Launch Security Enhancements
To stay aligned with the "quantum-level" security vision, queue these follow-ups immediately after launch:
- Kick off SOC 2 readiness using `SOC2_STARTUP_CHECKLIST.md` (consider Vanta or similar for automation).
- Wire the CI/CD supply-chain safeguards described in `SECURITY_HARDENING_PLAN.md` (SBOM, SAST, dependency locking).
- Validate the Stripe webhook handler remains idempotent as you add more billing events.

Executing these blocks sequentially delivers the complete three-day roadmap in a single focused day, preserving enterprise security commitments while getting mnnr.app live today.
