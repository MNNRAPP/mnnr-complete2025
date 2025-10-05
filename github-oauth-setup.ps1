# GitHub OAuth Setup for MNNR
# Configures GitHub OAuth integration with Supabase

param(
    [string]$GitHubClientId = "",
    [string]$GitHubClientSecret = ""
)

Write-Host "🐙 GitHub OAuth Setup for MNNR" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

if (-not $GitHubClientId -or -not $GitHubClientSecret) {
    Write-Host "🔧 Manual GitHub OAuth Setup Required" -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Steps to set up GitHub OAuth:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Go to GitHub Settings:" -ForegroundColor White
    Write-Host "   https://github.com/settings/developers" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Click 'New OAuth App'" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Fill in the details:" -ForegroundColor White
    Write-Host "   Application name: MNNR Platform" -ForegroundColor Gray
    Write-Host "   Homepage URL: https://mnnr.app" -ForegroundColor Gray
    Write-Host "   Authorization callback URL: https://waykhwdysouihtgqwged.supabase.co/auth/v1/callback" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. After creating the app:" -ForegroundColor White
    Write-Host "   • Copy the Client ID" -ForegroundColor Gray
    Write-Host "   • Generate a new Client Secret" -ForegroundColor Gray
    Write-Host "   • Copy the Client Secret" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Configure in Supabase:" -ForegroundColor White
    Write-Host "   • Go to: https://supabase.com/dashboard/project/waykhwdysouihtgqwged/auth/providers" -ForegroundColor Gray
    Write-Host "   • Enable GitHub provider" -ForegroundColor Gray
    Write-Host "   • Add Client ID and Client Secret" -ForegroundColor Gray
    Write-Host "   • Set Redirect URL: https://mnnr.app/auth/callback" -ForegroundColor Gray
    Write-Host ""
    Write-Host "6. Run this script again with credentials:" -ForegroundColor White
    Write-Host "   .\github-oauth-setup.ps1 -GitHubClientId 'your_client_id' -GitHubClientSecret 'your_secret'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Benefits of GitHub OAuth:" -ForegroundColor Cyan
    Write-Host "   ✅ One-click user registration" -ForegroundColor White
    Write-Host "   ✅ No password management needed" -ForegroundColor White
    Write-Host "   ✅ Trusted authentication provider" -ForegroundColor White
    Write-Host "   ✅ Automatic user profile data" -ForegroundColor White
    
    return
}

Write-Host "🔐 Configuring GitHub OAuth credentials..." -ForegroundColor Cyan

# Update Railway environment variables
Write-Host "🚂 Setting Railway environment variables..." -ForegroundColor Yellow
railway variables --set "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=$GitHubClientId" --set "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=$GitHubClientSecret"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Railway variables updated" -ForegroundColor Green
    
    # Update local env file
    Write-Host "📝 Updating local .env.production..." -ForegroundColor Yellow
    
    $envFile = ".env.production"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        $updated = $false
        
        for ($i = 0; $i -lt $content.Length; $i++) {
            if ($content[$i] -like "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=*") {
                $content[$i] = "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=$GitHubClientId"
                $updated = $true
            }
            if ($content[$i] -like "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=*") {
                $content[$i] = "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=$GitHubClientSecret"
                $updated = $true
            }
        }
        
        if ($updated) {
            $content | Set-Content $envFile
            Write-Host "✅ Local .env.production updated" -ForegroundColor Green
        }
    }
    
    # Trigger redeploy
    Write-Host "🚀 Triggering redeploy..." -ForegroundColor Cyan
    railway up --detach
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 GitHub OAuth Setup Complete!" -ForegroundColor Green
        Write-Host "================================" -ForegroundColor Green
        Write-Host "✅ GitHub credentials configured" -ForegroundColor White
        Write-Host "✅ Railway variables updated" -ForegroundColor White
        Write-Host "✅ Application redeployed" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 Next Steps:" -ForegroundColor Yellow
        Write-Host "   1. Configure GitHub provider in Supabase dashboard" -ForegroundColor White
        Write-Host "   2. Test OAuth login at: https://mnnr.app" -ForegroundColor White
        Write-Host "   3. Verify redirect works properly" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 Supabase Auth: https://supabase.com/dashboard/project/waykhwdysouihtgqwged/auth/providers" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Failed to update Railway variables" -ForegroundColor Red
}