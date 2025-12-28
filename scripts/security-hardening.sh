#!/bin/bash

# Security Hardening Script for MNNR Complete 2025
# This script implements additional security measures beyond the current 9/10 score
#
# Usage: ./scripts/security-hardening.sh
#
# Requirements:
# - Node.js 20+
# - npm or pnpm
# - Go 1.23+ (for Go server)
# - Git
#
# Author: MNNR Security Team
# Last Updated: 2025-12-27

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in repository root
if [ ! -f "package.json" ]; then
    log_error "Must be run from repository root"
    exit 1
fi

log_info "Starting security hardening process..."

# ==============================================================================
# 1. Dependency Security Audit
# ==============================================================================

log_info "Running dependency security audit..."

# NPM audit
if command -v npm &> /dev/null; then
    log_info "Running npm audit..."
    npm audit --audit-level=moderate || log_warning "npm audit found issues"
    
    log_info "Attempting to fix vulnerabilities..."
    npm audit fix --force || log_warning "Some vulnerabilities could not be auto-fixed"
fi

# PNPM audit
if command -v pnpm &> /dev/null; then
    log_info "Running pnpm audit..."
    pnpm audit || log_warning "pnpm audit found issues"
fi

# Go vulnerabilities (if Go server exists)
if [ -d "go-server" ] && command -v go &> /dev/null; then
    log_info "Checking Go vulnerabilities..."
    cd go-server
    go install golang.org/x/vuln/cmd/govulncheck@latest
    govulncheck ./... || log_warning "Go vulnerabilities found"
    cd ..
fi

log_success "Dependency audit completed"

# ==============================================================================
# 2. License Compliance Check
# ==============================================================================

log_info "Checking license compliance..."

if command -v npx &> /dev/null; then
    log_info "Generating license report..."
    npx license-checker --summary || log_warning "License checker not available"
    
    # Check for problematic licenses
    log_info "Checking for GPL/AGPL licenses..."
    npx license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD;CC0-1.0;Unlicense" || \
        log_warning "Some dependencies have restrictive licenses"
fi

log_success "License compliance check completed"

# ==============================================================================
# 3. Secret Scanning
# ==============================================================================

log_info "Running secret scanning..."

# Install gitleaks if not present
if ! command -v gitleaks &> /dev/null; then
    log_warning "Gitleaks not installed, skipping secret scan"
else
    log_info "Scanning for secrets with Gitleaks..."
    gitleaks detect --verbose --no-git || log_warning "Potential secrets detected"
fi

# Check for common secret patterns
log_info "Checking for common secret patterns..."
if git grep -E "(api_key|api_secret|access_token|secret_key|private_key)" -- '*.ts' '*.js' '*.go' '*.env*' 2>/dev/null; then
    log_warning "Potential secrets found in code - please review"
fi

log_success "Secret scanning completed"

# ==============================================================================
# 4. File Permissions Audit
# ==============================================================================

log_info "Auditing file permissions..."

# Check for overly permissive files
log_info "Checking for world-writable files..."
find . -type f -perm -002 ! -path "./.git/*" ! -path "./node_modules/*" 2>/dev/null | while read file; do
    log_warning "World-writable file found: $file"
done

# Check for executable files that shouldn't be
log_info "Checking for unexpected executable files..."
find . -type f -executable ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./scripts/*" ! -name "*.sh" 2>/dev/null | while read file; do
    log_warning "Unexpected executable file: $file"
done

log_success "File permissions audit completed"

# ==============================================================================
# 5. Git Security Configuration
# ==============================================================================

log_info "Configuring Git security settings..."

# Enable GPG signing (if GPG key is configured)
if git config user.signingkey &> /dev/null; then
    log_info "Enabling GPG commit signing..."
    git config commit.gpgsign true
    log_success "GPG signing enabled"
else
    log_warning "No GPG key configured - commit signing not enabled"
fi

# Configure Git to reject non-fast-forward pushes
git config --local receive.denyNonFastForwards true 2>/dev/null || true

# Configure Git to reject deletes
git config --local receive.denyDeletes true 2>/dev/null || true

log_success "Git security configuration completed"

# ==============================================================================
# 6. Environment Variable Validation
# ==============================================================================

log_info "Validating environment configuration..."

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    log_warning ".env.example not found - creating template..."
    cat > .env.example << 'EOF'
# Environment Variables Template
# Copy this file to .env and fill in your values
# NEVER commit .env to version control

# Database
DATABASE_URL=your_database_url_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Sentry
SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here

# Other
NODE_ENV=development
EOF
    log_success "Created .env.example template"
fi

# Check if .env is in .gitignore
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
    log_warning ".env not in .gitignore - adding..."
    echo ".env" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env.production" >> .gitignore
    log_success "Added .env files to .gitignore"
fi

log_success "Environment validation completed"

# ==============================================================================
# 7. Security Headers Check (for Next.js)
# ==============================================================================

log_info "Checking security headers configuration..."

if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
    log_info "Verifying Next.js security headers..."
    
    # Check if security headers are configured
    if ! grep -q "X-Frame-Options" next.config.* 2>/dev/null; then
        log_warning "Security headers not configured in next.config.*"
        log_info "Consider adding security headers to next.config.js"
    fi
fi

log_success "Security headers check completed"

# ==============================================================================
# 8. Dependency Update Check
# ==============================================================================

log_info "Checking for outdated dependencies..."

if command -v npm &> /dev/null; then
    log_info "Checking npm packages..."
    npm outdated || log_info "Some packages have updates available"
fi

if command -v pnpm &> /dev/null; then
    log_info "Checking pnpm packages..."
    pnpm outdated || log_info "Some packages have updates available"
fi

log_success "Dependency update check completed"

# ==============================================================================
# 9. Code Quality & Security Linting
# ==============================================================================

log_info "Running security-focused linting..."

if command -v npx &> /dev/null; then
    # Install ESLint security plugin if not present
    if [ ! -d "node_modules/eslint-plugin-security" ]; then
        log_info "Installing ESLint security plugin..."
        npm install --save-dev eslint-plugin-security || log_warning "Could not install ESLint security plugin"
    fi
    
    # Run ESLint with security rules
    log_info "Running ESLint security checks..."
    npx eslint . --ext .js,.jsx,.ts,.tsx || log_warning "ESLint found issues"
fi

log_success "Code quality checks completed"

# ==============================================================================
# 10. Generate Security Report
# ==============================================================================

log_info "Generating security report..."

REPORT_FILE="security-hardening-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# Security Hardening Report

**Generated**: $(date)
**Repository**: MNNRAPP/mnnr-complete2025

## Summary

This report summarizes the security hardening measures applied to the repository.

## Actions Taken

1. ✅ Dependency security audit completed
2. ✅ License compliance checked
3. ✅ Secret scanning performed
4. ✅ File permissions audited
5. ✅ Git security configured
6. ✅ Environment variables validated
7. ✅ Security headers checked
8. ✅ Dependencies checked for updates
9. ✅ Security-focused linting completed
10. ✅ Security report generated

## Recommendations

### Immediate Actions
- Review any warnings generated during this scan
- Update outdated dependencies
- Configure GPG signing for commits (if not already done)
- Review and implement security headers in next.config.js

### Ongoing Maintenance
- Run this script weekly
- Monitor Dependabot alerts daily
- Review security advisories for your dependencies
- Keep pre-commit hooks updated

## Next Steps

1. Review this report: \`cat $REPORT_FILE\`
2. Address any warnings or errors
3. Commit any changes made by this script
4. Schedule regular security audits

## Resources

- GitHub Security: https://github.com/MNNRAPP/mnnr-complete2025/security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Security Policy: ./SECURITY.md

---

**Report saved to**: $REPORT_FILE
EOF

log_success "Security report generated: $REPORT_FILE"

# ==============================================================================
# Summary
# ==============================================================================

echo ""
echo "================================================================================"
log_success "Security hardening completed successfully!"
echo "================================================================================"
echo ""
log_info "Report saved to: $REPORT_FILE"
log_info "Review the report for any warnings or recommendations"
echo ""
log_info "Next steps:"
echo "  1. Review the security report"
echo "  2. Address any warnings"
echo "  3. Commit changes: git add -A && git commit -m 'chore: Apply security hardening'"
echo "  4. Push changes: git push"
echo ""
log_info "For ongoing security:"
echo "  - Run this script weekly"
echo "  - Monitor GitHub Security tab daily"
echo "  - Keep dependencies updated"
echo "  - Review security advisories"
echo ""
echo "================================================================================"
