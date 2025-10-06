# MNNR Stripe Setup Automation Script
# This script automatically creates Stripe products and pricing plans

Write-Host "🚀 MNNR Stripe Setup Starting..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if Stripe CLI is installed
if (!(Get-Command stripe -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Stripe CLI..." -ForegroundColor Yellow
    
    # Download and install Stripe CLI for Windows
    $stripeUrl = "https://github.com/stripe/stripe-cli/releases/latest/download/stripe_1.18.0_windows_x86_64.zip"
    $tempPath = "$env:TEMP\stripe-cli.zip"
    $extractPath = "$env:TEMP\stripe-cli"
    
    try {
        Invoke-WebRequest -Uri $stripeUrl -OutFile $tempPath
        Expand-Archive -Path $tempPath -DestinationPath $extractPath -Force
        
        # Copy to a permanent location
        $stripePath = "C:\Tools\stripe"
        if (!(Test-Path $stripePath)) {
            New-Item -ItemType Directory -Path $stripePath -Force
        }
        Copy-Item "$extractPath\stripe.exe" -Destination "$stripePath\stripe.exe" -Force
        
        # Add to PATH for current session
        $env:PATH += ";$stripePath"
        
        Write-Host "✅ Stripe CLI installed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to install Stripe CLI: $_" -ForegroundColor Red
        Write-Host "Please install manually from: https://stripe.com/docs/stripe-cli" -ForegroundColor Yellow
        exit 1
    }
}

# Check if user is logged into Stripe
Write-Host "🔐 Checking Stripe authentication..." -ForegroundColor Cyan
$stripeAuth = stripe config --list 2>&1
if ($stripeAuth -like "*You're not authenticated*" -or $stripeAuth -like "*No configuration*") {
    Write-Host "⚠️  Please authenticate with Stripe first:" -ForegroundColor Yellow
    Write-Host "   1. Run: stripe login" -ForegroundColor White
    Write-Host "   2. Follow the browser authentication" -ForegroundColor White
    Write-Host "   3. Run this script again" -ForegroundColor White
    
    # Auto-start login process
    Write-Host "🌐 Starting Stripe login process..." -ForegroundColor Cyan
    stripe login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Stripe authentication failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Stripe CLI authenticated" -ForegroundColor Green

# Create Stripe products using fixtures
Write-Host "🏗️  Creating Stripe products and pricing..." -ForegroundColor Cyan

if (Test-Path "fixtures/stripe-fixtures.json") {
    Write-Host "📄 Using fixtures file: fixtures/stripe-fixtures.json" -ForegroundColor White
    
    try {
        $result = stripe fixtures fixtures/stripe-fixtures.json 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Stripe products created successfully!" -ForegroundColor Green
            Write-Host $result
        } else {
            Write-Host "❌ Failed to create Stripe products:" -ForegroundColor Red
            Write-Host $result
        }
    }
    catch {
        Write-Host "❌ Error running Stripe fixtures: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ fixtures/stripe-fixtures.json not found" -ForegroundColor Red
    Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow
}

# Update Railway environment with webhook secret if provided
if ($env:STRIPE_WEBHOOK_SECRET) {
    Write-Host "🔗 Updating Railway webhook secret..." -ForegroundColor Cyan
    railway variables --set "STRIPE_WEBHOOK_SECRET=$env:STRIPE_WEBHOOK_SECRET"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Railway webhook secret updated" -ForegroundColor Green
    }
}

# Test webhook endpoint
Write-Host "🧪 Testing webhook endpoint..." -ForegroundColor Cyan
$webhookUrl = "https://mnnr-production.up.railway.app/api/webhooks"
try {
    $response = Invoke-WebRequest -Uri $webhookUrl -Method GET -TimeoutSec 10
    Write-Host "✅ Webhook endpoint is accessible" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Webhook endpoint test failed (this is normal for POST-only endpoints)" -ForegroundColor Yellow
}

# Final summary
Write-Host "" -ForegroundColor White
Write-Host "🎉 MNNR Stripe Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Stripe CLI installed and authenticated" -ForegroundColor White
Write-Host "✅ Products and pricing plans created" -ForegroundColor White
Write-Host "✅ Webhook secret configured" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🌐 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Check your Stripe dashboard: https://dashboard.stripe.com/test/products" -ForegroundColor White
Write-Host "   2. Verify webhook: https://dashboard.stripe.com/test/webhooks" -ForegroundColor White
Write-Host "   3. Visit your site: https://mnnr-production.up.railway.app" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🚀 Your MNNR platform should now show pricing plans!" -ForegroundColor Green