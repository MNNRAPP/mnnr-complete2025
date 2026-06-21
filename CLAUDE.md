# CLAUDE.md — mnnr-complete2025

Repo-level instructions for Claude Code sessions running from this
directory. Future sessions: read this file at session start.

## What this repo is

`mnnr.app` — full-stack payments + identity surface (Next.js frontend,
Go server, Supabase/Postgres backend, Stripe LIVE integrations,
Cloudflare Pages / Vercel deploy targets). Tohid's flagship product.

## Compound-Engineering loop (REQUIRED for any new feature work)

Installed 6/19/26 from EveryInc/compound-engineering-plugin
(C:\Users\pusse\Downloads\plugins\compound-engineering-plugin\).
39 skills + 43 agents shipped.

### One-time install per machine

Inside Claude Code (NOT PowerShell):

```
/plugin marketplace add EveryInc/compound-engineering-plugin
/plugin install compound-engineering@compound-engineering-plugin
```

Then once in this repo:

```
/ce-setup
```

### The canonical loop for any new feature, refactor, or debug session

```
/ce-brainstorm "<the problem in 1-2 sentences>"
    └─> spins up the multi-agent brainstorm swarm; writes a brainstorm
        doc into docs/brainstorms/YYYY-MM-DD-<topic>.md

/ce-plan
    └─> converts the brainstorm into an actionable plan with phases,
        agent assignments, success criteria. Writes
        docs/plans/YYYY-MM-DD-<topic>-plan.md

/ce-work
    └─> executes the plan. Spawns sub-agents per the plan, runs them
        in parallel where independent, gates phases on test pass.

/ce-code-review
    └─> adversarial review pass with multiple personas (security,
        performance, accessibility, maintainability). Flags issues
        before commit.

/ce-compound
    └─> post-mortem: writes learnings BACK TO THIS CLAUDE.md so the
        next cycle gets easier. Compounds quality across iterations.
```

### Examples for mnnr-complete2025 work

```
/ce-brainstorm "Add subscription billing for Pro tier ($49/mo) wired to existing Stripe products and the dashboard upgrade CTA"
/ce-plan
/ce-work
/ce-code-review
/ce-compound
```

```
/ce-debug "OAuth signup flow fails on first attempt for Google
identities created in the last 24h — works on second click"
```

```
/ce-product-pulse
   # weekly check — real user signal from Stripe + Supabase + analytics
```

## Standing rules for any Claude Code session in this repo

1. **NO unauthorized pushes.** Open a PR, never push to `main`
   directly. (Per the YOLO constraint in the integration handoff.)
2. **Stripe is LIVE.** Account `acct_1S6R0T8CWPGKXcGk`. The 10 Payment
   Links in `reference_stripe_live_payment_links.md` are LIVE — do not
   regenerate or republish without Tohid per-instance greenlight.
3. **Secrets-rotation policy** is in `SECRET_ROTATION_PLAN.md` — read
   before touching env vars.
4. **Tests must pass** before commit. Playwright e2e in `test-results/`.
5. **Use stop-slop on any user-facing copy** drafted by the agent
   (landing, onboarding, email templates). Filter at
   `C:\Users\pusse\Documents\projects\plugins\stop_slop_filter.py`.

## Cross-repo dependencies

- `takeyourpower.org`, `oursly.com`, `properprose.diy`, `mnnr.app
  landing` — sister surfaces; do not edit from this repo.
- `MNNR LLC` (WY, EIN 33-3678186) is the parent entity.

## Learnings (auto-appended by /ce-compound)

<!-- /ce-compound writes here. Do not delete this section. -->

(empty until first cycle)
