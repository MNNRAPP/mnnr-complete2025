<#
.SYNOPSIS
    MNNR Complete Stripe Automation
    
.DESCRIPTION
    Creates Stripe products, sets webhook secrets, and deploys the application.
    Includes validation, timeout handling, retry logic, and comprehensive error handling.
    
.PARAMETER TimeoutSeconds
    Timeout in seconds for API calls (default: 30)
    
.PARAMETER MaxRetries
    Maximum number of retry attempts for failed operations (default: 3)
    
.PARAMETER LogPath
    Optional path to write operation logs
    
.PARAMETER SkipDeploy
    Skip the deployment step after configuration
    
.EXAMPLE
    .\auto-stripe-setup.ps1
    
.EXAMPLE
    .\auto-stripe-setup.ps1 -LogPath ".\stripe-setup.log" -MaxRetries 5
    
.NOTES
    Author: MNNR Team
    Version: 2.0.0
    Last Updated: 2025-12-27
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateRange(5, 120)]
    [int]$TimeoutSeconds = 30,
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(1, 5)]
    [int]$MaxRetries = 3,
    
    [Parameter(Mandatory=$false)]
    [string]$LogPath = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDeploy
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$Script:Config = @{
    StripeApiBase = "https://api.stripe.com/v1"
    StripeDashboard = "https://dashboard.stripe.com/test/products"
    ProductionUrl = "https://mnnr.app"
    Products = @(
        @{
            Name = "Free"
            Description = "Perfect for getting started with MNNR"
            Price = 0
            Interval = "month"
            Features = @("10,000 API calls/month", "1 API key", "Community support")
        },
        @{
            Name = "Pro"
            Description = "For growing businesses and professional developers"
            Price = 4900  # $49.00 in cents
            Interval = "month"
            Features = @("100,000 API calls/month", "10 API keys", "Priority support", "Analytics dashboard")
        },
        @{
            Name = "Enterprise"
            Description = "Custom solutions for large organizations"
            Price = 0  # Custom pricing
            Interval = "month"
            Features = @("Unlimited API calls", "Unlimited API keys", "Dedicated support", "SLA guarantee", "Custom integrations")
        }
    )
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

function Write-Success { param([string]$Message) Write-Log "✅ $Message" -Level "SUCCESS" -Color "Green" }
function Write-Warning { param([string]$Message) Write-Log "⚠️  $Message" -Level "WARN" -Color "Yellow" }
function Write-Error { param([string]$Message) Write-Log "❌ $Message" -Level "ERROR" -Color "Red" }
function Write-Info { param([string]$Message) Write-Log "ℹ️  $Message" -Level "INFO" -Color "Cyan" }
function Write-Step { param([string]$Message) Write-Log "📋 $Message" -Level "STEP" -Color "White" }

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

function Test-StripeKey {
    param([string]$Key)
    
    if ([string]::IsNullOrEmpty($Key)) {
        return $false
    }
    
    # Validate key format (sk_test_ or sk_live_)
    if ($Key -notmatch '^sk_(test|live)_[a-zA-Z0-9]+$') {
        Write-Warning "Stripe key format may be invalid"
    }
    
    return $true
}

function Test-WebhookSecret {
    param([string]$Secret)
    
    if ([string]::IsNullOrEmpty($Secret)) {
        return $false
    }
    
    # Validate webhook secret format (whsec_)
    if ($Secret -notmatch '^whsec_[a-zA-Z0-9]+$') {
        Write-Warning "Webhook secret format may be invalid"
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
            
            $delay = [Math]::Min($delay * 2, 30000)
        }
    }
}

# ============================================================================
# STRIPE API FUNCTIONS
# ============================================================================

function Invoke-StripeApi {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Body = "",
        [hashtable]$Headers
    )
    
    $uri = "$($Script:Config.StripeApiBase)/$Endpoint"
    
    $params = @{
        Uri = $uri
        Method = $Method
        Headers = $Headers
        TimeoutSec = $TimeoutSeconds
        ErrorAction = "Stop"
    }
    
    if ($Body -and $Method -ne "GET") {
        $params.Body = $Body
    }
    
    try {
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
        }
    }
    catch {
        $errorBody = $null
        
        # Try to parse Stripe error response
        if ($_.Exception.Response) {
            try {
                $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
                $reader.Close()
            }
            catch { }
        }
        
        return @{
            Success = $false
            Error = $_.Exception.Message
            StripeError = $errorBody
        }
    }
}

function New-StripeProduct {
    param(
        [string]$Name,
        [string]$Description,
        [hashtable]$Headers
    )
    
    Write-Info "Creating product: $Name"
    
    $body = "name=$([System.Web.HttpUtility]::UrlEncode($Name))&description=$([System.Web.HttpUtility]::UrlEncode($Description))"
    
    $result = Invoke-WithRetry -OperationName "Create Product: $Name" -ScriptBlock {
        $response = Invoke-StripeApi -Endpoint "products" -Method "POST" -Body $body -Headers $Headers
        
        if (-not $response.Success) {
            $errorMsg = if ($response.StripeError.error.message) { $response.StripeError.error.message } else { $response.Error }
            throw "Stripe API error: $errorMsg"
        }
        
        return $response.Data
    }
    
    Write-Success "Product created: $($result.id)"
    return $result
}

function New-StripePrice {
    param(
        [string]$ProductId,
        [int]$Amount,
        [string]$Interval,
        [hashtable]$Headers
    )
    
    Write-Info "Creating price for product: $ProductId"
    
    $body = "product=$ProductId&currency=usd"
    
    if ($Amount -gt 0) {
        $body += "&unit_amount=$Amount&recurring[interval]=$Interval"
    } else {
        # Free tier - create a $0 price
        $body += "&unit_amount=0&recurring[interval]=$Interval"
    }
    
    $result = Invoke-WithRetry -OperationName "Create Price" -ScriptBlock {
        $response = Invoke-StripeApi -Endpoint "prices" -Method "POST" -Body $body -Headers $Headers
        
        if (-not $response.Success) {
            $errorMsg = if ($response.StripeError.error.message) { $response.StripeError.error.message } else { $response.Error }
            throw "Stripe API error: $errorMsg"
        }
        
        return $response.Data
    }
    
    Write-Success "Price created: $($result.id)"
    return $result
}

function New-AllStripeProducts {
    param([hashtable]$Headers)
    
    Write-Host ""
    Write-Host "🏗️  Creating Stripe Products" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    
    $createdProducts = @()
    
    foreach ($product in $Script:Config.Products) {
        try {
            # Skip Enterprise (custom pricing)
            if ($product.Name -eq "Enterprise") {
                Write-Info "Skipping Enterprise (custom pricing)"
                continue
            }
            
            $stripeProduct = New-StripeProduct -Name $product.Name -Description $product.Description -Headers $Headers
            $stripePrice = New-StripePrice -ProductId $stripeProduct.id -Amount $product.Price -Interval $product.Interval -Headers $Headers
            
            $createdProducts += @{
                Name = $product.Name
                ProductId = $stripeProduct.id
                PriceId = $stripePrice.id
                Amount = $product.Price
            }
        }
        catch {
            Write-Error "Failed to create product $($product.Name): $($_.Exception.Message)"
            return $null
        }
    }
    
    return $createdProducts
}

# ============================================================================
# RAILWAY OPERATIONS
# ============================================================================

function Set-RailwayWebhookSecret {
    param([string]$WebhookSecret)
    
    Write-Info "Setting Railway webhook secret..."
    
    $result = Invoke-WithRetry -OperationName "Set Railway Webhook Secret" -ScriptBlock {
        $output = railway variables --set "STRIPE_WEBHOOK_SECRET=$WebhookSecret" 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            throw "Railway command failed: $output"
        }
        
        return $output
    }
    
    Write-Success "Railway webhook secret configured"
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
# MAIN EXECUTION
# ============================================================================

function Main {
    $startTime = Get-Date
    
    Write-Host ""
    Write-Host "🚀 MNNR Complete Stripe Setup v2.0" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Green
    Write-Host ""
    
    # Initialize log file if specified
    if ($LogPath) {
        Write-Info "Logging to: $LogPath"
        "Stripe Setup Log - $(Get-Date)" | Set-Content $LogPath
    }
    
    # Validate environment variables
    Write-Info "Validating environment variables..."
    
    $stripeKey = $env:STRIPE_SECRET_KEY
    $webhookSecret = $env:STRIPE_WEBHOOK_SECRET
    
    if (-not (Test-StripeKey -Key $stripeKey)) {
        Write-Error "STRIPE_SECRET_KEY environment variable not set or invalid"
        Write-Host ""
        Write-Host "📋 Setup Instructions:" -ForegroundColor Yellow
        Write-Step "1. Get your Stripe API key from: https://dashboard.stripe.com/apikeys"
        Write-Step "2. Set the environment variable:"
        Write-Host '   $env:STRIPE_SECRET_KEY = "sk_test_..."' -ForegroundColor Gray
        Write-Step "3. Run this script again"
        return @{ Success = $false; Reason = "Missing STRIPE_SECRET_KEY" }
    }
    
    if (-not (Test-WebhookSecret -Secret $webhookSecret)) {
        Write-Error "STRIPE_WEBHOOK_SECRET environment variable not set or invalid"
        Write-Host ""
        Write-Host "📋 Setup Instructions:" -ForegroundColor Yellow
        Write-Step "1. Create a webhook at: https://dashboard.stripe.com/webhooks"
        Write-Step "2. Copy the webhook signing secret"
        Write-Step "3. Set the environment variable:"
        Write-Host '   $env:STRIPE_WEBHOOK_SECRET = "whsec_..."' -ForegroundColor Gray
        Write-Step "4. Run this script again"
        return @{ Success = $false; Reason = "Missing STRIPE_WEBHOOK_SECRET" }
    }
    
    Write-Success "Environment variables validated"
    
    # Prepare headers
    $headers = @{
        "Authorization" = "Bearer $stripeKey"
        "Content-Type" = "application/x-www-form-urlencoded"
    }
    
    try {
        # Configure webhook secret in Railway
        Set-RailwayWebhookSecret -WebhookSecret $webhookSecret
        
        # Create Stripe products
        $products = New-AllStripeProducts -Headers $headers
        
        if (-not $products) {
            throw "Failed to create Stripe products"
        }
        
        # Deploy if not skipped
        if (-not $SkipDeploy) {
            Invoke-RailwayDeploy
        } else {
            Write-Info "Skipping deployment (--SkipDeploy flag set)"
        }
        
        # Success summary
        Write-Host ""
        Write-Host "🎉 MNNR Stripe Setup Complete!" -ForegroundColor Green
        Write-Host "===============================" -ForegroundColor Green
        Write-Success "Webhook configured"
        Write-Success "Products created:"
        
        foreach ($product in $products) {
            $priceDisplay = if ($product.Amount -gt 0) { "`$$($product.Amount / 100)/month" } else { "Free" }
            Write-Host "   • $($product.Name): $priceDisplay (Price ID: $($product.PriceId))" -ForegroundColor White
        }
        
        if (-not $SkipDeploy) {
            Write-Success "Application deployed"
        }
        
        Write-Host ""
        Write-Host "🌐 Check your site: $($Script:Config.ProductionUrl)" -ForegroundColor Green
        Write-Host "📊 Stripe Dashboard: $($Script:Config.StripeDashboard)" -ForegroundColor Cyan
        Write-Host ""
        
        $duration = (Get-Date) - $startTime
        
        return @{
            Success = $true
            Products = $products
            Duration = $duration
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    }
    catch {
        Write-Error "Setup failed: $($_.Exception.Message)"
        
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
