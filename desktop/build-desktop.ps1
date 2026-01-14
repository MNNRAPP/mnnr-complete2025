# MNNR Desktop App Build Script for Windows

Write-Host "🖥️ Building MNNR Desktop App..." -ForegroundColor Green

# Navigate to desktop directory
Set-Location $PSScriptRoot

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build for Windows
Write-Host "🪟 Building Windows app..." -ForegroundColor Yellow
npm run build:win

Write-Host "✅ Desktop app built successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Output: dist/MNNR Setup.exe" -ForegroundColor Cyan
Write-Host "Portable: dist/MNNR.exe" -ForegroundColor Cyan
