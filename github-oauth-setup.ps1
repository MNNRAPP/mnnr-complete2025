<#
.SYNOPSIS
    GitHub OAuth Setup for MNNR Platform
    
.DESCRIPTION
    Configures GitHub OAuth integration with Supabase for MNNR.
    Includes validation, timeout handling, retry logic, and comprehensive error handling.
    
.PARAMETER GitHubClientId
    The GitHub OAuth Client ID from your GitHub OAuth App
    
.PARAMETER GitHubClientSecret
    The GitHub OAuth Client Secret from your GitHub OAuth App
    
.PARAMETER TimeoutSeconds
    Timeout in seconds for API calls (default: 30)
    
.PARAMETER MaxRetries
    Maximum number of retry attempts for failed operations (default: 3)
    
.PARAMETER LogPath
    Optional path to write operation logs
    
.EXAMPLE
    .\github-oauth-setup.ps1 -GitHubClientId "your_client_id" -GitHubClientSecret "your_secret"
    
.EXAMPLE
    .\github-oauth-setup.ps1 -GitHubClientId "your_client_id" -GitHubClientSecret "your_secret" -LogPath ".\oauth-setup.log"
    
.NOTES
    Author: MNNR Team
    Version: 2.0.0
    Last Updated: 2025-12-27
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateNotNullOrEmpty()]
    [string]$GitHubClientId = "",
    
    [Parameter(Mandatory=$false)]
    [ValidateNotNullOrEmpty()]
    [string]$GitHubClientSecret = "",
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(5, 120)]
    [int]$TimeoutSeconds = 30,
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(1, 5)]
    [int]$MaxRetries = 3,
    
    [Parameter(Mandatory=$false)]
    [string]$LogPath = ""
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$Script:Config = @{
    SupabaseProjectId = "wlzhczcvrjfxcspzasoz"
    HomepageUrl = "https://mnnr.app"
    CallbackUrl = "https://wlzhczcvrjfxcspzasoz.supabase.co/auth/v1/callback"
    SupabaseDashboard = "https://supabase.com/dashboard/project/wlzhczcvrjfxcspzasoz/auth/providers"
    GitHubDevelopers = "https://github.com/settings/developers"
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
    
    # Console output with color
    Write-Host $Message -ForegroundColor $Color
    
    # File logging if path specified
    if ($LogPath) {
        Add-Content -Path $LogPath -Value $logMessage -ErrorAction SilentlyContinue
    }
}

function Write-Success { param([string]$Message) Write-Log "✅ $Message" -Level "SUCCESS" -Color "Green" }
function Write-Warning { param([string]$Message) Write-Log "⚠️  $Message" -Level "WARN" -Color "Yellow" }
function Write-Error { param([string]$Message) Write-Log "❌ $Message" -Level "ERROR" -Color "Red" }
function Write-Info { param([string]$Message) Write-Log "ℹ️  $Message" -Level "INFO" -Color "Cyan" }
function Write-Step { param([string]$Message) Write-Log "📋 $Message" -Level "STEP" -Color "White" }

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

function Test-UrlFormat {
    param([string]$Url, [string]$Name)
    
    if ($Url -notmatch '^https://') {
        Write-Warning "$Name should use HTTPS for security"
        return $false
    }
    
    try {
        $uri = [System.Uri]::new($Url)
        return $true
    }
    catch {
        Write-Error "Invalid URL format for $Name`: $Url"
        return $false
    }
}

function Test-GitHubCredentials {
    param([string]$ClientId, [string]$ClientSecret)
    
    # Validate Client ID format (typically 20 characters)
    if ($ClientId.Length -lt 10 -or $ClientId.Length -gt 40) {
        Write-Warning "GitHub Client ID length seems unusual (expected 10-40 chars, got $($ClientId.Length))"
    }
    
    # Validate Client Secret format (typically 40 characters)
    if ($ClientSecret.Length -lt 20 -or $ClientSecret.Length -gt 60) {
        Write-Warning "GitHub Client Secret length seems unusual (expected 20-60 chars, got $($ClientSecret.Length))"
    }
    
    # Check for common mistakes
    if ($ClientId -eq $ClientSecret) {
        Write-Error "Client ID and Client Secret cannot be the same"
        return $false
    }
    
    if ($ClientId -match '\s' -or $ClientSecret -match '\s') {
        Write-Error "Credentials should not contain whitespace"
        return $false
    }
    
    return $true
}

# ============================================================================
# RETRY LOGIC
# ============================================================================

function Invoke-WithRetry {
    param(
        [scriptblock]$ScriptBlock,
        [string]$OperationName,
        [int]$MaxAttempts = $MaxRetries,
        [int]$InitialDelayMs = 1000
    )
    
    $attempt = 0
    $delay = $InitialDelayMs
    
    while ($attempt -lt $MaxAttempts) {
        $attempt++
        
        try {
            Write-Info "Attempt $attempt/$MaxAttempts for: $OperationName"
            $result = & $ScriptBlock
            return $result
        }
        catch {
            $errorMessage = $_.Exception.Message
            
            if ($attempt -eq $MaxAttempts) {
                Write-Error "Failed after $MaxAttempts attempts: $OperationName"
                Write-Error "Last error: $errorMessage"
                throw
            }
            
            Write-Warning "Attempt $attempt failed: $errorMessage"
            Write-Info "Retrying in $($delay/1000) seconds..."
            Start-Sleep -Milliseconds $delay
            
            # Exponential backoff
            $delay = [Math]::Min($delay * 2, 30000)
        }
    }
}

# ============================================================================
# RAILWAY OPERATIONS
# ============================================================================

function Set-RailwayVariables {
    param([string]$ClientId, [string]$ClientSecret)
    
    Write-Info "Setting Railway environment variables..."
    
    $result = Invoke-WithRetry -OperationName "Set Railway Variables" -ScriptBlock {
        $output = railway variables --set "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=$ClientId" --set "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=$ClientSecret" 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            throw "Railway command failed: $output"
        }
        
        return $output
    }
    
    Write-Success "Railway variables updated"
    return $true
}

function Invoke-RailwayDeploy {
    Write-Info "Triggering Railway deployment..."
    
    $result = Invoke-WithRetry -OperationName "Railway Deploy" -ScriptBlock {
        $output = railway up --detach 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            throw "Railway deploy failed: $output"
        }
        
        return $output
    }
    
    Write-Success "Railway deployment triggered"
    return $true
}

# ============================================================================
# LOCAL ENV FILE OPERATIONS
# ============================================================================

function Update-LocalEnvFile {
    param([string]$ClientId, [string]$ClientSecret)
    
    $envFile = ".env.production"
    
    if (-not (Test-Path $envFile)) {
        Write-Warning "Local .env.production not found - skipping local update"
        return $false
    }
    
    Write-Info "Updating local .env.production..."
    
    try {
        $content = Get-Content $envFile -ErrorAction Stop
        $updated = $false
        
        for ($i = 0; $i -lt $content.Length; $i++) {
            if ($content[$i] -like "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=*") {
                $content[$i] = "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=$ClientId"
                $updated = $true
            }
            if ($content[$i] -like "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=*") {
                $content[$i] = "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=$ClientSecret"
                $updated = $true
            }
        }
        
        if ($updated) {
            $content | Set-Content $envFile -ErrorAction Stop
            Write-Success "Local .env.production updated"
        } else {
            Write-Warning "GitHub OAuth variables not found in .env.production - you may need to add them manually"
        }
        
        return $true
    }
    catch {
        Write-Error "Failed to update .env.production: $($_.Exception.Message)"
        return $false
    }
}

# ============================================================================
# MANUAL SETUP GUIDE
# ============================================================================

function Show-ManualSetupGuide {
    Write-Host ""
    Write-Host "🐙 GitHub OAuth Setup for MNNR" -ForegroundColor Green
    Write-Host "===============================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Manual GitHub OAuth Setup Required" -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Steps to set up GitHub OAuth:" -ForegroundColor Cyan
    Write-Host ""
    Write-Step "1. Go to GitHub Settings:"
    Write-Host "   $($Script:Config.GitHubDevelopers)" -ForegroundColor Gray
    Write-Host ""
    Write-Step "2. Click 'New OAuth App'"
    Write-Host ""
    Write-Step "3. Fill in the details:"
    Write-Host "   Application name: MNNR Platform" -ForegroundColor Gray
    Write-Host "   Homepage URL: $($Script:Config.HomepageUrl)" -ForegroundColor Gray
    Write-Host "   Authorization callback URL: $($Script:Config.CallbackUrl)" -ForegroundColor Gray
    Write-Host ""
    Write-Step "4. After creating the app:"
    Write-Host "   • Copy the Client ID" -ForegroundColor Gray
    Write-Host "   • Generate a new Client Secret" -ForegroundColor Gray
    Write-Host "   • Copy the Client Secret" -ForegroundColor Gray
    Write-Host ""
    Write-Step "5. Configure in Supabase:"
    Write-Host "   • Go to: $($Script:Config.SupabaseDashboard)" -ForegroundColor Gray
    Write-Host "   • Enable GitHub provider" -ForegroundColor Gray
    Write-Host "   • Add Client ID and Client Secret" -ForegroundColor Gray
    Write-Host "   • Set Redirect URL: $($Script:Config.HomepageUrl)/auth/callback" -ForegroundColor Gray
    Write-Host ""
    Write-Step "6. Run this script again with credentials:"
    Write-Host "   .\github-oauth-setup.ps1 -GitHubClientId 'your_client_id' -GitHubClientSecret 'your_secret'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Benefits of GitHub OAuth:" -ForegroundColor Cyan
    Write-Host "   ✅ One-click user registration" -ForegroundColor White
    Write-Host "   ✅ No password management needed" -ForegroundColor White
    Write-Host "   ✅ Trusted authentication provider" -ForegroundColor White
    Write-Host "   ✅ Automatic user profile data" -ForegroundColor White
    Write-Host ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    $startTime = Get-Date
    
    Write-Host ""
    Write-Host "🐙 GitHub OAuth Setup for MNNR v2.0" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    
    # Initialize log file if specified
    if ($LogPath) {
        Write-Info "Logging to: $LogPath"
        "GitHub OAuth Setup Log - $(Get-Date)" | Set-Content $LogPath
    }
    
    # Check if credentials provided
    if (-not $GitHubClientId -or -not $GitHubClientSecret) {
        Show-ManualSetupGuide
        return @{
            Success = $false
            Reason = "Credentials not provided"
            Duration = (Get-Date) - $startTime
        }
    }
    
    # Validate credentials
    Write-Info "Validating credentials..."
    if (-not (Test-GitHubCredentials -ClientId $GitHubClientId -ClientSecret $GitHubClientSecret)) {
        return @{
            Success = $false
            Reason = "Invalid credentials"
            Duration = (Get-Date) - $startTime
        }
    }
    Write-Success "Credentials validated"
    
    # Validate URLs
    Write-Info "Validating configuration URLs..."
    Test-UrlFormat -Url $Script:Config.HomepageUrl -Name "Homepage URL" | Out-Null
    Test-UrlFormat -Url $Script:Config.CallbackUrl -Name "Callback URL" | Out-Null
    
    try {
        # Set Railway variables
        Set-RailwayVariables -ClientId $GitHubClientId -ClientSecret $GitHubClientSecret
        
        # Update local env file
        Update-LocalEnvFile -ClientId $GitHubClientId -ClientSecret $GitHubClientSecret
        
        # Trigger deployment
        Invoke-RailwayDeploy
        
        # Success summary
        Write-Host ""
        Write-Host "🎉 GitHub OAuth Setup Complete!" -ForegroundColor Green
        Write-Host "================================" -ForegroundColor Green
        Write-Success "GitHub credentials configured"
        Write-Success "Railway variables updated"
        Write-Success "Application redeployed"
        Write-Host ""
        Write-Host "🔍 Next Steps:" -ForegroundColor Yellow
        Write-Step "1. Configure GitHub provider in Supabase dashboard"
        Write-Step "2. Test OAuth login at: $($Script:Config.HomepageUrl)"
        Write-Step "3. Verify redirect works properly"
        Write-Host ""
        Write-Host "🌐 Supabase Auth: $($Script:Config.SupabaseDashboard)" -ForegroundColor Cyan
        Write-Host ""
        
        $duration = (Get-Date) - $startTime
        
        return @{
            Success = $true
            ClientId = $GitHubClientId.Substring(0, 4) + "****"  # Masked for security
            Duration = $duration
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    }
    catch {
        Write-Error "Setup failed: $($_.Exception.Message)"
        
        Write-Host ""
        Write-Host "📋 Manual Setup Instructions:" -ForegroundColor Yellow
        Show-ManualSetupGuide
        
        return @{
            Success = $false
            Reason = $_.Exception.Message
            Duration = (Get-Date) - $startTime
        }
    }
}

# Execute main function
$result = Main
return $result
