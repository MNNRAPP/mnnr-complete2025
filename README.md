# MNNR — Authority Layer for the Machine Economy

**Rail-neutral authorization, governance, and audit overlay for agentic payments.**

[![Status](https://img.shields.io/badge/status-beta-blue)](https://mnnr.app)
[![License](https://img.shields.io/badge/license-Proprietary-red)](./LICENSE)

🌐 **Live:** [mnnr.app](https://mnnr.app)
📜 **Risk disclosures:** [mnnr.app/legal/risk-disclosures](https://mnnr.app/legal/risk-disclosures)
🔐 **Public cryptographic transparency log:** [mnnr.app/crypto](https://mnnr.app/crypto/)
📨 **Contact:** [legal@mnnr.app](mailto:legal@mnnr.app) · [hello@mnnr.app](mailto:hello@mnnr.app)

---

## What this repository is

This repository contains the source for **app.mnnr.app**, the authenticated MNNR governance-layer application (dashboard, API, onboarding, billing integration, audit-log export). The public marketing site at `mnnr.app` is maintained in a separate Cloudflare Pages project (`MNNRAPP/mnnr-landing`).

This repository is published in public form to support transparency, cryptographic-attestation publication, and public accountability of the MNNR governance-layer infrastructure. Public visibility does not constitute a license to use, fork, or redistribute the Software — see [LICENSE](./LICENSE).

## What MNNR is

MNNR is the rail-neutral authorization, governance, and audit overlay for agentic payments. We sit above the payment rails your bank, payment service provider, or AI platform already chose. We add consent, attestation, policy enforcement, and audit-grade evidence so AI-initiated payments clear bank risk, compliance, and supervisory review.

Compatible by design with Visa Agentic Ready, Mastercard Agent Pay, Stripe Tempo MPP, Coinbase x402, AWS Bedrock AgentCore Payments, Chrome WebMCP (Chrome 149 origin trial, June 2026), PayPal Agent Ready, and Adyen Agentic. Built EU-sovereign by default, with PSD3, MiCA, DORA, and EUDI Wallet as the binding framework.

## Status disclosures

| Item | Status |
|---|---|
| Product stage | Beta. Live in production for a small number of design partners. |
| SOC 2 Type I | Not yet obtained. Audit window targeted Q4 2026. |
| ISO/IEC 27001 | Controls mapping in build. Certification track 2027. |
| FedRAMP Moderate | Path in scoping. Not authorized. |
| SDVOSB | SBA verification in progress. SAM.gov registration in progress. Not yet awarded. |
| PCI DSS | Not applicable; MNNR does not store cardholder data. |
| HIPAA / HITRUST | Not applicable to current scope. |
| Post-quantum signing keys | Live (ML-DSA-65 / FIPS 204). Cold-stored offline under founder custody; HSM migration scheduled Q3 2026. |
| Post-quantum key encapsulation | Live (ML-KEM-768 / FIPS 203). |
| Edge TLS | Cloudflare X25519MLKEM768 hybrid PQ key exchange. |
| Insurance | Tech E&O + Cyber + CGL coverage in active broker engagement. |

For the complete risk-disclosure framework — including forward-looking statements, regulatory-interpretation risk, penalty exposure, certification status, cryptographic risk, third-party rails, service availability, cyber/adversarial-AI risk, and veteran-owned-status disclosure — see [https://mnnr.app/legal/risk-disclosures](https://mnnr.app/legal/risk-disclosures).

## Important — what MNNR is NOT

- **Not a payment rail or payment service provider.** We sit above the rails. We do not move money or process card-present transactions.
- **Not a law firm.** Statements MNNR publishes about EU AI Act Article 50, PSD3/PSR, MiCA, DORA, EUDIW, NSPM-11, and other regulatory frameworks represent MNNR's good-faith interpretation as of publication. They do not constitute legal advice. Customers should consult licensed counsel in the relevant jurisdiction before relying on any MNNR statement for compliance purposes.
- **Not a partner of, certified by, or endorsed by** any of the third-party rails or programs named above unless expressly stated by the rail or program operator. "Integration roadmap" and "Interest accepted" status labels reflect engineering posture, not commercial relationship.

## Stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS
- Prisma + Postgres
- Clerk (authentication)
- Stripe (billing)
- Cloudflare (edge, security headers, Turnstile bot protection)
- Netlify (app hosting)
- ML-DSA-65 + ML-KEM-768 (post-quantum cryptographic primitives)

## Documentation

- Public site & legal: [mnnr.app/legal](https://mnnr.app/legal/risk-disclosures)
- AGP spec (governance overlay): [`docs/agp-spec/rails.md`](./docs/agp-spec/rails.md) · [`docs/agp-spec/integrations/webmcp.md`](./docs/agp-spec/integrations/webmcp.md)
- Subprocessors: [mnnr.app/legal/subprocessors](https://mnnr.app/legal/subprocessors)

## Entity

MNNR, LLC
Wyoming limited liability company
EIN 33-3678186
1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001, USA
[legal@mnnr.app](mailto:legal@mnnr.app)

## Repository security

If you discover a vulnerability, please follow our coordinated-disclosure process at [https://mnnr.app/.well-known/security.txt](https://mnnr.app/.well-known/security.txt) or email [security@mnnr.app](mailto:security@mnnr.app).

Do not file security vulnerabilities as public GitHub issues.
