#!/bin/bash
# Automated deployment script for mnnr.app
# Handles git commit, push, and Vercel deployment

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          MNNR.APP DEPLOYMENT SCRIPT                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# STEP 1: GIT STATUS CHECK
# ============================================
echo "📋 Checking git status..."
if [[ -z $(git status -s) ]]; then
  echo "✅ No changes to commit"
  SKIP_COMMIT=true
else
  echo "📝 Changes detected"
  SKIP_COMMIT=false
fi

# ============================================
# STEP 2: COMMIT MESSAGE
# ============================================
if [ "$SKIP_COMMIT" = false ]; then
  echo ""
  echo "Enter commit message (or press Enter for default):"
  read -r COMMIT_MSG

  if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="chore: deployment updates"
  fi

  echo ""
  echo "🔍 Changes to be committed:"
  git status -s

  echo ""
  echo "Commit message: $COMMIT_MSG"
  echo ""
  echo "Proceed with commit? (y/n)"
  read -r CONFIRM

  if [ "$CONFIRM" != "y" ]; then
    echo "❌ Aborted"
    exit 1
  fi

  # ============================================
  # STEP 3: GIT COMMIT & PUSH
  # ============================================
  echo ""
  echo "📦 Staging changes..."
  git add .

  echo "💾 Creating commit..."
  git commit -m "$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

  echo "⬆️  Pushing to GitHub..."
  git push origin main

  echo "✅ Git push complete"
else
  echo "⏭️  Skipping git operations"
fi

# ============================================
# STEP 4: PRE-DEPLOYMENT CHECKS
# ============================================
echo ""
echo "🔍 Running pre-deployment checks..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI not found${NC}"
  echo "Install: npm i -g vercel"
  exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
  echo "Running: vercel login"
  vercel login
fi

echo "✅ Pre-deployment checks passed"

# ============================================
# STEP 5: DEPLOYMENT ENVIRONMENT
# ============================================
echo ""
echo "Select deployment environment:"
echo "  1) Production (--prod)"
echo "  2) Preview (default branch)"
echo "  3) Cancel"
read -r ENV_CHOICE

case $ENV_CHOICE in
  1)
    DEPLOY_ENV="--prod"
    ENV_NAME="production"
    ;;
  2)
    DEPLOY_ENV=""
    ENV_NAME="preview"
    ;;
  3)
    echo "❌ Deployment cancelled"
    exit 0
    ;;
  *)
    echo "Invalid choice. Defaulting to preview"
    DEPLOY_ENV=""
    ENV_NAME="preview"
    ;;
esac

# ============================================
# STEP 6: FINAL CONFIRMATION
# ============================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                   DEPLOYMENT SUMMARY                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo "Environment: $ENV_NAME"
echo "Branch: $(git branch --show-current)"
echo "Commit: $(git log -1 --oneline)"
echo ""
echo "Deploy to Vercel $ENV_NAME? (y/n)"
read -r DEPLOY_CONFIRM

if [ "$DEPLOY_CONFIRM" != "y" ]; then
  echo "❌ Deployment cancelled"
  exit 0
fi

# ============================================
# STEP 7: DEPLOY TO VERCEL
# ============================================
echo ""
echo "🚀 Deploying to Vercel $ENV_NAME..."
echo ""

if vercel $DEPLOY_ENV --yes; then
  echo ""
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║              ✅ DEPLOYMENT SUCCESSFUL                     ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""
  echo "Environment: $ENV_NAME"
  echo "Time: $(date)"
  echo ""

  if [ "$ENV_NAME" = "production" ]; then
    echo "🌐 Production URL: https://mnnr.app"
    echo ""
    echo "Post-deployment checklist:"
    echo "  □ Test authentication flow"
    echo "  □ Verify webhook handling"
    echo "  □ Check security headers"
    echo "  □ Monitor error logs"
    echo ""
  fi

  exit 0
else
  echo ""
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║              ❌ DEPLOYMENT FAILED                         ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""
  echo "Common issues:"
  echo "  1. Team access required:"
  echo "     → Add git author to Vercel team"
  echo "     → Or update git config email"
  echo ""
  echo "  2. Build errors:"
  echo "     → Check 'npm run build' locally"
  echo "     → Review Vercel build logs"
  echo ""
  echo "  3. Environment variables:"
  echo "     → Verify all required vars in Vercel"
  echo "     → Check .env.example for reference"
  echo ""
  exit 1
fi
