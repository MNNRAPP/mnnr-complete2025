# MNNR Complete Stripe Automation
# Creates products, sets webhook, and deploys

Write-Host "🚀 MNNR Complete Stripe Setup" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Function to create Stripe products via API calls
function Create-StripeProducts {
    Write-Host "🏗️  Creating Stripe products via API..." -ForegroundColor Cyan
    
    # Get Stripe secret key from environment
    $stripeKey = $env:STRIPE_SECRET_KEY
    if ([string]::IsNullOrEmpty($stripeKey)) {
        Write-Host "❌ Error: STRIPE_SECRET_KEY environment variable not set" -ForegroundColor Red
        return $false
    }
    $headers = @{
        "Authorization" = "Bearer $stripeKey"
        "Content-Type" = "application/x-www-form-urlencoded"
    }
    
    try {
        # Create Hobby Product
        Write-Host "Creating Hobby product..." -ForegroundColor Yellow
        $hobbyProductBody = "name=Hobby&description=Perfect for personal projects and small websites"
        $hobbyProduct = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products" -Method POST -Headers $headers -Body $hobbyProductBody
        Write-Host "✅ Hobby product created: $($hobbyProduct.id)" -ForegroundColor Green
        
        # Create Hobby Price
        $hobbyPriceBody = "product=$($hobbyProduct.id)&unit_amount=1000&currency=usd&recurring[interval]=month"
        $hobbyPrice = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" -Method POST -Headers $headers -Body $hobbyPriceBody
        Write-Host "✅ Hobby price created: $($hobbyPrice.id)" -ForegroundColor Green
        
        # Create Freelancer Product
        Write-Host "Creating Freelancer product..." -ForegroundColor Yellow
        $freelancerProductBody = "name=Freelancer&description=Ideal for freelancers and growing businesses"
        $freelancerProduct = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products" -Method POST -Headers $headers -Body $freelancerProductBody
        Write-Host "✅ Freelancer product created: $($freelancerProduct.id)" -ForegroundColor Green
        
        # Create Freelancer Price
        $freelancerPriceBody = "product=$($freelancerProduct.id)&unit_amount=2000&currency=usd&recurring[interval]=month"
        $freelancerPrice = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" -Method POST -Headers $headers -Body $freelancerPriceBody
        Write-Host "✅ Freelancer price created: $($freelancerPrice.id)" -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "❌ Error creating Stripe products: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "🔑 Configuring webhook secret..." -ForegroundColor Cyan

# Get webhook secret from environment
$webhookSecret = $env:STRIPE_WEBHOOK_SECRET
if ([string]::IsNullOrEmpty($webhookSecret)) {
    Write-Host "❌ Error: STRIPE_WEBHOOK_SECRET environment variable not set" -ForegroundColor Red
    exit 1
}

railway variables --set "STRIPE_WEBHOOK_SECRET=$webhookSecret"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Webhook secret configured" -ForegroundColor Green
    
    # Create products
    $productsCreated = Create-StripeProducts
    
    if ($productsCreated) {
        Write-Host "🚀 Deploying updated configuration..." -ForegroundColor Cyan
        railway up --detach
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployment complete!" -ForegroundColor Green
            Write-Host "" -ForegroundColor White
            Write-Host "🎉 MNNR Stripe Setup Complete!" -ForegroundColor Green
            Write-Host "================================" -ForegroundColor Green
            Write-Host "✅ Webhook configured" -ForegroundColor White
            Write-Host "✅ Products created automatically" -ForegroundColor White
            Write-Host "✅ Application deployed" -ForegroundColor White
            Write-Host "" -ForegroundColor White
            Write-Host "🌐 Check your site: https://mnnr-production.up.railway.app" -ForegroundColor Green
            Write-Host "📊 Stripe Dashboard: https://dashboard.stripe.com/test/products" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ Failed to configure webhook secret" -ForegroundColor Red
}