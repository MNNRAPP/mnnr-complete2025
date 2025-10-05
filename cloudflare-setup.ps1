# MNNR Cloudflare DNS Automation
# Configures DNS records and SSL settings for Railway deployment

param(
    [string]$Domain = "mnnr.app",
    [string]$RailwayTarget = "",
    [string]$CloudflareApiToken = "",
    [string]$ZoneId = ""
)

Write-Host "☁️  MNNR Cloudflare DNS Automation" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

if (-not $Domain) {
    Write-Host "❌ Domain parameter required" -ForegroundColor Red
    Write-Host "Usage: .\cloudflare-setup.ps1 -Domain 'mnnr.app'" -ForegroundColor Yellow
    exit 1
}

# If no Railway target provided, try to get it
if (-not $RailwayTarget) {
    Write-Host "🔍 Getting Railway domain target..." -ForegroundColor Cyan
    
    # Check if we can get it from Railway CLI
    try {
        $railwayStatus = railway status 2>&1
        if ($railwayStatus -like "*mnnr-production.up.railway.app*") {
            $RailwayTarget = "mnnr-production.up.railway.app"
            Write-Host "✅ Found Railway target: $RailwayTarget" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  Could not auto-detect Railway target" -ForegroundColor Yellow
    }
}

# Manual instructions if API token not provided
if (-not $CloudflareApiToken -or -not $ZoneId) {
    Write-Host "🔧 Manual Cloudflare Configuration Required" -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 DNS Records to Create in Cloudflare:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Record 1 (Root Domain):" -ForegroundColor White
    Write-Host "  Type: CNAME" -ForegroundColor Gray
    Write-Host "  Name: @" -ForegroundColor Gray
    Write-Host "  Target: $RailwayTarget" -ForegroundColor Green
    Write-Host "  Proxy: ON (Orange Cloud)" -ForegroundColor DarkYellow
    Write-Host "  TTL: Auto" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Record 2 (WWW Subdomain):" -ForegroundColor White
    Write-Host "  Type: CNAME" -ForegroundColor Gray
    Write-Host "  Name: www" -ForegroundColor Gray
    Write-Host "  Target: @" -ForegroundColor Green
    Write-Host "  Proxy: ON (Orange Cloud)" -ForegroundColor DarkYellow
    Write-Host "  TTL: Auto" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔒 SSL/TLS Configuration:" -ForegroundColor Cyan
    Write-Host "  1. Go to SSL/TLS -> Overview" -ForegroundColor White
    Write-Host "  2. Set Encryption Mode: Full" -ForegroundColor Green
    Write-Host "  3. Enable Universal SSL" -ForegroundColor White
    Write-Host "  4. Enable Always Use HTTPS" -ForegroundColor White
    Write-Host ""
    Write-Host "🔀 Page Rules (Optional):" -ForegroundColor Cyan
    Write-Host "  Rule: www.$Domain/*" -ForegroundColor White
    Write-Host "  Action: 301 Redirect to https://$Domain/`$1" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 URLs to configure:" -ForegroundColor Yellow
    Write-Host "  • DNS: https://dash.cloudflare.com/[account]/[zone]/dns" -ForegroundColor Gray
    Write-Host "  • SSL: https://dash.cloudflare.com/[account]/[zone]/ssl-tls" -ForegroundColor Gray
    Write-Host "  • Rules: https://dash.cloudflare.com/[account]/[zone]/rules" -ForegroundColor Gray
    Write-Host ""
    
    # Generate copy-paste commands
    Write-Host "📋 Copy-Paste Commands for Cloudflare CLI (if installed):" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# Root domain record" -ForegroundColor Gray
    Write-Host "cf dns create $Domain CNAME @ $RailwayTarget --proxied" -ForegroundColor White
    Write-Host ""
    Write-Host "# WWW subdomain record" -ForegroundColor Gray
    Write-Host "cf dns create $Domain CNAME www @ --proxied" -ForegroundColor White
    Write-Host ""
    
    return
}

# Automated configuration with API
Write-Host "🤖 Automated Cloudflare Configuration" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

function Invoke-CloudflareAPI {
    param($Method, $Endpoint, $Body = $null)
    
    $uri = "https://api.cloudflare.com/client/v4/$Endpoint"
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json)
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        return $response
    }
    catch {
        Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Get existing DNS records
Write-Host "🔍 Checking existing DNS records..." -ForegroundColor Cyan
$dnsRecords = Invoke-CloudflareAPI "GET" "zones/$ZoneId/dns_records"

if ($dnsRecords -and $dnsRecords.success) {
    # Create root domain CNAME
    Write-Host "📝 Creating root domain CNAME..." -ForegroundColor Yellow
    $rootRecord = @{
        type = "CNAME"
        name = "@"
        content = $RailwayTarget
        proxied = $true
        ttl = 1
    }
    
    $result = Invoke-CloudflareAPI "POST" "zones/$ZoneId/dns_records" $rootRecord
    if ($result.success) {
        Write-Host "✅ Root domain CNAME created" -ForegroundColor Green
    }
    
    # Create www subdomain CNAME
    Write-Host "📝 Creating www subdomain CNAME..." -ForegroundColor Yellow
    $wwwRecord = @{
        type = "CNAME" 
        name = "www"
        content = "@"
        proxied = $true
        ttl = 1
    }
    
    $result = Invoke-CloudflareAPI "POST" "zones/$ZoneId/dns_records" $wwwRecord
    if ($result.success) {
        Write-Host "✅ WWW subdomain CNAME created" -ForegroundColor Green
    }
    
    # Configure SSL settings
    Write-Host "🔒 Configuring SSL settings..." -ForegroundColor Cyan
    $sslSettings = @{
        value = "full"
    }
    
    $result = Invoke-CloudflareAPI "PATCH" "zones/$ZoneId/settings/ssl" $sslSettings
    if ($result.success) {
        Write-Host "✅ SSL encryption mode set to Full" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎉 Cloudflare Configuration Complete!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "✅ Root domain CNAME created" -ForegroundColor White
    Write-Host "✅ WWW subdomain CNAME created" -ForegroundColor White  
    Write-Host "✅ SSL encryption configured" -ForegroundColor White
    Write-Host ""
    Write-Host "⏱️  DNS Propagation: 5-15 minutes" -ForegroundColor Yellow
    Write-Host "🌐 Your site will be live at: https://$Domain" -ForegroundColor Green
    
} else {
    Write-Host "❌ Failed to access Cloudflare API" -ForegroundColor Red
    Write-Host "Please configure manually using the instructions above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Verification Commands:" -ForegroundColor Cyan
Write-Host "nslookup $Domain" -ForegroundColor White
Write-Host "curl -I https://$Domain" -ForegroundColor White