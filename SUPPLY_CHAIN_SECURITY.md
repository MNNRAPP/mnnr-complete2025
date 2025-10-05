# Supply Chain Security Guide

## Overview

This guide covers best practices and tools for securing the software supply chain, protecting against dependency confusion attacks, malicious packages, and compromised dependencies. All recommendations focus on FREE and open-source solutions.

---

## Table of Contents

1. [Dependency Management](#1-dependency-management)
2. [Package Verification](#2-package-verification)
3. [Lock File Security](#3-lock-file-security)
4. [Build Pipeline Security](#4-build-pipeline-security)
5. [Secrets Management](#5-secrets-management)
6. [Code Signing](#6-code-signing)
7. [SBOM (Software Bill of Materials)](#7-sbom-software-bill-of-materials)
8. [Audit Trail](#8-audit-trail)
9. [Incident Response](#9-incident-response)

---

## 1. Dependency Management

### Current Status

**Package Manager:** npm  
**Lock File:** package-lock.json ✅  
**Audit Tool:** npm audit ✅  
**Dependency Count:** 453 packages  

### Best Practices

#### ✅ Use Lock Files (IMPLEMENTED)

**Why:** Ensures deterministic builds, prevents automatic updates

```bash
# Always commit lock files
git add package-lock.json
```

**What's Protected:**
- Exact versions installed
- Dependency tree structure
- Integrity hashes (SHA-512)

#### ✅ Automated Dependency Updates (IMPLEMENTED)

Using Dependabot (`.github/dependabot.yml`):
- Weekly scans for updates
- Automatic PR creation
- Security updates prioritized
- Grouped minor/patch updates

#### ✅ Dependency Audit (IMPLEMENTED)

Automated in CI/CD (`.github/workflows/security-audit.yml`):
- Runs on every push
- Fails on high/critical vulnerabilities
- Weekly scheduled scans

### Additional Recommendations

#### 1. Dependency Pinning Strategy

**Current Approach:**
```json
{
  "@supabase/ssr": "^0.7.0",  // Allows minor updates
  "next": "14.2.33"            // Exact version
}
```

**Recommendation for Critical Packages:**
```json
{
  "next": "14.2.33",           // Pin exact version
  "stripe": "14.25.0",         // Pin exact version
  "@supabase/supabase-js": "2.43.4"  // Pin exact version
}
```

**Why:** Critical packages (payment, auth, framework) should have controlled updates

#### 2. Dependency Review

**Before Adding New Dependency, Check:**
- [ ] Package popularity (npm downloads/week)
- [ ] Last updated date (<1 year old)
- [ ] Number of maintainers (>1 preferred)
- [ ] Open issues/PRs (active maintenance)
- [ ] Security advisories (0 high/critical)
- [ ] License compatibility (MIT, Apache 2.0, ISC)
- [ ] Bundle size impact

**Tools:**
- [npm trends](https://npmtrends.com/) - Compare packages
- [bundlephobia](https://bundlephobia.com/) - Check bundle size
- [snyk advisor](https://snyk.io/advisor/) - Security score
- [npms.io](https://npms.io/) - Package quality score

#### 3. Minimize Dependencies

**Current Stats:**
- Direct dependencies: 16
- Dev dependencies: 13
- Total (including transitive): 453

**Strategy:**
- ✅ Avoid micro-packages (already doing well)
- ✅ Use platform features when possible (Node.js crypto vs library)
- ⚠️ Consider replacing large packages with lighter alternatives

**Example:**
```typescript
// Instead of lodash (24KB)
import _ from 'lodash';
_.debounce(fn, 100);

// Use native or lightweight alternative
function debounce(fn: Function, delay: number) { /* 3 lines */ }
```

---

## 2. Package Verification

### NPM Package Integrity

#### SHA-512 Hashes (Automatic)

npm automatically verifies package integrity using SHA-512 hashes stored in `package-lock.json`:

```json
{
  "next": {
    "version": "14.2.33",
    "integrity": "sha512-xxx...xxx"
  }
}
```

**Protection:** Ensures downloaded package matches published package

#### Verify Package Signatures

Some packages are signed with npm signatures:

```bash
# Check if package has signatures
npm audit signatures

# Expected output: all packages verified
```

**Setup:** No configuration needed, npm handles automatically

### Source Code Verification

#### 1. Review Dependency Changes

In GitHub PRs from Dependabot:
```bash
# View package diff
npm diff next@14.2.3 next@14.2.33

# Check for suspicious changes
- New network calls
- New file system access
- Obfuscated code
- Eval usage
```

#### 2. Check Package Provenance

npm provenance (available for packages published from GitHub Actions):

```bash
npm view next --json | jq .dist.attestations
```

**What to look for:**
- ✅ Published from official GitHub repo
- ✅ Built from tagged release
- ✅ Signed build attestation

---

## 3. Lock File Security

### Best Practices

#### ✅ Always Commit Lock Files (IMPLEMENTED)

```bash
# Verify lock file is tracked
git ls-files | grep package-lock.json
```

#### ⚠️ Protect Lock Files from Tampering

Add to `.github/workflows/verify-lockfile.yml`:

```yaml
name: Verify Lock File

on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Verify lock file integrity
        run: |
          npm ci
          # Regenerate lock file
          rm package-lock.json
          npm install --package-lock-only
          # Compare with committed version
          git diff --exit-code package-lock.json
```

**Protection:** Detects manual tampering or merge conflicts in lock file

#### Lock File Review in PRs

For Dependabot PRs:
1. Check which packages changed
2. Verify expected versions
3. Review transitive dependency updates
4. Check for suspicious package additions

---

## 4. Build Pipeline Security

### GitHub Actions Security

#### ✅ Secure Workflow Configuration (IMPLEMENTED)

Current security measures:
- ✅ Pinned action versions (uses: `actions/checkout@v4`)
- ✅ Minimal permissions
- ✅ No secrets in logs

#### Hardening Recommendations

**1. Pin Actions to SHA (Most Secure)**

Instead of:
```yaml
uses: actions/checkout@v4
```

Use:
```yaml
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

**Why:** Prevents tag tampering attacks

**2. Use Dependabot for Actions**

Already configured in `.github/dependabot.yml` ✅

**3. Enable Branch Protection**

GitHub Settings → Branches → Add rule:
- ✅ Require pull request reviews (1+ reviewer)
- ✅ Require status checks (CI must pass)
- ✅ Require signed commits
- ✅ Include administrators

**4. Audit Workflow Permissions**

Minimize permissions in workflows:
```yaml
permissions:
  contents: read      # Only read access
  pull-requests: write  # Only what's needed
```

### Build Reproducibility

#### 1. Use Containerized Builds

For critical builds, use Docker:

```dockerfile
# Dockerfile.build
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
```

**Benefits:**
- Consistent build environment
- Isolated from host system
- Reproducible builds

#### 2. Verify Build Outputs

Add to CI:
```bash
# Generate build hash
sha256sum .next/**/*.js > build-manifest.txt

# Store as artifact for verification
```

---

## 5. Secrets Management

### Current Status

**Storage:** Environment variables (Vercel, GitHub Secrets)  
**Rotation:** Manual  
**Audit:** No logging  

### Recommendations

#### 1. Use Secrets Vault (FREE Tier)

**Option A: Infisical (FREE)**
- Unlimited secrets
- Automatic syncing
- Version history
- Access logs

**Setup:**
```bash
npm install @infisical/sdk

# In code:
import { InfisicalClient } from '@infisical/sdk';

const client = new InfisicalClient({
  siteUrl: 'https://app.infisical.com',
  auth: {
    universalAuth: {
      clientId: process.env.INFISICAL_CLIENT_ID,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET
    }
  }
});

const secrets = await client.listSecrets({
  environment: 'production',
  projectId: 'your-project-id'
});
```

**Option B: HashiCorp Vault (FREE, Self-Hosted)**
- Open source
- Rich feature set
- Requires server

#### 2. Secrets Scanning

**GitHub Secret Scanning (FREE)**
- Automatic scanning for exposed secrets
- Partner patterns (Stripe, AWS, etc.)
- Push protection

**Enable:**
GitHub Settings → Security → Secret scanning → Enable

**TruffleHog (FREE)**
Already configured in `.github/workflows/security-audit.yml` ✅

#### 3. Secrets Rotation Policy

**Recommended Schedule:**
- Stripe webhook secret: Quarterly
- Supabase service role key: Semi-annually
- API keys: Quarterly
- Encryption keys: Annually

**Automation:**
Create `scripts/rotate-secrets.sh`:
```bash
#!/bin/bash

echo "Secrets Rotation Checklist"
echo "=========================="
echo ""
echo "[ ] 1. Generate new Stripe webhook secret"
echo "[ ] 2. Update STRIPE_WEBHOOK_SECRET in Vercel"
echo "[ ] 3. Update webhook in Stripe dashboard"
echo "[ ] 4. Verify webhooks work"
echo "[ ] 5. Monitor for errors (24 hours)"
echo "[ ] 6. Document rotation in audit log"
echo ""
echo "Last rotation: $(date)"
```

---

## 6. Code Signing

### Commit Signing (FREE)

#### Setup GPG Key

```bash
# Generate GPG key
gpg --full-generate-key

# List keys
gpg --list-secret-keys --keyid-format=long

# Export public key
gpg --armor --export YOUR_KEY_ID

# Add to GitHub
# Settings → SSH and GPG keys → New GPG key
```

#### Configure Git

```bash
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

#### Verify Signed Commits

```bash
git log --show-signature
```

**Benefits:**
- Proves commit authenticity
- Prevents impersonation
- Required for branch protection

### Release Signing

For npm packages (if publishing):

```bash
npm config set sign-git-tag true
npm version patch  # Creates signed tag
```

---

## 7. SBOM (Software Bill of Materials)

### Generate SBOM

#### CycloneDX Format (FREE)

```bash
npm install -g @cyclonedx/cyclonedx-npm

# Generate SBOM
cyclonedx-npm --output-file sbom.json

# Upload to artifact registry
```

#### SPDX Format (FREE)

```bash
npm install -g @spdx/spdx-sbom-generator

# Generate SBOM
spdx-sbom-generator npm
```

### Automate in CI

Add to `.github/workflows/sbom.yml`:

```yaml
name: Generate SBOM

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate SBOM
        run: |
          npm install -g @cyclonedx/cyclonedx-npm
          cyclonedx-npm --output-file sbom.json
      
      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.json
      
      - name: Attach to release
        if: github.event_name == 'release'
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: ./sbom.json
          asset_name: sbom.json
          asset_content_type: application/json
```

### SBOM Benefits

- Vulnerability tracking
- License compliance
- Supply chain transparency
- Incident response (which versions affected?)

---

## 8. Audit Trail

### Dependency Changes

Track all dependency changes:

```bash
# View dependency change history
git log --all --oneline -- package.json package-lock.json

# Show who changed what
git blame package.json
```

### Build Artifact Provenance

#### SLSA (Supply chain Levels for Software Artifacts)

**SLSA Level 1: Documentation**
- ✅ Keep build logs
- ✅ Document build process

**SLSA Level 2: Build Service**
- ✅ Use GitHub Actions (tamper-evident)
- ✅ Generate SBOM

**SLSA Level 3: Source Provenance**
- ⚠️ Implement build attestations
- ⚠️ Sign releases

#### Generate Build Attestation

Use GitHub's attestation API:

```yaml
- name: Attest Build
  uses: actions/attest-build-provenance@v1
  with:
    subject-path: '.next/**/*'
```

---

## 9. Incident Response

### Compromised Dependency Response Plan

#### Phase 1: Detection (0-15 minutes)

**Sources:**
- Dependabot alert
- npm advisory
- Snyk notification
- Community disclosure

**Actions:**
1. Confirm vulnerability scope
2. Check if we use affected version
3. Assess impact on our application

#### Phase 2: Containment (15-60 minutes)

**Actions:**
1. Block deployment pipeline
2. Rollback to last known good version
3. Remove compromised package if possible
4. Communicate to team

#### Phase 3: Remediation (1-4 hours)

**Actions:**
1. Update to patched version
2. Review code for exploitation signs
3. Audit access logs
4. Test thoroughly
5. Deploy fix

#### Phase 4: Recovery (4-24 hours)

**Actions:**
1. Monitor for issues
2. Verify no data compromise
3. Update security documentation
4. Post-mortem review

### Response Team Contacts

```markdown
# SECURITY_CONTACTS.md

## Incident Response Team

- **Security Lead:** name@domain.com
- **On-Call Engineer:** oncall@domain.com
- **DevOps Lead:** devops@domain.com

## External Contacts

- **Vercel Support:** support@vercel.com
- **Supabase Support:** support@supabase.com
- **Stripe Security:** security@stripe.com
- **npm Security:** security@npmjs.com

## Escalation Path

1. Detect issue → Notify security lead
2. Critical issue → Notify CTO
3. Data breach → Notify legal team
4. Public disclosure → Notify PR team
```

---

## Vulnerability Disclosure

### If You Discover a Vulnerability

**In Our Code:**
1. Email security@yourdomain.com
2. Do NOT open public issue
3. Include: CVE ID, affected versions, reproduction steps
4. We respond within 48 hours

**In Dependency:**
1. Check if already reported (GitHub advisories, npm advisories)
2. If not, report to package maintainer
3. If no response in 7 days, disclose responsibly
4. Open issue in our repo to track

---

## Supply Chain Security Checklist

### Daily
- [ ] Monitor Dependabot alerts
- [ ] Review security workflow failures

### Weekly  
- [ ] Review dependency update PRs
- [ ] Check for new advisories
- [ ] Verify CI pipeline status

### Monthly
- [ ] Review SBOM
- [ ] Audit access logs
- [ ] Update security documentation

### Quarterly
- [ ] Rotate secrets
- [ ] Dependency cleanup (remove unused)
- [ ] Supply chain security audit
- [ ] Update incident response plan

### Annually
- [ ] Comprehensive security review
- [ ] Update security policies
- [ ] Team security training
- [ ] Penetration testing

---

## Tools Summary

| Tool | Purpose | Cost | Status |
|------|---------|------|--------|
| Dependabot | Dependency updates | FREE | ✅ Configured |
| npm audit | Vulnerability scanning | FREE | ✅ In use |
| Snyk | Vulnerability scanning | FREE | ✅ Configured |
| TruffleHog | Secret scanning | FREE | ✅ Configured |
| GitHub Actions | CI/CD security | FREE | ✅ In use |
| GPG | Commit signing | FREE | ⚠️ Recommended |
| CycloneDX | SBOM generation | FREE | ⚠️ To implement |
| Infisical | Secrets management | FREE | ⚠️ Recommended |

---

## Resources

### Standards
- [SLSA Framework](https://slsa.dev/)
- [NIST SSDF](https://csrc.nist.gov/Projects/ssdf)
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)
- [CycloneDX SBOM Standard](https://cyclonedx.org/)

### Tools
- [Dependabot](https://github.com/dependabot)
- [Snyk](https://snyk.io/)
- [Socket Security](https://socket.dev/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

### Learning
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)
- [Supply Chain Security Guide](https://github.com/cncf/tag-security/blob/main/supply-chain-security/supply-chain-security-paper/CNCF_SSCP_v1.pdf)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Last Updated:** 2025-10-04  
**Next Review:** 2026-01-04  
**Owner:** Security Team  
**Version:** 1.0
