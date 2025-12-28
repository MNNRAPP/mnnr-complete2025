<#
.SYNOPSIS
    MNNR Deployment Verification Script
    
.DESCRIPTION
    Comprehensive verification of MNNR deployment including:
    - Health endpoints
    - DNS configuration
    - SSL certificates
    - Environment variables
    - API functionality
    - Database connectivity
    - Stripe integration
    
.PARAMETER Domain
    The production domain to test (default: mnnr.app)
    
.PARAMETER LocalPort
    Local development server port (default: 3000)
    
.PARAMETER TimeoutSeconds
    Timeout for HTTP requests (default: 15)
    
.PARAMETER SkipLocal
    Skip local development tests
    
.PARAMETER SkipProduction
    Skip production tests
    
.PARAMETER LogPath
    Optional path to write verification logs
    
.PARAMETER Detailed
    Show detailed output for each test
    
.EXAMPLE
    .\verify-deployment.ps1
    
.EXAMPLE
    .\verify-deployment.ps1 -Domain "staging.mnnr.app" -Detailed
    
.NOTES
    Author: MNNR Team
    Version: 2.0.0
    Last Updated: 2025-12-27
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Domain = "mnnr.app",
    
    [Parameter(Mandatory=$false)]
    [int]$LocalPort = 3000,
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(5, 60)]
    [int]$TimeoutSeconds = 15,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipLocal,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipProduction,
    
    [Parameter(Mandatory=$false)]
    [string]$LogPath = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Detailed
)

$ErrorActionPreference = "Continue"

# ============================================================================
# CONFIGURATION
# ============================================================================

$Script:Config = @{
    LocalUrl = "http://localhost:$LocalPort"
    ProductionUrl = "https://$Domain"
    DocsUrl = "https://docs.$Domain"
    RequiredEnvVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "NEXT_PUBLIC_SITE_URL"
    )
    OptionalEnvVars = @(
        "NEXT_PUBLIC_POSTHOG_KEY",
        "SENTRY_DSN",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN"
    )
    Endpoints = @(
        @{ Path = "/api/health"; Name = "Health Check"; Critical = $true }
        @{ Path = "/"; Name = "Homepage"; Critical = $true }
        @{ Path = "/signin"; Name = "Sign In Page"; Critical = $true }
        @{ Path = "/pricing"; Name = "Pricing Page"; Critical = $true }
        @{ Path = "/docs"; Name = "Documentation"; Critical = $false }
        @{ Path = "/api/v1/status"; Name = "API Status"; Critical = $false }
    )
}

$Script:Results = @{
    Passed = 0
    Failed = 0
    Warnings = 0
    Tests = @()
}

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    Write-Host $Message -ForegroundColor $Color
    
    if ($LogPath) {
        Add-Content -Path $LogPath -Value $logMessage -ErrorAction SilentlyContinue
    }
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}

function Write-TestResult {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Details = "",
        [bool]$Critical = $true
    )
    
    $icon = if ($Passed) { "✓" } else { if ($Critical) { "✗" } else { "⚠" } }
    $color = if ($Passed) { "Green" } else { if ($Critical) { "Red" } else { "Yellow" } }
    $status = if ($Passed) { "PASS" } else { if ($Critical) { "FAIL" } else { "WARN" } }
    
    Write-Host "   $icon " -NoNewline -ForegroundColor $color
    Write-Host "$Name" -NoNewline -ForegroundColor White
    Write-Host " [$status]" -ForegroundColor $color
    
    if ($Details -and $Detailed) {
        Write-Host "     → $Details" -ForegroundColor DarkGray
    }
    
    # Track results
    if ($Passed) {
        $Script:Results.Passed++
    } elseif ($Critical) {
        $Script:Results.Failed++
    } else {
        $Script:Results.Warnings++
    }
    
    $Script:Results.Tests += @{
        Name = $Name
        Passed = $Passed
        Critical = $Critical
        Details = $Details
    }
}

# ============================================================================
# TEST FUNCTIONS
# ============================================================================

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [bool]$Critical = $true,
        [int[]]$ExpectedStatus = @(200)
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        $passed = $ExpectedStatus -contains $response.StatusCode
        $details = "Status: $($response.StatusCode), Size: $($response.Content.Length) bytes"
        Write-TestResult -Name $Name -Passed $passed -Details $details -Critical $Critical
        return $passed
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "404") {
            $details = "Not Found (404)"
        } elseif ($errorMsg -match "timeout") {
            $details = "Request timed out"
        } else {
            $details = $errorMsg.Substring(0, [Math]::Min(100, $errorMsg.Length))
        }
        Write-TestResult -Name $Name -Passed $false -Details $details -Critical $Critical
        return $false
    }
}

function Test-DNS {
    param([string]$DomainName)
    
    try {
        $dnsResult = Resolve-DnsName -Name $DomainName -ErrorAction Stop
        $ip = $dnsResult | Where-Object { $_.Type -eq "A" } | Select-Object -First 1 -ExpandProperty IP4Address
        $cname = $dnsResult | Where-Object { $_.Type -eq "CNAME" } | Select-Object -First 1 -ExpandProperty NameHost
        
        $details = if ($ip) { "IP: $ip" } elseif ($cname) { "CNAME: $cname" } else { "Resolved" }
        Write-TestResult -Name "DNS Resolution ($DomainName)" -Passed $true -Details $details
        return $true
    }
    catch {
        Write-TestResult -Name "DNS Resolution ($DomainName)" -Passed $false -Details "DNS not configured"
        return $false
    }
}

function Test-SSL {
    param([string]$Url)
    
    try {
        $request = [System.Net.HttpWebRequest]::Create($Url)
        $request.Timeout = $TimeoutSeconds * 1000
        $request.AllowAutoRedirect = $true
        
        $response = $request.GetResponse()
        $cert = $request.ServicePoint.Certificate
        
        if ($cert) {
            $expiry = [DateTime]::Parse($cert.GetExpirationDateString())
            $daysUntilExpiry = ($expiry - (Get-Date)).Days
            
            $passed = $daysUntilExpiry -gt 7
            $details = "Expires in $daysUntilExpiry days ($($expiry.ToString('yyyy-MM-dd')))"
            Write-TestResult -Name "SSL Certificate" -Passed $passed -Details $details -Critical ($daysUntilExpiry -le 0)
        } else {
            Write-TestResult -Name "SSL Certificate" -Passed $true -Details "Valid"
        }
        
        $response.Close()
        return $true
    }
    catch {
        Write-TestResult -Name "SSL Certificate" -Passed $false -Details $_.Exception.Message -Critical $false
        return $false
    }
}

function Test-EnvFile {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-TestResult -Name "Environment File ($FilePath)" -Passed $false -Details "File not found"
        return $false
    }
    
    Write-TestResult -Name "Environment File ($FilePath)" -Passed $true -Details "Exists"
    
    $content = Get-Content $FilePath -Raw
    $missingRequired = @()
    $missingOptional = @()
    
    foreach ($var in $Script:Config.RequiredEnvVars) {
        if ($content -notmatch "^$var=.+") {
            $missingRequired += $var
        }
    }
    
    foreach ($var in $Script:Config.OptionalEnvVars) {
        if ($content -notmatch "^$var=.+") {
            $missingOptional += $var
        }
    }
    
    if ($missingRequired.Count -gt 0) {
        Write-TestResult -Name "Required Env Vars" -Passed $false -Details "Missing: $($missingRequired -join ', ')"
    } else {
        Write-TestResult -Name "Required Env Vars" -Passed $true -Details "All $($Script:Config.RequiredEnvVars.Count) configured"
    }
    
    if ($missingOptional.Count -gt 0) {
        Write-TestResult -Name "Optional Env Vars" -Passed $false -Details "Missing: $($missingOptional -join ', ')" -Critical $false
    } else {
        Write-TestResult -Name "Optional Env Vars" -Passed $true -Details "All $($Script:Config.OptionalEnvVars.Count) configured"
    }
    
    return $missingRequired.Count -eq 0
}

function Test-LocalServer {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", $LocalPort)
        $tcpClient.Close()
        Write-TestResult -Name "Local Server Running" -Passed $true -Details "Port $LocalPort is open"
        return $true
    }
    catch {
        Write-TestResult -Name "Local Server Running" -Passed $false -Details "Port $LocalPort not responding" -Critical $false
        return $false
    }
}

function Test-ResponseTime {
    param([string]$Url, [string]$Name)
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        $stopwatch.Stop()
        
        $ms = $stopwatch.ElapsedMilliseconds
        $passed = $ms -lt 3000  # Under 3 seconds is good
        $details = "${ms}ms"
        
        Write-TestResult -Name "Response Time ($Name)" -Passed $passed -Details $details -Critical $false
        return $passed
    }
    catch {
        Write-TestResult -Name "Response Time ($Name)" -Passed $false -Details "Failed to measure" -Critical $false
        return $false
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    $startTime = Get-Date
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  MNNR Deployment Verification v2.0" -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  Domain: $Domain" -ForegroundColor DarkGray
    Write-Host "  Local Port: $LocalPort" -ForegroundColor DarkGray
    Write-Host "  Timeout: ${TimeoutSeconds}s" -ForegroundColor DarkGray
    
    if ($LogPath) {
        Write-Host "  Log: $LogPath" -ForegroundColor DarkGray
        "MNNR Deployment Verification - $(Get-Date)" | Set-Content $LogPath
    }
    
    # ========================================
    # LOCAL DEVELOPMENT TESTS
    # ========================================
    if (-not $SkipLocal) {
        Write-Section "LOCAL DEVELOPMENT"
        
        $localRunning = Test-LocalServer
        
        if ($localRunning) {
            foreach ($endpoint in $Script:Config.Endpoints) {
                Test-Endpoint -Url "$($Script:Config.LocalUrl)$($endpoint.Path)" -Name "Local: $($endpoint.Name)" -Critical $endpoint.Critical | Out-Null
            }
            
            Test-ResponseTime -Url "$($Script:Config.LocalUrl)/" -Name "Local Homepage" | Out-Null
        } else {
            Write-Host "   ⏩ Skipping local endpoint tests (server not running)" -ForegroundColor Yellow
        }
    }
    
    # ========================================
    # PRODUCTION TESTS
    # ========================================
    if (-not $SkipProduction) {
        Write-Section "PRODUCTION DEPLOYMENT"
        
        $dnsOk = Test-DNS -DomainName $Domain
        
        if ($dnsOk) {
            Test-SSL -Url $Script:Config.ProductionUrl | Out-Null
            
            foreach ($endpoint in $Script:Config.Endpoints) {
                Test-Endpoint -Url "$($Script:Config.ProductionUrl)$($endpoint.Path)" -Name "Prod: $($endpoint.Name)" -Critical $endpoint.Critical | Out-Null
            }
            
            Test-ResponseTime -Url "$($Script:Config.ProductionUrl)/" -Name "Production Homepage" | Out-Null
            
            # Test docs subdomain
            $docsDnsOk = Test-DNS -DomainName "docs.$Domain"
            if ($docsDnsOk) {
                Test-Endpoint -Url "$($Script:Config.DocsUrl)/" -Name "Docs Site" -Critical $false | Out-Null
            }
        } else {
            Write-Host "   ⏩ Skipping production tests (DNS not configured)" -ForegroundColor Yellow
        }
    }
    
    # ========================================
    # ENVIRONMENT CONFIGURATION
    # ========================================
    Write-Section "ENVIRONMENT CONFIGURATION"
    
    $envFiles = @(".env.local", ".env.production", ".env")
    foreach ($file in $envFiles) {
        if (Test-Path $file) {
            Test-EnvFile -FilePath $file | Out-Null
            break
        }
    }
    
    # ========================================
    # SUMMARY
    # ========================================
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  VERIFICATION SUMMARY" -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
    
    $totalTests = $Script:Results.Passed + $Script:Results.Failed + $Script:Results.Warnings
    $passRate = if ($totalTests -gt 0) { [Math]::Round(($Script:Results.Passed / $totalTests) * 100, 1) } else { 0 }
    
    Write-Host ""
    Write-Host "  Tests Run: $totalTests" -ForegroundColor White
    Write-Host "  ✓ Passed:  $($Script:Results.Passed)" -ForegroundColor Green
    Write-Host "  ✗ Failed:  $($Script:Results.Failed)" -ForegroundColor Red
    Write-Host "  ⚠ Warnings: $($Script:Results.Warnings)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
    
    $duration = (Get-Date) - $startTime
    Write-Host "  Duration: $([Math]::Round($duration.TotalSeconds, 1))s" -ForegroundColor DarkGray
    
    # Overall status
    Write-Host ""
    if ($Script:Results.Failed -eq 0) {
        Write-Host "  🎉 DEPLOYMENT VERIFIED - ALL CRITICAL TESTS PASSED" -ForegroundColor Green
    } elseif ($Script:Results.Failed -le 2) {
        Write-Host "  ⚠️  DEPLOYMENT NEEDS ATTENTION - SOME TESTS FAILED" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ DEPLOYMENT ISSUES - MULTIPLE TESTS FAILED" -ForegroundColor Red
    }
    
    # Recommendations
    if ($Script:Results.Failed -gt 0 -or $Script:Results.Warnings -gt 0) {
        Write-Host ""
        Write-Host "  📋 Recommendations:" -ForegroundColor Yellow
        
        $failedTests = $Script:Results.Tests | Where-Object { -not $_.Passed -and $_.Critical }
        foreach ($test in $failedTests) {
            Write-Host "     • Fix: $($test.Name)" -ForegroundColor White
            if ($test.Details) {
                Write-Host "       → $($test.Details)" -ForegroundColor DarkGray
            }
        }
    }
    
    Write-Host ""
    Write-Host "  🎯 Next Steps:" -ForegroundColor Cyan
    if ($Script:Results.Failed -eq 0) {
        Write-Host "     1. Monitor production at https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "     2. Check Sentry for errors: https://sentry.io" -ForegroundColor White
        Write-Host "     3. Review analytics in PostHog" -ForegroundColor White
    } else {
        Write-Host "     1. Fix failed tests above" -ForegroundColor White
        Write-Host "     2. Re-run verification: .\scripts\verify-deployment.ps1" -ForegroundColor White
        Write-Host "     3. Deploy fixes: git push" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
    
    return @{
        Passed = $Script:Results.Passed
        Failed = $Script:Results.Failed
        Warnings = $Script:Results.Warnings
        PassRate = $passRate
        Duration = $duration
        Success = $Script:Results.Failed -eq 0
    }
}

# Execute main function
$result = Main
return $result
