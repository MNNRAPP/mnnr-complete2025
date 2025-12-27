# =============================================================================
# Pre-commit Hooks Setup Script for MNNR Complete 2025 (Windows)
# =============================================================================
# This script installs and configures pre-commit hooks to prevent secret commits
# Supports: Windows 10/11, PowerShell 5.1+
#
# Usage:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\scripts\setup-pre-commit-hooks.ps1
#
# =============================================================================

# Requires PowerShell 5.1 or higher
#Requires -Version 5.1

# Set error action preference
$ErrorActionPreference = "Stop"

# =============================================================================
# Helper Functions
# =============================================================================

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Command)
    try {
        if (Get-Command $Command -ErrorAction SilentlyContinue) {
            Write-Success "$Command is installed"
            return $true
        } else {
            Write-Warning-Custom "$Command is not installed"
            return $false
        }
    } catch {
        Write-Warning-Custom "$Command is not installed"
        return $false
    }
}

# =============================================================================
# Main Installation
# =============================================================================

Write-Header "Pre-commit Hooks Setup for MNNR (Windows)"

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error-Custom "Not a git repository. Please run this script from the project root."
    exit 1
}

Write-Success "Git repository detected"

# =============================================================================
# Step 1: Check Prerequisites
# =============================================================================

Write-Header "Step 1: Checking Prerequisites"

# Check Python
if (Test-Command python) {
    $pythonVersion = python --version 2>&1
    Write-Info "Python version: $pythonVersion"
} else {
    Write-Error-Custom "Python 3 is required but not installed"
    Write-Info "Install Python 3: https://www.python.org/downloads/"
    Write-Info "Or use winget: winget install Python.Python.3.11"
    exit 1
}

# Check pip
if (Test-Command pip) {
    Write-Success "pip is installed"
} else {
    Write-Error-Custom "pip is required but not installed"
    Write-Info "Install pip: python -m ensurepip --upgrade"
    exit 1
}

# Check Git
if (Test-Command git) {
    $gitVersion = git --version
    Write-Info "Git version: $gitVersion"
} else {
    Write-Error-Custom "Git is required but not installed"
    Write-Info "Install Git: https://git-scm.com/download/win"
    exit 1
}

# Check Node.js (optional but recommended)
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Info "Node.js version: $nodeVersion"
} else {
    Write-Warning-Custom "Node.js not found. Some hooks may not work."
    Write-Info "Install Node.js: https://nodejs.org/"
}

# Check if Chocolatey is available (for easier installs)
$hasChoco = Test-Command choco
if ($hasChoco) {
    Write-Info "Chocolatey is available for package management"
}

# Check if winget is available
$hasWinget = Test-Command winget
if ($hasWinget) {
    Write-Info "winget is available for package management"
}

# =============================================================================
# Step 2: Install pre-commit
# =============================================================================

Write-Header "Step 2: Installing pre-commit"

if (Test-Command pre-commit) {
    Write-Info "pre-commit is already installed"
    $preCommitVersion = pre-commit --version
    Write-Info "Version: $preCommitVersion"
} else {
    Write-Info "Installing pre-commit..."
    try {
        pip install pre-commit
        Write-Success "pre-commit installed successfully"
    } catch {
        Write-Error-Custom "Failed to install pre-commit: $_"
        exit 1
    }
}

# =============================================================================
# Step 3: Install Gitleaks
# =============================================================================

Write-Header "Step 3: Installing Gitleaks"

if (Test-Command gitleaks) {
    Write-Info "Gitleaks is already installed"
    $gitleaksVersion = gitleaks version 2>&1 | Select-Object -First 1
    Write-Info "Version: $gitleaksVersion"
} else {
    Write-Info "Installing Gitleaks..."
    
    if ($hasChoco) {
        Write-Info "Using Chocolatey to install Gitleaks..."
        try {
            choco install gitleaks -y
            Write-Success "Gitleaks installed via Chocolatey"
        } catch {
            Write-Warning-Custom "Chocolatey installation failed: $_"
        }
    } elseif ($hasWinget) {
        Write-Info "Using winget to install Gitleaks..."
        try {
            winget install gitleaks.gitleaks
            Write-Success "Gitleaks installed via winget"
        } catch {
            Write-Warning-Custom "winget installation failed: $_"
        }
    } else {
        Write-Warning-Custom "No package manager found. Please install Gitleaks manually:"
        Write-Info "Download from: https://github.com/gitleaks/gitleaks/releases"
        Write-Info "Or use: scoop install gitleaks"
    }
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (Test-Command gitleaks) {
        Write-Success "Gitleaks is now available"
    } else {
        Write-Warning-Custom "Gitleaks may not be in PATH. You may need to restart your terminal."
    }
}

# =============================================================================
# Step 4: Install detect-secrets
# =============================================================================

Write-Header "Step 4: Installing detect-secrets"

try {
    python -c "import detect_secrets" 2>$null
    Write-Info "detect-secrets is already installed"
} catch {
    Write-Info "Installing detect-secrets..."
    try {
        pip install detect-secrets
        Write-Success "detect-secrets installed successfully"
    } catch {
        Write-Error-Custom "Failed to install detect-secrets: $_"
        exit 1
    }
}

# =============================================================================
# Step 5: Create detect-secrets baseline
# =============================================================================

Write-Header "Step 5: Creating detect-secrets baseline"

if (-not (Test-Path ".secrets.baseline")) {
    Write-Info "Creating .secrets.baseline file..."
    try {
        detect-secrets scan --baseline .secrets.baseline
        Write-Success "Baseline created"
    } catch {
        Write-Warning-Custom "Failed to create baseline: $_"
    }
} else {
    Write-Info ".secrets.baseline already exists"
    Write-Warning-Custom "To update baseline: detect-secrets scan --baseline .secrets.baseline"
}

# =============================================================================
# Step 6: Install pre-commit hooks
# =============================================================================

Write-Header "Step 6: Installing pre-commit hooks"

if (Test-Path ".pre-commit-config.yaml") {
    Write-Info "Installing hooks from .pre-commit-config.yaml..."
    try {
        pre-commit install
        pre-commit install --hook-type commit-msg
        pre-commit install --hook-type pre-push
        Write-Success "Pre-commit hooks installed"
    } catch {
        Write-Error-Custom "Failed to install hooks: $_"
        exit 1
    }
} else {
    Write-Error-Custom ".pre-commit-config.yaml not found"
    exit 1
}

# =============================================================================
# Step 7: Install additional dependencies
# =============================================================================

Write-Header "Step 7: Installing additional dependencies"

# Install Node.js dependencies for ESLint/Prettier hooks
if (Test-Path "package.json") {
    Write-Info "Installing Node.js dependencies..."
    try {
        if (Test-Command pnpm) {
            pnpm install --dev
        } elseif (Test-Command npm) {
            npm install --save-dev
        }
        Write-Success "Node.js dependencies installed"
    } catch {
        Write-Warning-Custom "Failed to install Node.js dependencies: $_"
    }
}

# =============================================================================
# Step 8: Test the hooks
# =============================================================================

Write-Header "Step 8: Testing pre-commit hooks"

Write-Info "Running pre-commit on all files (this may take a few minutes)..."
try {
    pre-commit run --all-files
    Write-Success "All hooks passed!"
} catch {
    Write-Warning-Custom "Some hooks failed. This is normal if there are existing issues."
    Write-Info "Fix the issues and run: pre-commit run --all-files"
}

# =============================================================================
# Step 9: Configure Git
# =============================================================================

Write-Header "Step 9: Configuring Git"

try {
    git config core.hooksPath .git/hooks
    Write-Success "Git hooks path configured"
} catch {
    Write-Warning-Custom "Failed to configure Git: $_"
}

# =============================================================================
# Completion
# =============================================================================

Write-Header "Installation Complete!"

Write-Host ""
Write-Success "Pre-commit hooks are now installed and active!"
Write-Host ""
Write-Info "What happens now:"
Write-Host "  • Every commit will be scanned for secrets"
Write-Host "  • Code will be linted and formatted automatically"
Write-Host "  • Large files and merge conflicts will be detected"
Write-Host ""
Write-Info "Useful commands:"
Write-Host "  • Test hooks:           pre-commit run --all-files"
Write-Host "  • Update hooks:         pre-commit autoupdate"
Write-Host "  • Skip hooks (emergency): git commit --no-verify"
Write-Host "  • Update baseline:      detect-secrets scan --baseline .secrets.baseline"
Write-Host ""
Write-Warning-Custom "IMPORTANT: Never use --no-verify unless absolutely necessary!"
Write-Host ""

# =============================================================================
# Create a test file to verify
# =============================================================================

Write-Info "Creating test commit to verify hooks..."
try {
    "# Pre-commit hooks installed on $(Get-Date)" | Out-File -Append .pre-commit-test
    git add .pre-commit-test .secrets.baseline
    git commit -m "chore: Install pre-commit hooks for secret detection"
    Write-Success "Test commit successful! Hooks are working."
    Remove-Item .pre-commit-test -ErrorAction SilentlyContinue
} catch {
    Write-Warning-Custom "Test commit failed. Please review the output above."
}

Write-Header "Setup Complete! 🎉"

Write-Host ""
Write-Info "If you encounter any issues:"
Write-Host "  1. Restart your terminal to refresh PATH"
Write-Host "  2. Run: pre-commit clean"
Write-Host "  3. Run: pre-commit install --install-hooks"
Write-Host "  4. Check Python and Git are in PATH"
Write-Host ""
