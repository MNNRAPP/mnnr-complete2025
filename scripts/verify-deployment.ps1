# MNNR Deployment Verification Script
# Tests all critical endpoints and configuration

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "  MNNR Deployment Verification" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue

$DOMAIN = "docs.mnnr.app"
$LOCAL_URL = "http://localhost:3000"

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description
    )

    Write-Host "`n🧪 Testing: " -NoNewline -ForegroundColor Blue
    Write-Host $Description -ForegroundColor White
    Write-Host "   URL: $Url" -ForegroundColor DarkGray

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✓ " -NoNewline -ForegroundColor Green
            Write-Host "SUCCESS (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ⚠ " -NoNewline -ForegroundColor Yellow
            Write-Host "WARNING (Status: $($response.StatusCode))" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "   ✗ " -NoNewline -ForegroundColor Red
        Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-DNS {
    param([string]$Domain)

    Write-Host "`n🌐 Checking DNS resolution for $Domain..." -ForegroundColor Blue

    try {
        $dnsResult = Resolve-DnsName -Name $Domain -ErrorAction Stop
        Write-Host "   ✓ DNS resolved to: " -NoNewline -ForegroundColor Green
        Write-Host "$($dnsResult[0].IP4Address)" -ForegroundColor Cyan
        return $true
    } catch {
        Write-Host "   ✗ DNS not configured" -ForegroundColor Red
        Write-Host "   Action required: Add CNAME record in your DNS provider" -ForegroundColor Yellow
        return $false
    }
}

# Check Local Development
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "LOCAL DEVELOPMENT TESTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$localHealth = Test-Endpoint -Url "$LOCAL_URL/api/health" -Description "Health Endpoint"
$localDocs = Test-Endpoint -Url "$LOCAL_URL/docs" -Description "Docs Page"

# Check Production Deployment
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "PRODUCTION DEPLOYMENT TESTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$dnsOk = Test-DNS -Domain $DOMAIN

if ($dnsOk) {
    $prodHealth = Test-Endpoint -Url "https://$DOMAIN/api/health" -Description "Production Health"
    $prodDocs = Test-Endpoint -Url "https://$DOMAIN/docs" -Description "Production Docs"

    # Check SSL Certificate
    Write-Host "`n🔒 Checking SSL Certificate..." -ForegroundColor Blue
    try {
        $req = [System.Net.HttpWebRequest]::Create("https://$DOMAIN")
        $req.GetResponse() | Out-Null
        Write-Host "   ✓ SSL certificate valid" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠ SSL certificate issue (may still be provisioning)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⏩ Skipping production tests (DNS not configured)" -ForegroundColor Yellow
}

# Environment Variables Check
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "ENVIRONMENT CONFIGURATION" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$envFiles = @(".env.local", ".env.production")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file exists" -ForegroundColor Green
        $content = Get-Content $file
        $requiredVars = @(
            "NEXT_PUBLIC_SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY",
            "NEXT_PUBLIC_POSTHOG_KEY",
            "NEXT_PUBLIC_SITE_URL"
        )
        foreach ($var in $requiredVars) {
            if ($content -match "^$var=") {
                Write-Host "     ✓ $var configured" -ForegroundColor DarkGreen
            } else {
                Write-Host "     ✗ $var missing" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "   ✗ $file missing" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "  VERIFICATION SUMMARY" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue

$allPassed = $localHealth -and $localDocs

Write-Host "`nLocal Development: " -NoNewline
if ($allPassed) {
    Write-Host "✓ READY" -ForegroundColor Green
} else {
    Write-Host "✗ ISSUES FOUND" -ForegroundColor Red
}

Write-Host "Production Deployment: " -NoNewline
if ($dnsOk) {
    Write-Host "✓ DNS CONFIGURED" -ForegroundColor Green
} else {
    Write-Host "⚠ DNS NOT CONFIGURED" -ForegroundColor Yellow
}

if (!$dnsOk) {
    Write-Host "`n📝 To configure DNS:" -ForegroundColor Yellow
    Write-Host "1. Log in to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)" -ForegroundColor White
    Write-Host "2. Go to DNS management for mnnr.app" -ForegroundColor White
    Write-Host "3. Add a new CNAME record:" -ForegroundColor White
    Write-Host "   - Type: CNAME" -ForegroundColor Cyan
    Write-Host "   - Name: docs" -ForegroundColor Cyan
    Write-Host "   - Value: cname.vercel-dns.com" -ForegroundColor Cyan
    Write-Host "   - TTL: 3600" -ForegroundColor Cyan
    Write-Host "4. Wait 5-10 minutes for DNS propagation" -ForegroundColor White
    Write-Host "5. Run this script again to verify" -ForegroundColor White
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
if (!$dnsOk) {
    Write-Host "1. Configure DNS (see instructions above)" -ForegroundColor White
    Write-Host "2. Deploy to Vercel: .\scripts\deploy-docs.ps1" -ForegroundColor White
} else {
    Write-Host "1. Deploy to Vercel: .\scripts\deploy-docs.ps1" -ForegroundColor White
    Write-Host "2. Monitor deployment at https://vercel.com/dashboard" -ForegroundColor White
}

Write-Host "`n🎉 Done!" -ForegroundColor Green
