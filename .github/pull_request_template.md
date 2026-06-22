<!-- Describe the change. -->

## Summary



## Claims Register check (REQUIRED for public-facing changes)

Does this PR add or modify public-facing language about any of: compliance,
security, legal, regulatory, certification, hosting, uptime, insurance,
government, buyer-traction, cryptographic, or production-readiness claims?

High-risk words that trigger this gate include: `Compliant`, `Certified`,
`Approved`, `Bank-grade`, `Regulator-ready`, `Guaranteed`, `Production ready`,
`Quantum-safe`, `Immutable`, `SOC 2`, `ISO 27001`, `FedRAMP`, `GDPR compliant`,
`PSD3 compliant`, `PSR compliant`, `DORA compliant`, `Article 50 compliant`,
`BaFin-grade`, `EBA-grade`, `Government-ready`, `Federal-ready`, `Fully secure`.

- [ ] **No** — this PR adds no such public-facing claims.
- [ ] **Yes** — each claim maps to an Approved (or Approved with Caveat) row in
      [`claims_register.md`](../claims_register.md), and the page copy uses only
      that row's Approved Wording + Required Caveat.

**Claims Register row IDs** (e.g. `MNNR-CLM-001`, `MNNR-CLM-018`): ___________

> Per the register's merge gate, no claim merges to a public surface unless its
> row is Approved/Approved with Caveat and the owning function (Legal / Security /
> Product) has signed off.
