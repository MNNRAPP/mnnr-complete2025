# Simple Desktop App Builder (Using npx - no installation needed)

Write-Host "Building MNNR Desktop App (Simple Method)..." -ForegroundColor Green

# Create a basic Electron app package structure
$appPath = "MNNR-win32-x64"

Write-Host "Packaging with electron-packager..." -ForegroundColor Yellow

# Use npx to avoid installation issues
npx electron-packager . MNNR --platform=win32 --arch=x64 --out=dist --overwrite

if (Test-Path "dist\MNNR-win32-x64\MNNR.exe") {
    Write-Host "Desktop app built successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: $PWD\dist\MNNR-win32-x64\MNNR.exe" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To run: .\dist\MNNR-win32-x64\MNNR.exe" -ForegroundColor Cyan
} else {
    Write-Host "Build failed" -ForegroundColor Red
}
