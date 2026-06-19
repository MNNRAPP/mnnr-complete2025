# mnnr.app Cryptographic Audit Archive

This directory is the audit-trail archive for mnnr.app post-quantum cryptographic keys and signed genesis attestations. It exists so that the live `https://mnnr.app/crypto/` landing page can stay focused on the **active** keys (publishing fingerprints + the active public keys + the active genesis attestation), while still keeping the full history of prior key material publicly verifiable for any third party that needs to validate the rotation chain.

## Why this archive exists

On 2026-06-19, an external auditor reviewed the live `/crypto/` page and flagged that publishing the full deprecated key material inline "may attract unnecessary attention." This archive resolves that observation: the deprecated key bytes and the deprecated attestation signature are moved here, and the live page links to this archive by fingerprint.

The archive contains **public** cryptographic material only — public keys, signed attestations, and signatures. **No private key material is, or will ever be, stored here.** Private keys are held off-cloud per the genesis-attestation custody declaration.

## Layout

```
keys/
├── active/
│   └── 2026-06-09/
│       ├── ml-dsa-65.pub                        ← Active ML-DSA-65 public key (raw bytes)
│       ├── ml-kem-768.pub                       ← Active ML-KEM-768 public key (raw bytes)
│       ├── genesis-attestation.json             ← Pretty-printed attestation
│       ├── genesis-attestation.canonical.json   ← Canonicalized bytes that were signed
│       └── genesis-attestation.sig.b64          ← ML-DSA-65 detached signature, base64
└── deprecated/
    └── 2026-06-08/
        ├── ml-dsa-65.pub                        ← REVOKED — see REVOCATION_NOTICE.md
        ├── ml-kem-768.pub                       ← REVOKED — see REVOCATION_NOTICE.md
        ├── genesis-attestation.json             ← Pretty-printed (no longer trusted)
        ├── genesis-attestation.canonical.json   ← Canonicalized (no longer trusted)
        ├── genesis-attestation.sig.b64          ← Signature under revoked key (do not trust)
        └── REVOCATION_NOTICE.md                 ← Signed revocation explanation
FINGERPRINTS.md                                  ← SHA-256 of every file in keys/
```

## Rotation history

| Generation | Key ID                        | Issued       | Status     | Reason                                                                                                |
|------------|-------------------------------|--------------|------------|-------------------------------------------------------------------------------------------------------|
| 1          | `mnnr-genesis-2026-06-08`     | 2026-06-08   | **REVOKED** | Private keys generated into a OneDrive-synced folder — custody outside MNNR LLC's direct control. Treated as compromised. See `keys/deprecated/2026-06-08/REVOCATION_NOTICE.md`. |
| 2          | `mnnr-genesis-2026-06-09`     | 2026-06-09   | **ACTIVE**  | Generated into `C:\ProgramData\mnnr_oursly_pq_keys\` (non-synced, NTFS ACL: TOHID NAEEM + SYSTEM only). Current root of trust for all governance-layer signatures. |

## Verifying the rotation chain

The deprecated key files in this archive are preserved so that any third party can independently confirm the deprecated fingerprints quoted on the live page are reproducible from the actual key bytes:

```bash
# Reproduce the deprecated ML-DSA-65 fingerprint
curl -sS https://raw.githubusercontent.com/MNNRAPP/mnnr-complete2025/main/crypto-audit-archive/keys/deprecated/2026-06-08/ml-dsa-65.pub | sha256sum
# expected: 4ecb7ee3894447d96e11b732c559851e1073c926a248ed1df13f1fdc8722cde9

# Reproduce the deprecated ML-KEM-768 fingerprint
curl -sS https://raw.githubusercontent.com/MNNRAPP/mnnr-complete2025/main/crypto-audit-archive/keys/deprecated/2026-06-08/ml-kem-768.pub | sha256sum
# expected: e5fbccc68b4f7464187f98fea47571808e1edf9c3979ba3004f2dc75380e60fa
```

For the active keys, the canonical verifier recipes are on `https://mnnr.app/crypto/#verify`.

## Trust anchor

MNNR LLC · Wyoming domestic · EIN 33-3678186 · formed 2025-02-26  
Founder: TOHID NAEEM · Principal place of business: Silicon Hills, California  
Decorated disabled veteran-owned
