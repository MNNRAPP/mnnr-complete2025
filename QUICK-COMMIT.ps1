# Quick Commit Script for OneDrive Git Issues
# This script applies the fix and commits your changes

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Enterprise Security Hardening - Quick Commit" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\pusse\OneDrive\2025\MNNR\COMPLETE2025\mnnr-complete2025"

Write-Host "1. Applying Git config fixes..." -ForegroundColor Yellow
git config windows.appendAtomically false
git config core.filemode false
git config core.protectNTFS false

Write-Host "   Config applied successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "2. Checking staged files..." -ForegroundColor Yellow
$stagedFiles = git status --short
Write-Host "   Found $($stagedFiles.Count) files ready to commit" -ForegroundColor Green
Write-Host ""

Write-Host "3. Attempting commit..." -ForegroundColor Yellow
Write-Host "   Using commit message from commit-message.txt" -ForegroundColor Gray

# Try to commit
$commitResult = git commit -F commit-message.txt 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Commit successful!" -ForegroundColor Green
    Write-Host ""

    Write-Host "4. Pushing to remote..." -ForegroundColor Yellow
    git push origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "  ✅ SUCCESS! All changes pushed to GitHub!" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Deploy to Vercel: vercel --prod" -ForegroundColor White
        Write-Host "2. See DEPLOYMENT.md for full guide" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "   ❌ Push failed. Try: git push origin main" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Commit failed with error:" -ForegroundColor Red
    Write-Host $commitResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Use GitHub Desktop with copied folder" -ForegroundColor Yellow
    Write-Host "See COMMIT_AND_DEPLOY.md for instructions" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
