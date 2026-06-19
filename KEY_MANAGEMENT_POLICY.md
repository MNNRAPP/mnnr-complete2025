# Key Management Policy

**Repository:** `mnnr-complete2025`
**Owner:** MNNR LLC / Silicon Hills PR
**Version:** 1.0
**Effective:** 2026-06-19
**Review cadence:** Quarterly + on-demand

This policy governs the generation, custody, rotation, revocation, and audit of
every cryptographic key, secret, and credential used by `mnnr.app` and its
deployed surfaces (web app, iOS/Android, edge workers, payment receivers).

It supersedes informal practices documented in earlier `SECRET_ROTATION_PLAN.md`
and `SECURITY_REMEDIATION_COMPLETE.md` reports. Where this policy conflicts
with those documents, this policy controls.

---

## 1. Scope — keys and secrets covered

| Category | Examples | Threat model |
|---|---|---|
| **TLS / certificate keys** | Cloudflare Origin Cert private keys, custom-domain TLS keys | Server impersonation, MITM |
| **Session-signing secrets** | `CSRF_SECRET`, JWT signing secret, `AUDIT_TRAIL_SECRET` | Session forgery, audit-log tampering |
| **Database encryption keys** | `DB_ENCRYPTION_KEY` (column-level), Neon backup encryption | Data exfiltration |
| **Third-party API keys** | Stripe `sk_live_*`, Anthropic `sk-ant-*`, OpenAI `sk-*`, Resend `re_*`, Upstash REST tokens, Sentry DSN, Turnstile secret | Credential abuse, billing fraud |
| **x402 payment-receiver keys** | EVM private keys for `X402_RECEIVER_ADDRESS` on Mainnet / Base / Polygon | Theft of inbound on-chain payments |
| **MNNR treasury keys** | `MNNR_BASE_ADDRESS`, `MNNR_ETH_ADDRESS`, `MNNR_POLYGON_ADDRESS` (private-key custody) | Loss of treasury assets |
| **Post-quantum keys** | ML-KEM-768 KEM keypairs, ML-DSA-65 signing keypairs (used by the `/crypto` surface) | PQ-era data harvest / signature forgery |
| **Webhook secrets** | `STRIPE_WEBHOOK_SECRET`, any inbound webhook HMAC keys | Replay, forged event injection |
| **OAuth client secrets** | Clerk, Supabase service-role, any future OAuth-provider configs | Account takeover, lateral access |

---

## 2. Custody model — where each key lives

| Key class | Primary store | Backup | Who can read |
|---|---|---|---|
| TLS private keys | Cloudflare (managed) | n/a (regenerable) | Cloudflare-account admins only |
| Session secrets (`CSRF_SECRET`, `AUDIT_TRAIL_SECRET`) | Vercel encrypted env vars (production scope) | 1Password vault `mnnr-prod-secrets` | Production deployers only |
| `DB_ENCRYPTION_KEY` | Vercel env vars (production scope) + Neon vault | 1Password vault, sealed envelope (offline) | Owner + one designated successor |
| Third-party API keys (Stripe live, Anthropic, OpenAI, Resend) | Vercel env vars (production scope) | 1Password vault | Owner |
| Stripe test keys | Vercel env vars (preview scope) | 1Password vault | Owner + dev contractors |
| Upstash REST tokens, Sentry DSN, Turnstile secret | Vercel env vars (production + preview) | 1Password vault | Owner + dev contractors |
| **x402 payment-receiver private keys** | **Hardware wallet (Ledger / Trezor) — air-gapped** | **Steel backup of 24-word seed in physical safe** | **Owner only; no cloud copy ever** |
| **MNNR treasury keys** | **Hardware wallet — separate device from x402 receivers** | **Steel backup, separate safe location** | **Owner only** |
| ML-KEM / ML-DSA keypairs (long-lived) | Vercel env vars (encrypted) + OneDrive sealed envelope (encrypted backup) | Offline encrypted backup on 2× independent USB tokens stored in separate physical locations | Owner only |
| ML-KEM / ML-DSA keypairs (ephemeral, per-session) | In-memory only, never persisted | n/a | n/a |
| Webhook HMAC secrets | Vercel env vars | 1Password vault | Owner |

**Hard rules:**

- **No private keys in git.** Verified by GitHub Secret Protection + pre-commit
  scan. Push protection enabled per `SECURITY_SETUP_COMPLETE.md`.
- **No payment-receiver private keys in any cloud env-var store, ever.** Only
  the public address (`X402_RECEIVER_ADDRESS`) lives in Vercel. Signing happens
  off-chain via hardware wallet for any treasury motion.
- **No service-role keys in `NEXT_PUBLIC_*` env vars.** Enforced at startup by
  `lib/env.ts`.
- **No long-lived secrets in OneDrive-synced folders without an encrypted
  envelope.** A prior incident (genesis ML-KEM keys stored unencrypted in a
  synced folder — see `/crypto` page transparency disclosure) is the reason
  this policy exists.

---

## 3. Generation procedure

### 3.1 Standard secrets (HMAC, session, webhook)

- Generated via `openssl rand -base64 48` (≥ 256 bits of entropy).
- Generated on a trusted local machine, never on shared CI.
- Inserted into Vercel via `vercel env add` (CLI) or the dashboard. Never via
  shell history (use `--sensitive` flag or paste-into-prompt).

### 3.2 x402 / treasury keys (HIGH VALUE)

Formal key ceremony, performed offline:

1. Generate on an air-gapped device (factory-reset, no network, no peripherals).
2. Use a hardware wallet (Ledger / Trezor) with verified-firmware-only path.
3. Witness: owner + one designated successor (named in policy `addendum-A`).
4. Record-on-paper: public address only. Private key / seed phrase never
   touches any digital surface beyond the wallet itself.
5. 24-word seed → engraved on stainless-steel backup plate, stored in fire-
   and water-resistant safe at a physical address NOT colocated with the
   primary residence.
6. Test transaction (≤ $1 equivalent) before declaring the address production.
7. Ceremony log: date, witnesses, ceremony device serial, hardware-wallet
   serial, derivation path, first 4 + last 4 chars of the public address.
   Stored in `KEY_CEREMONY_LOG.md` (committed to a private successor-access
   repo, NOT to this public repo).

### 3.3 Post-quantum keys (ML-KEM-768, ML-DSA-65)

- Generated using the same library and parameters disclosed on the `/crypto`
  page (FIPS 203 / FIPS 204 per NIST PQC standards).
- For long-lived keys: generated on an air-gapped machine, encrypted at rest
  with a passphrase ≥ 24 ASCII random characters.
- For per-session ephemeral keys: generated in-process, used once, discarded.

**Minimum entropy floors:**
- HMAC / session secrets: 256 bits (`openssl rand -base64 48`).
- ML-KEM-768: NIST-prescribed parameters (no custom RNG).
- EVM private keys: hardware-wallet-generated only (no manual entropy).

---

## 4. Rotation schedule

| Key | Cadence | Trigger |
|---|---|---|
| `CSRF_SECRET`, `AUDIT_TRAIL_SECRET` | Annual | Calendar-driven; or on compromise |
| `DB_ENCRYPTION_KEY` | Every 2 years (with reencryption-of-rest plan) | Calendar-driven; or on compromise |
| Stripe live keys | On-demand (Stripe rolling), at minimum annually | Stripe alert, anomalous activity |
| Anthropic / OpenAI / Resend / Upstash / Sentry / Turnstile | Annual or on-demand | Vendor compromise notice, departure of human with read access |
| **x402 payment-receiver private keys** | **NEVER — addresses are immutable. To "rotate", deploy a new address + sunset the old** | **Compromise: immediate sweep to cold wallet + new address provisioning** |
| **MNNR treasury keys** | **As above — replace, do not rotate** | **Compromise: immediate sweep + new wallet** |
| ML-KEM / ML-DSA long-lived keys | Every 3 years (or when a new NIST recommendation supersedes the current parameter set) | NIST advisory, library CVE |
| TLS certs | Cloudflare-managed auto-renewal | n/a (managed) |
| Webhook HMAC secrets | Annual | Cadence + on compromise |

Rotation events are logged in `ROTATION_LOG.md` (private successor repo) with:
date, key class, old-key-hash (first 8 chars of SHA-256), new-key-hash, reason,
operator name.

---

## 5. Revocation procedure

1. **Decide.** Owner (or designated successor in owner's absence) makes the
   call. No other party may unilaterally revoke without owner sign-off, except
   in the emergency-compromise path (§7).
2. **Revoke at source.** Stripe, Anthropic, OpenAI, Resend, Upstash, Sentry,
   Turnstile, Clerk, Supabase — log into the vendor dashboard and revoke /
   delete the credential.
3. **Remove from Vercel.** `vercel env rm <KEY> production`. Confirm the
   removal in the Vercel dashboard.
4. **Trigger redeploy** with the new key (if a replacement was provisioned)
   or with the key absent (if the integration is being sunset).
5. **Verify in production.** Hit a route that exercises the integration;
   confirm a clean 200 (with new key) or expected fail-closed behavior
   (without).
6. **Log.** Append to `ROTATION_LOG.md`: revoked-at timestamp, reason,
   operator, replacement-key fingerprint (if any).
7. **Notify** any third party that had the old credential (e.g. dev
   contractor offboarding).

For x402 / treasury keys: a revocation IS a treasury sweep — there is no
"revoke this private key" with EVM addresses. Sweep all funds to a freshly
generated cold address, then publish the new public receiver in
`X402_RECEIVER_ADDRESS_*` env vars.

---

## 6. Signer separation — no single human can both issue and verify

Operational gates:

- **Code-deploy gate:** `main` branch is protected; merges require a PR.
  Owner can self-merge only on solo-maintained repos (current state) but
  every merge must reference an issue or commit message with rationale.
- **Treasury motion gate:** Any movement of treasury assets > $250 USD
  equivalent requires either (a) a second human witness present in real-time
  for the hardware-wallet signing, OR (b) a 24-hour delay between intent
  declaration (text/email to a known successor) and execution. This is a
  process control, not a multisig (yet — see §10 future-work).
- **Audit-log gate:** `AUDIT_TRAIL_SECRET` and the audit-log read path are
  managed by different code paths. Tampering requires both rotating the
  HMAC and rewriting historical records.

---

## 7. Emergency-compromise procedure

### 7.1 Detection signals

- Vendor email / dashboard alert (Stripe radar, Sentry abuse spike, Upstash
  rate-limit anomaly).
- Sudden spike in 401 / 403 from a downstream API → key may be in use
  elsewhere.
- Public disclosure (GitHub Secret Protection alert, security@mnnr.app
  inbound).
- Unexpected on-chain transfer from any x402 receiver or treasury address.

### 7.2 Kill-switch process (T+0 to T+1 hour)

1. **Revoke** the suspect credential at the vendor (§5 step 2).
2. **Remove** from Vercel (§5 step 3) — fail-closed is preferred over
   fail-open while the incident is unfolding.
3. **For x402/treasury compromise:** initiate cold-wallet sweep IMMEDIATELY.
   Speed matters more than perfect cleanup.
4. **Force a redeploy** to flush the in-memory secret from any running
   serverless instance.
5. **Open a private incident channel** (Gmail thread `siliconhillspr@gmail.com`
   tagged `INC-YYYYMMDD`).

### 7.3 Triage (T+1 to T+24 hours)

1. Search GitHub history (`git log -p -S '<partial-secret>'`) to confirm the
   secret was not committed to git. If it was: `git filter-repo` is
   insufficient — assume the secret is permanently public, treat as fully
   compromised.
2. Review audit logs (Stripe, Vercel, Cloudflare, Sentry) for the window the
   secret may have been exposed.
3. Identify blast radius — what data / funds / capabilities did the
   credential grant?

### 7.4 Customer notification

Required if ANY of the following are true:
- Customer PII was readable using the compromised credential.
- Customer-paid funds were lost / redirected.
- A regulatory disclosure rule applies (GDPR breach notice, CCPA notice,
  state breach-notification statutes — California Civ. Code §1798.82).

Notification: email to affected customers + posted incident notice at
`mnnr.app/incident/INC-YYYYMMDD`, within statutory windows (CA: "in the most
expedient time possible and without unreasonable delay").

If no customer impact: an internal `INCIDENT_REPORT.md` is logged; no public
notification required.

---

## 8. Audit trail requirements

Every key-management action produces a permanent record:

| Action | Logged where | Required fields |
|---|---|---|
| Key generation | `KEY_CEREMONY_LOG.md` (private repo) | Date, operator, witnesses, key class, public identifier (address / fingerprint / first-8-hash) |
| Rotation | `ROTATION_LOG.md` (private repo) | Date, key class, old-key-hash, new-key-hash, reason, operator |
| Revocation | `ROTATION_LOG.md` | Date, key class, hash, reason, operator, replacement-or-sunset |
| Compromise incident | `INCIDENT_REPORT.md` (private repo) | Detection signal, timeline, blast radius, remediation, customer-notice status |
| Emergency access | `EMERGENCY_ACCESS_LOG.md` | Date, who accessed, what they accessed, why |

These logs are append-only (enforced by repo branch-protection on the private
successor repo). Retention: indefinite.

---

## 9. Inspection + verification

- **Quarterly self-audit:** owner walks the env-var inventory in Vercel
  against `lib/env.ts` and this policy. Reconcile drift.
- **Annual external check:** if a security contractor is engaged, this policy
  is the artifact handed over.
- **Pre-commit scan:** `gitleaks` or equivalent runs against staged diffs.

---

## 10. Future work / known gaps

Documented honestly because gaps that aren't documented can't be closed:

1. **No multisig on treasury wallets yet.** Single hardware-wallet custody +
   process delay. Migration to a 2/3 multisig (Safe / Squads) is a Q3-26
   item.
2. **No HSM for HMAC secrets.** Vercel encrypted env vars + 1Password is
   sufficient for current scale; a true HSM (AWS KMS, GCP KMS) is on the
   roadmap when scale or compliance demands it.
3. **No automated rotation tooling.** Rotations are calendar-driven and
   manual. Tooling (Vercel API + scripted rollover) is a stretch goal.
4. **No formal CODEOWNERS-style sign-off for env-var changes** — currently
   a solo-owner repo. Adding a second signer for treasury motions (§6) is
   the first step toward fixing this.

---

## 11. Related documents

- [`SECURITY.md`](./SECURITY.md) — responsible disclosure + contact.
- [`SECURITY_SETUP_COMPLETE.md`](./SECURITY_SETUP_COMPLETE.md) — GitHub-side
  security configuration (branch protection, Dependabot, CodeQL, Secret
  Protection).
- [`lib/env.ts`](./lib/env.ts) — production env-var schema + validation.
- `/crypto` page on `mnnr.app` — public transparency surface for ML-KEM /
  ML-DSA key handling.

---

*Last reviewed: 2026-06-19. Next scheduled review: 2026-09-19.*
