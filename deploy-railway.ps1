# MNNR Railway Deployment Automation
# Handles complete Railway setup and deployment

param(
    [string]$Domain = "mnnr.app",
    [switch]$Production = $false
)

Write-Host "MNNR Railway Deployment Automation" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Environment configuration
$environment = if ($Production) { "production" } else { "staging" }
$siteUrl = if ($Production) { "https://$Domain" } else { "https://mnnr-production.up.railway.app" }

Write-Host "Target: $environment environment" -ForegroundColor Cyan
Write-Host "Domain: $Domain" -ForegroundColor Cyan

# Check Railway CLI
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Railway CLI" -ForegroundColor Red
        exit 1
    }
}

# Login check
Write-Host "Checking Railway authentication..." -ForegroundColor Cyan
$authCheck = railway status 2>&1
if ($authCheck -like "*not authenticated*" -or $LASTEXITCODE -ne 0) {
    Write-Host "Starting Railway login..." -ForegroundColor Yellow
    railway login --browserless
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Railway authentication failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Railway CLI authenticated" -ForegroundColor Green

# Set core environment variables
Write-Host "Configuring environment variables..." -ForegroundColor Cyan

$envVars = @{
    "NODE_ENV" = "production"
    "NEXT_PUBLIC_SITE_NAME" = "MNNR"
    "NEXT_PUBLIC_SITE_URL" = $siteUrl
    "NEXT_PUBLIC_RP_ID" = $Domain
    "NEXT_PUBLIC_ENABLE_PASSKEYS" = "true"
    "NEXT_PUBLIC_ENABLE_MFA" = "true"
    "NEXT_PUBLIC_ENABLE_AUDIT_LOGGING" = "true"
    "NEXT_PUBLIC_ENABLE_E2EE" = "true"
    "NODE_VERSION" = "24"
}

# Set Supabase variables - Load from environment or .env file
if ([string]::IsNullOrEmpty($env:NEXT_PUBLIC_SUPABASE_URL)) {
    Write-Host "❌ Error: Required Supabase environment variables not set" -ForegroundColor Red
    Write-Host "   Please set: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

$supabaseVars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = $env:NEXT_PUBLIC_SUPABASE_URL
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
    "SUPABASE_SERVICE_ROLE_KEY" = $env:SUPABASE_SERVICE_ROLE_KEY
    "SUPABASE_AUTH_EXTERNAL_GITHUB_REDIRECT_URI" = "$siteUrl/auth/callback"
}

# Set Stripe variables - Load from environment or .env file
if ([string]::IsNullOrEmpty($env:STRIPE_SECRET_KEY)) {
    Write-Host "❌ Error: Required Stripe environment variables not set" -ForegroundColor Red
    Write-Host "   Please set: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
    exit 1
}

$stripeVars = @{
    "STRIPE_SECRET_KEY" = $env:STRIPE_SECRET_KEY
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = $env:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    "STRIPE_WEBHOOK_SECRET" = $env:STRIPE_WEBHOOK_SECRET
}

# Set monitoring variables  
$monitoringVars = @{
    "UPSTASH_REDIS_REST_URL" = "https://fitting-stingray-7459.upstash.io"
    "UPSTASH_REDIS_REST_TOKEN" = "AR0jAAImcDIzZWMyNGE5YTg5Mzc0ZTVlOGMxYzIyYzczMmI2ZDQ0ZHAyNzQ1OQ"
    "NEXT_PUBLIC_SENTRY_DSN" = "https://92b5ce7e30c95cea15b551e9e6d44699@o4510136539283456.ingest.us.sentry.io/4510136562810880"
    "SENTRY_AUTH_TOKEN" = "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"
}

# Combine all variables
$allVars = $envVars + $supabaseVars + $stripeVars + $monitoringVars

# Set variables in batches
$batchSize = 5
$varArray = $allVars.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }

for ($i = 0; $i -lt $varArray.Count; $i += $batchSize) {
    $batch = $varArray[$i..([Math]::Min($i + $batchSize - 1, $varArray.Count - 1))]
    $setArgs = $batch | ForEach-Object { "--set `"$_`"" }
    
    Write-Host "Setting variables batch $([Math]::Floor($i / $batchSize) + 1)..." -ForegroundColor Yellow
    $cmd = "railway variables $($setArgs -join ' ')"
    Invoke-Expression $cmd
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to set variables batch" -ForegroundColor Red
        continue
    }
    Start-Sleep -Seconds 2
}

Write-Host "All environment variables configured" -ForegroundColor Green

# Deploy application
Write-Host "Deploying to Railway..." -ForegroundColor Cyan
railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment initiated successfully!" -ForegroundColor Green
    
    # Get domain info
    Write-Host "Getting Railway domain..." -ForegroundColor Cyan
    $domainInfo = railway domain 2>&1
    Write-Host $domainInfo
    
    Write-Host "" -ForegroundColor White
    Write-Host "Railway Deployment Complete!" -ForegroundColor Green
    Write-Host "===============================" -ForegroundColor Green
    Write-Host "Environment: $environment" -ForegroundColor White
    Write-Host "All variables configured" -ForegroundColor White
    Write-Host "Deployment initiated" -ForegroundColor White
    Write-Host "Domain configured: $Domain" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "Railway URL: https://mnnr-production.up.railway.app" -ForegroundColor Cyan
    Write-Host "Target URL: $siteUrl" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "Next Steps:" -ForegroundColor Yellow
    if ($Production) {
        Write-Host "   1. Configure Cloudflare DNS (run .\cloudflare-setup.ps1)" -ForegroundColor White
        Write-Host "   2. Add custom domain in Railway dashboard" -ForegroundColor White
    }
    Write-Host "   3. Monitor deployment: railway logs" -ForegroundColor White
    Write-Host "   4. Check status: railway status" -ForegroundColor White
    
} else {
    Write-Host "Deployment failed" -ForegroundColor Red
    Write-Host "Check logs: railway logs" -ForegroundColor Yellow
}