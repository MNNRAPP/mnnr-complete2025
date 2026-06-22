# MNNR Claims Register

**Status:** Source-of-truth governance gate for every public-facing claim.
**Origin:** Meta-AI Phase-0 asset pack v5 (2026-06-22), reproduced verbatim.
**Maintainer note:** Statuses below are the *recommended dispositions* from the
v5 triage. No claim is "live-approved" until (a) its page copy uses only the
Approved Wording + Required Caveat, and (b) the named Owner(s) sign off. Rows
marked **Remove** / **Reword** must be actioned in source before the related page
ships. "Approved with Caveat" still requires the Owner's explicit confirmation
before the wording goes public.

> This register is mirrored to `MNNRAPP/mnnr-governance-public`.

## Purpose

Create one evidence-gated source of truth for every public-facing legal,
regulatory, security, certification, hosting, cryptographic, government, uptime,
insurance, and commercial-readiness claim.

## Rule

If Evidence Required is empty, the claim is deleted, softened to target/in
progress, or moved off the public site.

No claim goes live unless Status = Approved.

No pull request may add compliance, security, legal, regulatory, certification,
hosting, uptime, insurance, government, buyer-traction, cryptographic, or
production-readiness language unless the PR references a Claim ID from this
register.

## Status Values

- Draft
- Pending Evidence
- Pending Legal Review
- Pending Security Review
- Approved
- Approved with Caveat
- Reword
- Remove

## Owner Values

- Founder
- Legal
- Engineering
- Security
- Product
- Finance
- Ops

## Claims Register Table (35 rows)

| Claim ID | Claim | Page / Location | Risk | Evidence Required | Approved Wording | Required Caveat | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| MNNR-CLM-001 | MNNR supports EU AI Act Article 50 transparency obligations | Home, A50, FAQ, Compliance Brief | High | Counsel-reviewed Article 50 mapping; schema showing AI-actor tag; sample policy log; sample audit export | Technical controls designed to support EU AI Act Article 50 transparency obligations | Not legal advice. Customer remains responsible for compliance determination. Applicability depends on role, system, and implementation context. | Legal + Product | Pending Evidence | Do not say Article 50 compliant. |
| MNNR-CLM-002 | Article 50 transparency obligations apply from August 2, 2026 | Home alert, A50, FAQ | High | Official EU AI Act timeline source; counsel confirmation on applicability, exceptions, and scope | Article 50 transparency obligations apply from August 2, 2026, subject to exceptions and implementation context | Applicability depends on system role, use case, jurisdiction, and exceptions. | Legal | Pending Legal Review | Date claim may stay only if sourced and caveated. |
| MNNR-CLM-003 | PSD3/PSR-aligned payment-governance controls | Home, Pillars, EU Posture, Pilot | High | Versioned PSD3/PSR control mapping; counsel review; engineering control matrix | PSD3/PSR-aligned payment-governance controls | PSD3/PSR final implementation details remain subject to legislative completion and local implementation. | Legal + Product | Pending Evidence | Do not say PSD3 compliant or PSR compliant. |
| MNNR-CLM-004 | Five-day Article 50 readiness sprint / emergency retrofit | Home A50 SKU, A50 Page | High | Internal delivery playbook; demo; scoped SOW; sample implementation checklist; dry-run evidence | Five-day technical retrofit for one agreed agentic-payment flow | Timeline depends on customer access, sandbox readiness, and agreed scope. No compliance warranty. | Product + Engineering + Legal | Pending Evidence | Prefer readiness sprint over compliance sprint. |
| MNNR-CLM-005 | €15,000 flat A50 Emergency Retrofit | Home, A50, Pricing, SOW | Medium | Approved pricing memo; SOW; payment terms; refund/acceptance terms | A50 Emergency Retrofit: €15,000 flat for one agreed five-day technical scope | Scope exclusions apply. Customer access and test environment required. | Founder + Finance + Legal | Approved with Caveat | Keep if pricing is final. |
| MNNR-CLM-006 | €5,000/month design-partner pilot, 90 days, 3 EU slots | Home, Pilot CTA, Sales Materials | Medium | Approved pricing memo; pilot SOW; cohort policy; capacity plan | Design Partner Pilot: €5,000/month, 90-day scope | Availability, scope, and acceptance subject to written pilot agreement. | Founder + Finance + Legal | Pending Legal Review | Avoid scarcity claims unless real. |
| MNNR-CLM-007 | Cryptographically bound AI-actor self-ID | Home, A50 SKU, Pillars, FAQ | High | Working schema; signing implementation; sample signed event; verification instructions; key-management note | AI-actor self-identification tag cryptographically bound to mandate and policy-log metadata | Technical control only. Binding strength depends on implementation and key-management configuration. | Engineering + Security | Pending Evidence | Must not imply legal identity proof unless independently supported. |
| MNNR-CLM-008 | Mandate binding for scope, amount, expiry, and pre-authorization checks | Home, A50, API Docs, Demo | High | Mandate schema; API endpoint; policy-check demo; test logs; error-handling documentation | Mandate binding for scope, amount, expiry, and policy checks in agreed agentic-payment flows | Coverage depends on integration scope and customer-provided data. | Engineering + Product | Pending Evidence | Strong claim if demo exists. |
| MNNR-CLM-009 | Append-only policy log / ledger export | Home, Pillars, A50, Trust, API Docs | High | Log architecture; immutability design; sample export; retention policy; tamper-evidence method | Append-only policy log exportable for audit review | Not a regulated recordkeeping system unless separately contracted and validated. | Engineering + Security + Legal | Pending Evidence | Avoid immutable unless technically proven. |
| MNNR-CLM-010 | Audit export to CSV/JSON for regulator or internal audit | Home, A50, SOW, Demo | Medium | Working export; sample CSV/JSON; data dictionary; retention policy | CSV/JSON audit export for internal governance and review | Export format does not guarantee regulator acceptance. | Engineering + Product | Pending Evidence | Safe if sample export exists. |
| MNNR-CLM-011 | Rail-neutral deployment above Visa, Mastercard, Stripe, PayPal, Crossmint, Adyen, Google UCP, AWS AgentCore | Home, Rails Section, FAQ | High | Architecture diagram; integration abstraction layer; no exclusive dependency; legal review of naming third-party rails | Designed for rail-neutral deployment above existing payment and agentic-commerce rails | Integration work required. Third-party names do not imply partnership or endorsement. | Product + Legal | Pending Legal Review | Add non-affiliation caveat near named brands. |
| MNNR-CLM-012 | No fabricated partnership claims | Rails Section | High | Public copy review; partnership status register; evidence for each named third-party status | Third-party references are used to describe potential integration or market context only | No partnership, sponsorship, or endorsement is implied unless expressly stated in a signed agreement. | Legal + Founder | Pending Legal Review | Required because page names many third parties. |
| MNNR-CLM-013 | Frankfurt residency / customer-facing data stored in eu-central-1 | EU Posture, Trust, A50 SKU | High | Cloud region screenshots; infrastructure config; backup-region evidence; logging-region evidence; subprocessor list; DPA | Customer-facing data hosted in eu-central-1 Frankfurt | Subprocessors, backups, logs, support systems, and model-provider routing may vary by customer configuration and DPA. | Security + Legal | Pending Evidence | Remove until fully verified. |
| MNNR-CLM-014 | Article 27 EU representative on file | EU Posture, FAQ, Footer | High | Executed Article 27 representative agreement; representative identity; address; scope; effective date | Article 27 EU representative appointed for applicable GDPR obligations | Applies only to the scope covered by the appointment and DPA. | Legal | Pending Evidence | Remove immediately if no executed appointment exists. |
| MNNR-CLM-015 | GDPR data residency | EU Posture, Trust | High | DPA; data-flow map; subprocessor list; hosting evidence; retention policy; lawful-basis analysis | Data-residency controls available for EU customer deployments | GDPR compliance depends on customer role, configuration, DPA, and processing context. | Legal + Security | Pending Evidence | Do not say GDPR compliant. |
| MNNR-CLM-016 | DORA ICT third-party risk reporting hooks | EU Posture | High | DORA control mapping; reporting workflow; incident export; customer role analysis | DORA-aligned ICT third-party risk reporting hooks under development | DORA obligations depend on customer status and contractual scope. | Legal + Product | Pending Evidence | Better as roadmap unless implemented. |
| MNNR-CLM-017 | eIDAS / EUDI Wallet compatibility | EU Posture | High | Technical design note; integration plan; standards mapping; counsel review | Designed to support identity-assurance routing compatible with the EUDI Wallet trajectory | No certification or formal eIDAS conformity claim unless separately verified. | Product + Legal | Pending Evidence | Keep as design trajectory only. |
| MNNR-CLM-018 | Post-quantum audit / ML-KEM-768 / ML-DSA signatures | Home, Crypto, Trust, Security Posture | High | Live keys; signed genesis attestation; code or vendor docs; cryptographic design note; third-party review if available | Post-quantum signing and key-encapsulation primitives under implementation using ML-KEM and ML-DSA | Not a third-party cryptographic audit unless independently reviewed. | Engineering + Security | Pending Evidence | Avoid quantum-safe by default unless proven and reviewed. |
| MNNR-CLM-019 | Quantum-safe by default | Home, Crypto, Security | High | Independent cryptographic review; complete implementation evidence; key lifecycle documentation | Remove or replace with: Post-quantum primitives are under implementation for selected audit functions | No current quantum-safety certification implied. | Security + Legal | Remove | High-risk phrase. |
| MNNR-CLM-020 | Bank-grade / BaFin/EBA-grade audit trail | Home, FAQ, Pillars | High | Control mapping to BaFin/EBA expectations; audit-log design; counsel review; external validation | Audit trail designed to support financial-services supervisory review | No regulator endorsement or certification implied. | Legal + Security | Reword | Avoid grade language unless externally validated. |
| MNNR-CLM-021 | Designed to satisfy BaFin, EBA, FDIC, and OCC supervisory scrutiny | Crypto/Pillars | High | Regulator-specific control matrix; counsel review; external audit or supervisory feedback | Designed to support supervisory audit review by regulated financial entities | No regulator approval, endorsement, or compliance determination implied. | Legal | Reword | Current wording is too aggressive. |
| MNNR-CLM-022 | SOC 2 Type I targeting Q4 2026 | Security Posture, Trust | High | Auditor engagement or readiness plan; control matrix; target date approval | SOC 2 Type I target: Q4 2026 | MNNR is not SOC 2 certified today. Target date is subject to readiness and auditor scope. | Security + Legal | Pending Evidence | Publish only if real target and plan exist. |
| MNNR-CLM-023 | ISO 27001 controls mapping in build / certification 2027 | Security Posture, Trust | High | ISO control map; internal ISMS plan; owner matrix; target timeline | ISO 27001 controls mapping in build | No ISO 27001 certification is currently claimed. | Security + Legal | Pending Evidence | Avoid track-to-certification unless resourced. |
| MNNR-CLM-024 | Encryption at rest AES-256, in transit TLS 1.3, optional CMEK | Security Posture, Trust | High | Cloud encryption config; TLS scan; KMS/CMEK architecture; security review | Encryption in transit and at rest implemented for covered systems | Exact configuration depends on deployment scope and customer tier. | Security + Engineering | Pending Evidence | Do not publish optional CMEK unless implemented. |
| MNNR-CLM-025 | NSPM-11 alignment / federal-ready posture | Federal Brief, Security Posture, Buyer Section | High | Primary source for NSPM-11; control mapping; federal sales/legal review | Federal-readiness controls under development for applicable agency use cases | No federal authorization, FedRAMP authorization, or government endorsement implied. | Legal + Product | Pending Evidence | Avoid unless source and mapping are complete. |
| MNNR-CLM-026 | FedRAMP path | Federal Brief, Trust, Buyer Section | High | FedRAMP readiness plan; hosting boundary; control baseline; resourcing plan | FedRAMP readiness path under evaluation | MNNR is not FedRAMP authorized. | Security + Legal | Pending Evidence | Do not imply authorization. |
| MNNR-CLM-027 | SDVOSB-eligible | Federal Brief, FAQ, Footer | High | Ownership documents; veteran-status documentation; eligibility analysis; certification status if any | Disabled veteran-owned company; SDVOSB eligibility under review | Eligibility is not certification. No government certification implied unless finalized. | Founder + Legal | Pending Evidence | Use certified only if certification exists. |
| MNNR-CLM-028 | SAM.gov registration in progress | Federal Brief, FAQ | High | SAM.gov workspace screenshot or registration evidence; UEI if assigned | SAM.gov registration in progress | Not registered or award-eligible until registration is active. | Founder + Ops | Pending Evidence | Remove if registration not started. |
| MNNR-CLM-029 | MNNR LLC, Wyoming domestic, formed 2025-02-26, EIN 33-3678186 | FAQ, Footer, SOW, Briefs | High | Wyoming filing; EIN letter; company records | MNNR LLC is a Wyoming domestic company founded in 2025 | EIN should be disclosed publicly only if counsel approves. | Founder + Legal | Pending Legal Review | Do not use MNNR GmbH unless a German entity exists. |
| MNNR-CLM-030 | All IP owned by MNNR LLC; no founder-side encumbrance | FAQ, SOW, Investor/Buyer Materials | High | IP assignment agreement; contributor agreements; repo ownership; trademark/domain ownership; no liens/encumbrances review | MNNR platform IP is owned or controlled by MNNR LLC | Subject to open-source licenses, third-party services, and customer agreements. | Legal | Pending Evidence | High diligence importance. |
| MNNR-CLM-031 | Direct founder access to TOHID NAEEM | Pilot Section | Low | Founder approval; support process | Pilot includes direct founder access during the agreed pilot term | Subject to pilot agreement and availability terms. | Founder | Approved with Caveat | Commercial claim, low legal risk. |
| MNNR-CLM-032 | Three EU design-partner slots, Q3 2026 | Pilot Section | Medium | Capacity plan; commercial strategy memo | Limited Q3 2026 design-partner cohort | Availability subject to qualification and signed pilot agreement. | Founder + Product | Pending Evidence | Scarcity must be real. |
| MNNR-CLM-033 | Live API and dashboard online | Hero, CTA, API Docs | High | Live endpoint; dashboard access; uptime evidence; test account; monitoring screenshot | API and dashboard available for controlled pilot access | Availability and functionality subject to pilot scope and access approval. | Engineering + Product | Pending Evidence | Do not imply public production availability unless true. |
| MNNR-CLM-034 | Compliance brief, EU brief, and federal brief are signed under MNNR LLC | Briefs Section | Medium | PDFs; signature block; version control; counsel review if legal/regulatory claims included | Buyer briefs are published by MNNR LLC | Briefs are informational and not legal advice. | Founder + Legal | Pending Legal Review | Each PDF needs its own claims pass. |
| MNNR-CLM-035 | Decorated disabled veteran-owned | Footer, FAQ, Federal Brief | Medium | Founder authorization; veteran/disability documentation if used for procurement; counsel review | Disabled veteran-owned | No certification, preference, or government endorsement implied unless separately stated and proven. | Founder + Legal | Pending Legal Review | Sensitive claim; use only with explicit approval. |

## Merge Gate

Before any claim goes live:

1. Assign Claim ID.
2. Add exact public wording.
3. Attach evidence.
4. **Legal** approves if claim touches law, regulation, certifications, government, insurance, privacy, data, or compliance.
5. **Security** approves if claim touches cryptography, uptime, hosting, encryption, auth, logs, incident response, or infrastructure.
6. **Product** approves if claim touches feature scope, delivery timeline, API behavior, demo, pricing, or pilot deliverables.
7. Status is set to Approved or Approved with Caveat.
8. Page copy uses only Approved Wording and Required Caveat.

## High-Risk Words Requiring Review (grep + flag)

Compliant · Certified · Approved · Bank-grade · Regulator-ready · Guaranteed ·
Production ready · Quantum-safe · Immutable · SOC 2 · ISO 27001 · FedRAMP ·
GDPR compliant · PSD3 compliant · PSR compliant · DORA compliant ·
Article 50 compliant · BaFin-grade · EBA-grade · FDIC-grade · OCC-grade ·
Government-ready · Federal-ready · No-risk · Fully secure

## Priority Removals / Rewords (do these first)

| Remove | Use |
|---|---|
| Article 50 compliant | Designed to support Article 50 transparency obligations |
| PSD3 compliant / PSR compliant | PSD3/PSR-aligned payment-governance controls |
| Quantum-safe by default | Post-quantum primitives under implementation for selected audit functions |
| Bank-grade audit | Audit trail designed to support financial-services supervisory review |
| Designed to satisfy BaFin, EBA, FDIC, and OCC supervisory scrutiny | Designed to support supervisory audit review by regulated financial entities |
| FedRAMP path (unless documented readiness plan) | FedRAMP readiness under evaluation |
| Article 27 EU representative on file (unless executed agreement exists) | Article 27 representative appointment under review |
| SOC 2 Type I target (unless auditor/readiness plan exists) | SOC 2 readiness planning in progress |
| MNNR GmbH (unless German company formed) | MNNR LLC |
