# REVOCATION NOTICE — 2026-06-08 Genesis Keys

**Key ID:** `mnnr-genesis-2026-06-08`  
**Status:** REVOKED  
**Revoked on (UTC):** 2026-06-10T06:37:25+00:00  
**Superseded by:** `mnnr-genesis-2026-06-09` (active root of trust)

## Revoked fingerprints (SHA-256)

| Algorithm   | SHA-256 of public key                                              |
|-------------|--------------------------------------------------------------------|
| ML-DSA-65   | `4ecb7ee3894447d96e11b732c559851e1073c926a248ed1df13f1fdc8722cde9` |
| ML-KEM-768  | `e5fbccc68b4f7464187f98fea47571808e1edf9c3979ba3004f2dc75380e60fa` |

## Reason for revocation

The initial 2026-06-08 genesis keypairs were generated into a Microsoft OneDrive–synced folder. The corresponding private keys were therefore exposed to OneDrive cloud storage rather than held exclusively on a local non-synced path. This is a custody mismatch: the root-of-trust private keys were touched by infrastructure outside MNNR LLC's direct control.

Per a precautionary security posture, the 2026-06-08 keys are treated as **compromised** and have been rotated. Any signature produced under the 2026-06-08 ML-DSA-65 private key is **no longer trusted** as of the revocation timestamp above. The 2026-06-08 ML-KEM-768 public key must **not** be used for any new key-encapsulation operations.

## Replacement keys

The replacement 2026-06-09 keys are generated on a non-synced local path:

- Path: `C:\ProgramData\mnnr_oursly_pq_keys\`
- NTFS ACL: read/write restricted to TOHID NAEEM + SYSTEM only
- Custody: held by TOHID NAEEM personally as founder of MNNR LLC
- HSM migration: on the published roadmap

The active 2026-06-09 attestation explicitly cross-references this revocation in its `rotation.supersedes_key_id` field — see `keys/active/2026-06-09/genesis-attestation.canonical.json`.

## Audit-trail preservation

The deprecated public keys, the deprecated attestation JSON, and the signature produced under the deprecated ML-DSA-65 private key are kept in this archive so that:

1. Any third party can reproduce the deprecated fingerprints from the actual key bytes and confirm the rotation chain matches what the active attestation declares.
2. The historical claim that a 2026-06-08 attestation was once published is independently verifiable, even though the signature is no longer trusted.

No new signing or encryption operations may be performed under these keys.

— TOHID NAEEM, Founder, MNNR LLC
