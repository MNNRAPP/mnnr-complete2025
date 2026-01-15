# Add Clerk redirect URLs to Vercel
# Run this if sign-in/sign-up isn't working

Write-Host "Adding Clerk environment variables to Vercel..." -ForegroundColor Green

# These variables tell Clerk where to redirect after auth
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
# Enter: /sign-in

vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
# Enter: /sign-up

vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
# Enter: /dashboard

vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
# Enter: /dashboard

Write-Host "Done! Redeploy to apply changes:" -ForegroundColor Yellow
Write-Host "vercel --prod" -ForegroundColor Cyan
