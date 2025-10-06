# GitHub Repository Hardening Guide

## SEC-003: GitHub Security Configuration

### Overview
This document outlines the security settings and configurations for the mnnr.app GitHub repository to ensure code integrity, prevent unauthorized changes, and maintain a secure development workflow.

---

## Repository Settings Checklist

### 1. General Settings

**Visibility:**
- [ ] Repository is private (unless intentionally public)
- [ ] Collaborators list reviewed and current
- [ ] Outside collaborators limited to read-only

**Features:**
- [ ] Wikis disabled (use /docs instead)
- [ ] Projects disabled (use external project management)
- [ ] Discussions disabled (use dedicated channels)
- [ ] Allow forking: Disabled for private repos

---

### 2. Branch Protection Rules

**Protected Branch: `main`**

Navigate to: `Settings → Branches → Branch protection rules`

#### Required Settings:

**Require a pull request before merging:**
- [x] Require a pull request before merging
- [x] Require approvals: **Minimum 1 approval**
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require review from Code Owners (see [.github/CODEOWNERS](../.github/CODEOWNERS))

**Require status checks to pass before merging:**
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- Required status checks:
  - [ ] `dependency-scan`
  - [ ] `sast-semgrep`
  - [ ] `eslint-security`
  - [ ] `secret-scan`
  - [ ] `bundle-security`

**Require conversation resolution before merging:**
- [x] Require conversation resolution before merging

**Require signed commits:**
- [x] Require signed commits (see [Commit Signing Setup](#commit-signing-setup))

**Require linear history:**
- [x] Require linear history (prevents merge commits, enforces rebase/squash)

**Do not allow bypassing the above settings:**
- [x] Do not allow bypassing the above settings
- [x] Include administrators (even admins must follow rules)

**Restrict pushes:**
- [x] Restrict who can push to matching branches
- Allowed to push: **No one** (all changes via PR)

**Restrict deletions:**
- [x] Allow deletions: **Disabled**

**Restrict force pushes:**
- [x] Allow force pushes: **Disabled**

---

### 3. Code Owners Configuration

**File:** [`.github/CODEOWNERS`](../.github/CODEOWNERS)

**Purpose:** Define who must approve changes to critical files

**Key Assignments:**
- Security-critical files → `@security-team`
- Infrastructure → `@devops-lead`
- API routes → `@backend-lead` + `@security-team`
- Database migrations → `@backend-lead` + `@security-team`

**Enforcement:**
- [x] Require review from Code Owners enabled in branch protection

---

### 4. Security & Analysis

Navigate to: `Settings → Code security and analysis`

#### Dependency Graph
- [x] **Enabled** - Track dependencies and vulnerabilities

#### Dependabot Alerts
- [x] **Enabled** - Receive alerts for vulnerable dependencies
- [x] Email notifications: **Enabled**
- [x] Web UI notifications: **Enabled**

#### Dependabot Security Updates
- [x] **Enabled** - Automatic PRs for security updates
- Configuration: [`.github/dependabot.yml`](../.github/dependabot.yml)

#### Dependabot Version Updates
- [x] **Enabled** - Automatic PRs for dependency updates
- Schedule: Weekly on Mondays at 9 AM PST

#### Secret Scanning
- [x] **Enabled** - Scan for committed secrets
- [x] Push protection: **Enabled** - Block pushes with secrets
- [x] Alert recipients: Security team

#### Code Scanning (CodeQL)
- [x] **Enabled** - Automated code analysis
- Languages: JavaScript/TypeScript
- Schedule: On push to `main`, on PR, weekly on schedule

---

### 5. Actions Permissions

Navigate to: `Settings → Actions → General`

#### Actions Permissions:
- [x] Allow only actions created by GitHub
- [x] Allow actions by verified creators
- Selected actions and reusable workflows:
  ```
  actions/checkout@*,
  actions/setup-node@*,
  actions/upload-artifact@*,
  zaproxy/action-baseline@*,
  returntocorp/semgrep-action@*
  ```

#### Workflow Permissions:
- [x] Read repository contents and packages permissions (default)
- [x] **NOT** "Read and write permissions" (too permissive)

**Specific Permissions (in workflows):**
```yaml
permissions:
  contents: read
  security-events: write
  pull-requests: write
  actions: read
```

---

### 6. Commit Signing Setup

#### Why Sign Commits?
- Verifies commit author identity
- Prevents commit spoofing
- Required by branch protection rules

#### Setup GPG Signing:

**1. Generate GPG Key:**
```bash
# Generate new GPG key
gpg --full-generate-key
# Choose RSA and RSA, 4096 bits, never expires

# List keys
gpg --list-secret-keys --keyid-format=long

# Export public key
gpg --armor --export YOUR_KEY_ID
```

**2. Add to GitHub:**
- Go to: Settings → SSH and GPG keys → New GPG key
- Paste public key

**3. Configure Git:**
```bash
# Set signing key
git config --global user.signingkey YOUR_KEY_ID

# Auto-sign all commits
git config --global commit.gpgsign true

# Auto-sign all tags
git config --global tag.gpgSign true
```

**4. Verify:**
```bash
# Make a test commit
git commit --allow-empty -m "test: signed commit"

# Verify signature
git log --show-signature -1
```

#### Alternative: SSH Signing (Simpler)

```bash
# Use existing SSH key for signing
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# Enable signing
git config --global commit.gpgsign true
```

---

### 7. Webhook Security

Navigate to: `Settings → Webhooks`

**If using webhooks:**
- [x] Use HTTPS only
- [x] Set a secret token (validate in webhook handler)
- [x] Limit webhook scope to necessary events only
- [x] Log all webhook deliveries
- [x] Monitor for failed deliveries (potential attacks)

---

### 8. Deploy Keys & Access Tokens

Navigate to: `Settings → Deploy keys` and `Settings → Secrets and variables → Actions`

**Deploy Keys:**
- [x] Read-only access only
- [x] One key per service (don't reuse)
- [x] Regular rotation (90 days)

**GitHub Actions Secrets:**
- [x] Use secrets for sensitive data (not environment variables)
- [x] Limit secret access to specific workflows
- [x] Never log secrets
- [x] Rotate regularly

**Required Secrets:**
```
VERCEL_TOKEN
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SENTRY_AUTH_TOKEN
```

---

### 9. Team & Collaborator Management

Navigate to: `Settings → Collaborators and teams`

#### Permission Levels:

**Admin:**
- Security team lead
- DevOps lead
- Limited to 2-3 people

**Maintain:**
- Senior engineers
- Can manage issues, PRs, settings (not security)

**Write:**
- All developers
- Can push to feature branches
- Cannot push to `main`
- Cannot modify settings

**Read:**
- Stakeholders
- Contractors (temporary)
- External auditors

#### Best Practices:
- [x] Use teams instead of individual collaborators
- [x] Regular access reviews (quarterly)
- [x] Remove access immediately when team members leave
- [x] Use time-limited access for contractors

---

### 10. Security Policies

#### SECURITY.md
- [x] Create [`SECURITY.md`](../SECURITY.md) in repository root
- [x] Document vulnerability reporting process
- [x] Define supported versions
- [x] Provide security contact

#### Security Advisory
- [x] Enable private vulnerability reporting
- [x] Define security advisory workflow
- [x] Assign security team as contacts

---

## Verification Checklist

Run this checklist monthly to verify settings:

```bash
#!/bin/bash
# scripts/verify-github-security.sh

echo "🔍 Verifying GitHub Security Settings..."

# 1. Check branch protection
gh api repos/:owner/:repo/branches/main/protection \
  | jq '.required_pull_request_reviews, .required_status_checks, .enforce_admins'

# 2. Check security features
gh api repos/:owner/:repo \
  | jq '.security_and_analysis'

# 3. Check CODEOWNERS file exists
if [ -f .github/CODEOWNERS ]; then
  echo "✅ CODEOWNERS file present"
else
  echo "❌ CODEOWNERS file missing"
fi

# 4. Check dependabot config
if [ -f .github/dependabot.yml ]; then
  echo "✅ Dependabot configured"
else
  echo "❌ Dependabot config missing"
fi

# 5. Check security workflow
if [ -f .github/workflows/security-ci.yml ]; then
  echo "✅ Security CI workflow present"
else
  echo "❌ Security CI workflow missing"
fi

echo "✅ Verification complete"
```

---

## Incident Response

### If Repository is Compromised:

**Immediate Actions:**
1. Revoke all access tokens and deploy keys
2. Reset all secrets
3. Enable maintenance mode on application
4. Review all recent commits for malicious code
5. Check GitHub audit log for unauthorized access
6. Force all team members to rotate passwords and enable MFA

**Investigation:**
1. Review GitHub audit log
2. Check commit history for suspicious changes
3. Review webhook deliveries
4. Check Actions workflow runs
5. Verify all collaborators are authorized

**Recovery:**
1. Remove compromised collaborators
2. Rotate all secrets
3. Review and revert malicious commits
4. Force push clean history if needed (coordinate with team)
5. Re-enable access for verified team members
6. Document incident and lessons learned

---

## Automation & Monitoring

### GitHub Actions Workflows

**Security CI:** [`.github/workflows/security-ci.yml`](../.github/workflows/security-ci.yml)
- Runs on: Push to `main`, PRs, daily schedule
- Checks: Dependencies, SAST, secrets, bundle security

**Dependabot:** [`.github/dependabot.yml`](../.github/dependabot.yml)
- Runs: Weekly on Mondays
- Updates: npm dependencies, GitHub Actions

### Monitoring

**What to Monitor:**
- Failed CI/CD runs
- Dependabot alerts (high/critical priority)
- Secret scanning alerts (immediate action)
- Failed webhook deliveries
- Unusual commit patterns
- New collaborator additions
- Permission changes

**Alert Channels:**
- Slack: `#security-alerts`
- Email: `security@mnnr.app`
- PagerDuty: Critical alerts only

---

## Compliance

**Required For:**
- SOC 2 Type II: Branch protection, code reviews, audit logs
- PCI DSS: Secure SDLC, code reviews, vulnerability management
- GDPR: Access controls, audit trails, data protection

**Audit Evidence:**
- Branch protection rules screenshot
- CODEOWNERS file
- Dependabot configuration
- Security CI workflow runs
- Commit signature verification
- Access review logs

---

## References

- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/securing-your-repository)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)
- [Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Last Updated:** 2025-10-06
**Next Review:** 2026-01-06
**Owner:** Security Team
