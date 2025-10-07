# Automate Vercel deploy for mnnr-complete2025 (Windows PowerShell)
# - Ensures Vercel CLI is installed and logged in
# - Links project to the correct root (mnnr-complete2025)
# - Pushes required env vars
# - Deploys production with a clean cache
# - Verifies /api/health

param(
  [switch]$SkipCache = $true,
  [string]$HealthPath = "/api/health"
)

$ErrorActionPreference = "Stop"

function Assert-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Command not found: $name. Please install it first."
  }
}

Write-Host "=== Checking prerequisites ===" -ForegroundColor Cyan
Assert-Command node
Assert-Command npm

# Install vercel CLI if missing
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Vercel CLI globally..." -ForegroundColor Yellow
  npm install -g vercel | Out-Null
}

# Ensure we are in the app root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Log in to Vercel if needed (non-interactive falls back to interactive)
try {
  vercel whoami | Out-Null
} catch {
  Write-Host "Logging into Vercel..." -ForegroundColor Yellow
  vercel login
}

Write-Host "=== Linking Vercel project to current folder ===" -ForegroundColor Cyan
# Link ensures root = this directory; respond to prompts:
# ? Set up and deploy “mnnr-complete2025”? -> Yes
# ? Which scope -> Your org
# ? Link to existing project? -> Yes (select mnnr-complete2025) or create new if needed
vercel link --yes | Out-Null

Write-Host "=== Pushing environment variables (if present locally) ===" -ForegroundColor Cyan
# Pull envs from Vercel to local files (no effect if not configured)
if (Test-Path ".env.local") { vercel env pull .env.local --yes | Out-Null }
if (Test-Path ".env.production") { vercel env pull .env.production --yes | Out-Null }

# Optionally seed envs: add to Vercel if present in this shell/user/machine
$envList = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_SECRET_KEY_LIVE",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "SENTRY_DSN",
  "LOG_LEVEL",
  "ENABLE_LOG_AGGREGATION"
)

foreach ($k in $envList) {
  $v = [Environment]::GetEnvironmentVariable($k, "Process")
  if (-not $v) { $v = [Environment]::GetEnvironmentVariable($k, "User") }
  if (-not $v) { $v = [Environment]::GetEnvironmentVariable($k, "Machine") }
  if ($v) {
    # Add silently; if it exists, Vercel may prompt; this script ignores failures here
    try { vercel env add $k production --yes 1>$null 2>$null } catch {}
  }
}

Write-Host "=== Installing dependencies ===" -ForegroundColor Cyan
npm ci

Write-Host "=== Building locally (sanity check) ===" -ForegroundColor Cyan
npm run build

Write-Host "=== Deploying to Vercel (production) ===" -ForegroundColor Cyan
$deployArgs = @("deploy", "--prod")
if ($SkipCache) { $deployArgs += "--force" } # fresh build; bypass cache
vercel @deployArgs

# Try to discover production URL
$prodUrl = ""
try {
  $inspect = vercel inspect --prod --output json 2>$null | ConvertFrom-Json
  if ($inspect -and $inspect.url) { $prodUrl = "https://$($inspect.url)" }
} catch {}

if (-not $prodUrl) {
  Write-Host "Could not determine production URL. Check Vercel dashboard." -ForegroundColor Yellow
} else {
  Write-Host "Production URL: $prodUrl" -ForegroundColor Green
  $healthUrl = "$prodUrl$HealthPath"
  Write-Host "Verifying health: $healthUrl" -ForegroundColor Cyan
  try {
    $resp = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 20
    Write-Host "Health status code: $($resp.StatusCode)" -ForegroundColor Green
    Write-Host $resp.Content
  } catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "=== Done ===" -ForegroundColor Cyan
