# Quick Stripe Webhook Setup for MNNR
# Sets the webhook secret you already have

Write-Host "🔗 Setting up Stripe webhook for MNNR..." -ForegroundColor Green

# Set the webhook secret you provided
$webhookSecret = "whsec_wRNftLajMZNeslQOP6vEPm4iVx5NlZ6z"

Write-Host "🚀 Updating Railway environment..." -ForegroundColor Cyan
railway variables --set "STRIPE_WEBHOOK_SECRET=$webhookSecret"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Webhook secret configured!" -ForegroundColor Green
    
    # Trigger a redeploy to apply changes
    Write-Host "🔄 Triggering redeploy..." -ForegroundColor Cyan
    railway up --detach
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment triggered!" -ForegroundColor Green
        Write-Host "" -ForegroundColor White
        Write-Host "🎯 Next: Create products in Stripe Dashboard" -ForegroundColor Yellow
        Write-Host "   1. Go to: https://dashboard.stripe.com/test/products" -ForegroundColor White
        Write-Host "   2. Click 'Add product'" -ForegroundColor White
        Write-Host "   3. Create 'Hobby' plan: $10/month" -ForegroundColor White
        Write-Host "   4. Create 'Freelancer' plan: $20/month" -ForegroundColor White
        Write-Host "" -ForegroundColor White
        Write-Host "🌐 Your site: https://mnnr-production.up.railway.app" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Failed to set webhook secret" -ForegroundColor Red
}