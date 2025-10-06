# Railway Migration Script for Windows PowerShell
# Migrates MNNR from Vercel to Railway

Write-Host "🚂 MNNR Railway Migration Started" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if Railway CLI is installed
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Railway CLI" -ForegroundColor Red
        exit 1
    }
}

# Login to Railway
Write-Host "🔐 Logging into Railway..." -ForegroundColor Cyan
railway login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway login failed" -ForegroundColor Red
    exit 1
}

# Initialize Railway project
Write-Host "🏗️ Creating Railway project..." -ForegroundColor Cyan
railway init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway init failed" -ForegroundColor Red
    exit 1
}

# Set production environment variables
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Cyan

# Core Railway variables
railway variables set NEXT_PUBLIC_SITE_URL="https://mnnr-production.up.railway.app"
railway variables set NEXT_PUBLIC_SITE_NAME="MNNR"
railway variables set NEXT_PUBLIC_RP_ID="mnnr-production.up.railway.app"
railway variables set NODE_ENV="production"

# Enable all security features for production
railway variables set NEXT_PUBLIC_ENABLE_PASSKEYS="true"
railway variables set NEXT_PUBLIC_ENABLE_MFA="true"
railway variables set NEXT_PUBLIC_ENABLE_AUDIT_LOGGING="true"
railway variables set NEXT_PUBLIC_ENABLE_E2EE="true"

Write-Host "⚠️  Manual Setup Required:" -ForegroundColor Yellow
Write-Host "1. Add your Supabase credentials via Railway dashboard" -ForegroundColor White
Write-Host "2. Add your Stripe keys via Railway dashboard" -ForegroundColor White
Write-Host "3. Add your Redis/Upstash credentials via Railway dashboard" -ForegroundColor White
Write-Host "4. Add your Sentry DSN via Railway dashboard" -ForegroundColor White

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Green
railway up
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration complete!" -ForegroundColor Green
    Write-Host "🌐 Your MNNR platform is now running on Railway" -ForegroundColor Green
    Write-Host "📊 Check deployment status: railway status" -ForegroundColor Cyan
    Write-Host "📱 View logs: railway logs" -ForegroundColor Cyan
    Write-Host "🔧 Manage env vars: railway variables" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "📱 Check logs: railway logs" -ForegroundColor Yellow
}