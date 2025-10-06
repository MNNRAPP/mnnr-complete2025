# MNNR Documentation Deployment Script (PowerShell)
# This script automates the deployment of docs.mnnr.app to Vercel

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "  MNNR Documentation Deployment Script" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue

# Change to project directory
$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

# Check if Vercel CLI is installed
Write-Host "`n📋 Checking Vercel CLI..." -ForegroundColor Blue
try {
    $null = Get-Command vercel -ErrorAction Stop
    Write-Host "✓ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "⚠ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check Vercel authentication
Write-Host "`n📋 Checking Vercel authentication..." -ForegroundColor Blue
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please log in to Vercel:" -ForegroundColor Yellow
    vercel login
}

# Check for production environment file
Write-Host "`n📋 Checking environment configuration..." -ForegroundColor Blue
if (!(Test-Path ".env.production")) {
    Write-Host "✗ Error: .env.production not found!" -ForegroundColor Red
    Write-Host "Please create .env.production with required variables" -ForegroundColor Yellow
    Write-Host "`nRequired variables:" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
    Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
    Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
    Write-Host "  - STRIPE_SECRET_KEY" -ForegroundColor White
    Write-Host "  - STRIPE_WEBHOOK_SECRET" -ForegroundColor White
    Write-Host "  - NEXT_PUBLIC_POSTHOG_KEY" -ForegroundColor White
    Write-Host "  - NEXT_PUBLIC_SITE_URL" -ForegroundColor White
    exit 1
}
Write-Host "✓ Environment file found" -ForegroundColor Green

# Build the project
Write-Host "`n🔨 Building Next.js application..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

# Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Blue
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployment successful" -ForegroundColor Green

# Add custom domain
Write-Host "`n🌐 Configuring custom domain..." -ForegroundColor Blue
$domainResult = vercel domains add docs.mnnr.app 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Domain may already be added or needs manual configuration" -ForegroundColor Yellow
} else {
    Write-Host "✓ Domain added" -ForegroundColor Green
}

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "`n1. Configure DNS in your domain registrar:" -ForegroundColor White
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "   Type:  " -NoNewline -ForegroundColor White
Write-Host "CNAME" -ForegroundColor Cyan
Write-Host "   Name:  " -NoNewline -ForegroundColor White
Write-Host "docs" -ForegroundColor Cyan
Write-Host "   Value: " -NoNewline -ForegroundColor White
Write-Host "cname.vercel-dns.com" -ForegroundColor Cyan
Write-Host "   TTL:   " -NoNewline -ForegroundColor White
Write-Host "3600" -ForegroundColor Cyan

Write-Host "`n2. Verify deployment (wait 5-10 minutes for DNS):" -ForegroundColor White
Write-Host "   curl https://docs.mnnr.app/api/health" -ForegroundColor Cyan

Write-Host "`n3. Check Vercel dashboard:" -ForegroundColor White
Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan

# Get deployment URL
Write-Host "`n🔍 Getting deployment details..." -ForegroundColor Blue
$deploymentInfo = vercel ls --json 2>&1 | ConvertFrom-Json | Select-Object -First 1
if ($deploymentInfo) {
    Write-Host "`nLatest deployment URL:" -ForegroundColor Green
    Write-Host "  https://$($deploymentInfo.url)" -ForegroundColor Cyan
}

Write-Host "`n🎉 Done!" -ForegroundColor Green
