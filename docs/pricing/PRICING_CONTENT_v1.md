# Pricing — built to stay 25% under AWS

Four defensive tiers covering emergency Article 50 retrofit, ongoing PSD3 overlay, annual compliance, and full multi-rail enterprise. Every plan carries a written price-protection clause against published AWS rates.

---

## Tier 1 — A50 Emergency Retrofit

**Price:** €15,000 flat
**Deployment:** 5-day
**For:** Organisations facing the Aug 2, 2026 EU AI Act Article 50 deadline.

- Article 50 disclosure layer deployed in 5 business days
- Pre-configured attestation templates
- Single-jurisdiction scope (EU 27)
- Handover documentation pack

---

## Tier 2 — PSD3 Overlay Pilot

**Price:** €5,000 / month
**Term:** Month-to-month, cancel any time
**For:** Ongoing PSD3-aligned overlay for payments and financial-services AI workloads.

- PSD3 control mapping maintained quarterly
- Continuous policy delta monitoring
- Up to 3 production workloads covered
- Email + chat support

---

## Tier 3 — Annual Compliance Subscription (best value)

**Price:** €50,000 / year
**Savings:** 17% vs €60K/year monthly equivalent
**For:** All overlay capabilities, locked in for 12 months at a fixed rate.

- Everything in PSD3 Overlay Pilot
- Unlimited covered workloads (single tenant)
- Quarterly compliance posture report
- Named customer success contact
- Price locked for full 12 months

---

## Tier 4 — Multi-rail Enterprise

**Price:** €120,000 / year
**MSA:** Custom available
**For:** Organisations operating across multiple jurisdictions and payment rails.

- Unlimited attestations across all rails
- 24/7 support with defined SLAs
- Dedicated solutions engineer
- Multi-tenant and white-label options
- Custom integration scope

---

## 25% price-protection commitment vs AWS

We commit to keeping A50 SKU pricing at least 25% below the published comparable AWS or major cloud-bundled rate. Validated against published rates monthly; price-protection clause included in every Master Service Agreement.

---

**Trust footer:** 94.4% / 17 of 18 security score · Snyk CISO 14/4/3/7 · A++/99th percentile Manus audit

---

# PUSH-PLAYBOOK — manual deploy from Tohid's machine

Target repo: `MNNRAPP/mnnr-complete2025`
Confirmed target file (Next.js App Router): `app/pricing/page.tsx`
Branch name to use: `pricing-defensive-discipline-2026-06-20`

## Step 1 — clone or pull the repo

```bash
# first-time clone:
git clone https://github.com/MNNRAPP/mnnr-complete2025.git
cd mnnr-complete2025

# OR if already cloned:
cd /path/to/mnnr-complete2025
git checkout main
git pull origin main
```

## Step 2 — create the branch and copy in the new content

```bash
git checkout -b pricing-defensive-discipline-2026-06-20
```

Then update `app/pricing/page.tsx` with the new 4-tier content (use the Markdown above as the source of copy; either port it into the existing React/JSX component as new tier objects, or — if you prefer the simpler static approach — replace the page body with a server component that returns the HTML in `20260620_pricing_page.html`). Keep the existing layout / Header / Footer components intact.

If the cleanest path is to ship the static HTML directly, drop `20260620_pricing_page.html` into `public/pricing.html` and let Next.js serve it as a static asset (note: this lives alongside, not in place of, `/pricing` — confirm routing before merge).

## Step 3 — commit, push, open PR

```bash
git add app/pricing/page.tsx
# or: git add public/pricing.html

git commit -m "Lock-in defensive pricing vs AWS GA bundling: 4-tier structure with price-protection commitment"

git push -u origin pricing-defensive-discipline-2026-06-20
```

Then open the PR in GitHub:

- **Title:** `Lock-in defensive pricing vs AWS GA bundling — 4-tier structure with price-protection commitment`
- **Body:** paste the contents of `20260620_pricing_PR_body.md`
- **Reviewers:** human review before merge
- **Deploy:** Netlify Free credit may not auto-deploy preview until 6/25 reset — manual `netlify deploy --prod` from local CLI is the backup path.
