# Automated deployment script for mnnr.app (PowerShell)
# Handles git commit, push, and Vercel deployment

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          MNNR.APP DEPLOYMENT SCRIPT                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 1: GIT STATUS CHECK
# ============================================
Write-Host "📋 Checking git status..." -ForegroundColor Yellow

$gitStatus = git status -s
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
    $skipCommit = $true
} else {
    Write-Host "📝 Changes detected" -ForegroundColor Yellow
    $skipCommit = $false
}

# ============================================
# STEP 2: COMMIT MESSAGE
# ============================================
if (-not $skipCommit) {
    Write-Host ""
    Write-Host "Enter commit message (or press Enter for default):"
    $commitMsg = Read-Host

    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "chore: deployment updates"
    }

    Write-Host ""
    Write-Host "🔍 Changes to be committed:" -ForegroundColor Yellow
    git status -s

    Write-Host ""
    Write-Host "Commit message: $commitMsg" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Proceed with commit? (y/n)" -ForegroundColor Yellow
    $confirm = Read-Host

    if ($confirm -ne "y") {
        Write-Host "❌ Aborted" -ForegroundColor Red
        exit 1
    }

    # ============================================
    # STEP 3: GIT COMMIT & PUSH
    # ============================================
    Write-Host ""
    Write-Host "📦 Staging changes..." -ForegroundColor Yellow
    git add .

    Write-Host "💾 Creating commit..." -ForegroundColor Yellow

    $fullCommitMsg = @"
$commitMsg

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
"@

    git commit -m $fullCommitMsg

    Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main

    Write-Host "✅ Git push complete" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping git operations" -ForegroundColor Gray
}

# ============================================
# STEP 4: PRE-DEPLOYMENT CHECKS
# ============================================
Write-Host ""
Write-Host "🔍 Running pre-deployment checks..." -ForegroundColor Yellow

# Check if Vercel CLI is installed
try {
    $null = vercel --version
} catch {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "Install: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Vercel
try {
    $null = vercel whoami 2>$null
} catch {
    Write-Host "⚠️  Not logged in to Vercel" -ForegroundColor Yellow
    Write-Host "Running: vercel login" -ForegroundColor Cyan
    vercel login
}

Write-Host "✅ Pre-deployment checks passed" -ForegroundColor Green

# ============================================
# STEP 5: DEPLOYMENT ENVIRONMENT
# ============================================
Write-Host ""
Write-Host "Select deployment environment:" -ForegroundColor Cyan
Write-Host "  1) Production (--prod)" -ForegroundColor White
Write-Host "  2) Preview (default branch)" -ForegroundColor White
Write-Host "  3) Cancel" -ForegroundColor White
$envChoice = Read-Host

switch ($envChoice) {
    "1" {
        $deployEnv = "--prod"
        $envName = "production"
    }
    "2" {
        $deployEnv = ""
        $envName = "preview"
    }
    "3" {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 0
    }
    default {
        Write-Host "Invalid choice. Defaulting to preview" -ForegroundColor Yellow
        $deployEnv = ""
        $envName = "preview"
    }
}

# ============================================
# STEP 6: FINAL CONFIRMATION
# ============================================
$currentBranch = git branch --show-current
$lastCommit = git log -1 --oneline

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   DEPLOYMENT SUMMARY                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "Environment: $envName" -ForegroundColor White
Write-Host "Branch: $currentBranch" -ForegroundColor White
Write-Host "Commit: $lastCommit" -ForegroundColor White
Write-Host ""
Write-Host "Deploy to Vercel $envName? (y/n)" -ForegroundColor Yellow
$deployConfirm = Read-Host

if ($deployConfirm -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

# ============================================
# STEP 7: DEPLOY TO VERCEL
# ============================================
Write-Host ""
Write-Host "🚀 Deploying to Vercel $envName..." -ForegroundColor Yellow
Write-Host ""

$deployArgs = @("--yes")
if ($deployEnv) {
    $deployArgs += $deployEnv
}

try {
    vercel @deployArgs

    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ✅ DEPLOYMENT SUCCESSFUL                     ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Environment: $envName" -ForegroundColor White
    Write-Host "Time: $(Get-Date)" -ForegroundColor White
    Write-Host ""

    if ($envName -eq "production") {
        Write-Host "🌐 Production URL: https://mnnr.app" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Post-deployment checklist:" -ForegroundColor Yellow
        Write-Host "  □ Test authentication flow" -ForegroundColor White
        Write-Host "  □ Verify webhook handling" -ForegroundColor White
        Write-Host "  □ Check security headers" -ForegroundColor White
        Write-Host "  □ Monitor error logs" -ForegroundColor White
        Write-Host ""
    }

    exit 0
} catch {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║              ❌ DEPLOYMENT FAILED                         ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Team access required:" -ForegroundColor White
    Write-Host "     - Add git author to Vercel team" -ForegroundColor Gray
    Write-Host "     - Or update git config email" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Build errors:" -ForegroundColor White
    Write-Host "     - Check 'npm run build' locally" -ForegroundColor Gray
    Write-Host "     - Review Vercel build logs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Environment variables:" -ForegroundColor White
    Write-Host "     - Verify all required vars in Vercel" -ForegroundColor Gray
    Write-Host "     - Check .env.example for reference" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Error details: $_" -ForegroundColor Red
    exit 1
}
