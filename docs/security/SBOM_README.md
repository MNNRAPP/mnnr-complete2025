# MNNR SBOM + SUPPLY-CHAIN SCAN — 2026-06-20

## SCOPE OF THIS SANDBOX RUN

The Claude sandbox cannot reach `github.com/MNNRAPP/mnnr-complete2025` for a fresh clone (network egress + private-repo auth not available in the bash sandbox), so this run produced:

1. **Sample SBOM** — `20260620_mnnr_complete2025_sample_sbom.cdx.json` — generated from a stand-in `package.json` (Next 14.2.5, React 18.3.1, Stripe 15.10.0, Zod 3.23.8, jsonwebtoken 9.0.2) + `requirements.txt` (FastAPI 0.111.0, uvicorn 0.30.1, pydantic 2.7.1, cryptography 42.0.8). This is the *shape* the full SBOM will take; the actual SBOM must be regenerated locally before publication.

2. **Grype scan attempt** — Grype installed successfully (`/tmp/bin/grype`) but the vulnerability DB cannot download in the sandbox (firewall on anchore.io). See `20260620_grype_vulnerability_report.txt`.

3. **Trivy / Semgrep** — install processes timed out at the sandbox 45-second wall-clock. Run locally per "PHASE 2 LOCAL EXECUTION" below.

---

## PHASE 2 — LOCAL EXECUTION (Tohid runs this on the laptop)

```powershell
# From C:\Users\pusse\mnnr-complete2025
cd C:\Users\pusse\mnnr-complete2025

# 1. Generate the canonical SBOM
syft dir:. -o cyclonedx-json > sbom.cdx.json

# 2. Vuln scan
grype sbom:sbom.cdx.json -o table > grype_report.txt
grype sbom:sbom.cdx.json -o json > grype_report.json

# 3. Filesystem scan (catches container / lock-file vulns syft might miss)
trivy fs . --severity HIGH,CRITICAL --format table > trivy_report.txt

# 4. Code-level SAST
semgrep --config=auto --json -o semgrep_report.json
semgrep --config=auto --severity ERROR --severity WARNING

# 5. Publish SBOM (PR-ready)
cp sbom.cdx.json public/sbom.cdx.json
cp sbom.cdx.json public/security/sbom.cdx.json
```

## PHASE 3 — NEXT.JS API ROUTE PATCH (PR-ready, NOT pushed)

Create `app/security/sbom.cdx.json/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";
export const revalidate = 86400; // 24h

export async function GET() {
  const path = join(process.cwd(), "public", "sbom.cdx.json");
  const body = await readFile(path, "utf-8");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "application/vnd.cyclonedx+json; version=1.5",
      "cache-control": "public, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
```

Plus the equivalent route at `app/sbom.cdx.json/route.ts` and a static fallback at `public/sbom.cdx.json` (for Cloudflare edge serving without a Worker round-trip).

## PHASE 4 — CI INTEGRATION (PR-ready, NOT pushed)

`.github/workflows/sbom.yml`:

```yaml
name: SBOM Build + Vuln Scan
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  schedule: [ { cron: "0 6 * * *" } ]   # 6 AM UTC daily
permissions: { contents: read, security-events: write }
jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anchore/syft-action@v0
        with: { format: cyclonedx-json, output-file: sbom.cdx.json }
      - uses: anchore/grype-action@v0
        with: { sbom: sbom.cdx.json, fail-on: high, output-format: sarif }
      - uses: aquasecurity/trivy-action@master
        with: { scan-type: fs, severity: HIGH,CRITICAL, format: sarif, output: trivy.sarif }
      - uses: github/codeql-action/upload-sarif@v3
        with: { sarif_file: grype.sarif }
      - uses: actions/upload-artifact@v4
        with: { name: sbom, path: sbom.cdx.json }
```

## FILES IN THIS DIRECTORY

| File | Source | Use |
|---|---|---|
| `20260620_mnnr_complete2025_sample_sbom.cdx.json` | syft v1.x against /tmp/mnnr_sample | shape reference; replace with local run |
| `20260620_grype_vulnerability_report.txt` | grype sbom: (DB unavailable in sandbox) | placeholder; rerun locally |
| `20260620_SBOM_README.md` | this file | execution + publication plan |

## SUPPLY-CHAIN POSTURE GAPS (DERIVED FROM ON-DISK SNYK CISO EVAL)

Per the user-provided Snyk CISO scorecard (14 STRONG / 4 PARTIAL / 3 GAP / 7 N/A):
- **3 GAPs** to close before SOC 2 Type I:
  1. SBOM publication at /security/sbom.cdx.json — addressed by Phase 3 above
  2. CAA DNS records — addressed in §1.5 of the security sweep report
  3. SLSA provenance attestation — add `actions/attest-build-provenance@v1` to `sbom.yml` for Phase 4 v2
- **4 PARTIALs** to upgrade to STRONG:
  1. Dependency review gating on PR — add `dependency-review-action@v4` to a separate workflow
  2. Container base image scanning — `trivy image` in CI (not just fs)
  3. Secret scanning baseline — `trufflehog` weekly cron
  4. License compliance — `syft attest` + `cosign verify` pair

