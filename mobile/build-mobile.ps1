# MNNR Mobile App Build Script for Windows

Write-Host "🚀 Building MNNR Mobile Apps..." -ForegroundColor Green

# Navigate to mobile directory
Set-Location $PSScriptRoot

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build Next.js app with mobile config
Write-Host "🔨 Building Next.js static export..." -ForegroundColor Yellow
Set-Location ..
$env:NEXT_CONFIG_FILE = "next.config.mobile.js"
npm run build
# Create out directory if it doesn't exist
if (!(Test-Path "out")) {
    New-Item -ItemType Directory -Path "out"
}
Set-Location mobile

# Initialize Capacitor (if not already done)
if (!(Test-Path "ios") -and !(Test-Path "android")) {
    Write-Host "🎬 Initializing Capacitor..." -ForegroundColor Yellow
    npx cap init MNNR app.mnnr.mobile --web-dir=../out
}

# Add platforms if needed
if (!(Test-Path "ios")) {
    Write-Host "🍎 Adding iOS platform..." -ForegroundColor Yellow
    npx cap add ios
}

if (!(Test-Path "android")) {
    Write-Host "🤖 Adding Android platform..." -ForegroundColor Yellow
    npx cap add android
}

# Sync web assets
Write-Host "🔄 Syncing web assets to native projects..." -ForegroundColor Yellow
npx cap sync

Write-Host "✅ Mobile apps built successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To open in Xcode: npm run open:ios" -ForegroundColor Cyan
Write-Host "To open in Android Studio: npm run open:android" -ForegroundColor Cyan
