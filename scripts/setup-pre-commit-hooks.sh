#!/bin/bash
# =============================================================================
# Pre-commit Hooks Setup Script for MNNR Complete 2025
# =============================================================================
# This script installs and configures pre-commit hooks to prevent secret commits
# Supports: macOS, Linux, WSL
#
# Usage:
#   chmod +x scripts/setup-pre-commit-hooks.sh
#   ./scripts/setup-pre-commit-hooks.sh
#
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_warning "$1 is not installed"
        return 1
    fi
}

# =============================================================================
# Main Installation
# =============================================================================

print_header "Pre-commit Hooks Setup for MNNR"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository. Please run this script from the project root."
    exit 1
fi

print_success "Git repository detected"

# =============================================================================
# Step 1: Check Prerequisites
# =============================================================================

print_header "Step 1: Checking Prerequisites"

# Check Python
if check_command python3; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_info "Python version: $PYTHON_VERSION"
else
    print_error "Python 3 is required but not installed"
    print_info "Install Python 3: https://www.python.org/downloads/"
    exit 1
fi

# Check pip
if ! check_command pip3; then
    print_error "pip3 is required but not installed"
    print_info "Install pip: python3 -m ensurepip --upgrade"
    exit 1
fi

# Check Node.js (optional but recommended)
if check_command node; then
    NODE_VERSION=$(node --version)
    print_info "Node.js version: $NODE_VERSION"
else
    print_warning "Node.js not found. Some hooks may not work."
fi

# Check Go (optional)
if check_command go; then
    GO_VERSION=$(go version | cut -d' ' -f3)
    print_info "Go version: $GO_VERSION"
fi

# =============================================================================
# Step 2: Install pre-commit
# =============================================================================

print_header "Step 2: Installing pre-commit"

if check_command pre-commit; then
    print_info "pre-commit is already installed"
    PRE_COMMIT_VERSION=$(pre-commit --version)
    print_info "Version: $PRE_COMMIT_VERSION"
else
    print_info "Installing pre-commit..."
    pip3 install pre-commit
    print_success "pre-commit installed successfully"
fi

# =============================================================================
# Step 3: Install Gitleaks
# =============================================================================

print_header "Step 3: Installing Gitleaks"

if check_command gitleaks; then
    print_info "Gitleaks is already installed"
    GITLEAKS_VERSION=$(gitleaks version 2>&1 | head -n1)
    print_info "Version: $GITLEAKS_VERSION"
else
    print_info "Installing Gitleaks..."
    
    # Detect OS
    OS="$(uname -s)"
    case "${OS}" in
        Linux*)
            print_info "Detected Linux"
            if command -v apt-get &> /dev/null; then
                # Debian/Ubuntu
                curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/master/scripts/install.sh | sudo sh
            elif command -v brew &> /dev/null; then
                # Homebrew on Linux
                brew install gitleaks
            else
                print_warning "Please install Gitleaks manually: https://github.com/gitleaks/gitleaks#installing"
            fi
            ;;
        Darwin*)
            print_info "Detected macOS"
            if command -v brew &> /dev/null; then
                brew install gitleaks
            else
                print_error "Homebrew not found. Install Homebrew first: https://brew.sh"
                exit 1
            fi
            ;;
        *)
            print_warning "Unknown OS. Please install Gitleaks manually: https://github.com/gitleaks/gitleaks#installing"
            ;;
    esac
    
    if check_command gitleaks; then
        print_success "Gitleaks installed successfully"
    else
        print_warning "Gitleaks installation may have failed. Please verify manually."
    fi
fi

# =============================================================================
# Step 4: Install detect-secrets
# =============================================================================

print_header "Step 4: Installing detect-secrets"

if python3 -c "import detect_secrets" 2>/dev/null; then
    print_info "detect-secrets is already installed"
else
    print_info "Installing detect-secrets..."
    pip3 install detect-secrets
    print_success "detect-secrets installed successfully"
fi

# =============================================================================
# Step 5: Create detect-secrets baseline
# =============================================================================

print_header "Step 5: Creating detect-secrets baseline"

if [ ! -f ".secrets.baseline" ]; then
    print_info "Creating .secrets.baseline file..."
    detect-secrets scan --baseline .secrets.baseline
    print_success "Baseline created"
else
    print_info ".secrets.baseline already exists"
    print_warning "To update baseline: detect-secrets scan --baseline .secrets.baseline"
fi

# =============================================================================
# Step 6: Install pre-commit hooks
# =============================================================================

print_header "Step 6: Installing pre-commit hooks"

if [ -f ".pre-commit-config.yaml" ]; then
    print_info "Installing hooks from .pre-commit-config.yaml..."
    pre-commit install
    pre-commit install --hook-type commit-msg
    pre-commit install --hook-type pre-push
    print_success "Pre-commit hooks installed"
else
    print_error ".pre-commit-config.yaml not found"
    exit 1
fi

# =============================================================================
# Step 7: Install additional dependencies
# =============================================================================

print_header "Step 7: Installing additional dependencies"

# Install Node.js dependencies for ESLint/Prettier hooks
if [ -f "package.json" ]; then
    print_info "Installing Node.js dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install --dev
    elif command -v npm &> /dev/null; then
        npm install --save-dev
    fi
    print_success "Node.js dependencies installed"
fi

# =============================================================================
# Step 8: Test the hooks
# =============================================================================

print_header "Step 8: Testing pre-commit hooks"

print_info "Running pre-commit on all files (this may take a few minutes)..."
if pre-commit run --all-files; then
    print_success "All hooks passed!"
else
    print_warning "Some hooks failed. This is normal if there are existing issues."
    print_info "Fix the issues and run: pre-commit run --all-files"
fi

# =============================================================================
# Step 9: Configure Git
# =============================================================================

print_header "Step 9: Configuring Git"

# Enable Git hooks
git config core.hooksPath .git/hooks
print_success "Git hooks path configured"

# =============================================================================
# Completion
# =============================================================================

print_header "Installation Complete!"

echo ""
print_success "Pre-commit hooks are now installed and active!"
echo ""
print_info "What happens now:"
echo "  • Every commit will be scanned for secrets"
echo "  • Code will be linted and formatted automatically"
echo "  • Large files and merge conflicts will be detected"
echo ""
print_info "Useful commands:"
echo "  • Test hooks:           pre-commit run --all-files"
echo "  • Update hooks:         pre-commit autoupdate"
echo "  • Skip hooks (emergency): git commit --no-verify"
echo "  • Update baseline:      detect-secrets scan --baseline .secrets.baseline"
echo ""
print_warning "IMPORTANT: Never use --no-verify unless absolutely necessary!"
echo ""

# =============================================================================
# Create a test file to verify
# =============================================================================

print_info "Creating test commit to verify hooks..."
echo "# Pre-commit hooks installed on $(date)" >> .pre-commit-test
git add .pre-commit-test .secrets.baseline
if git commit -m "chore: Install pre-commit hooks for secret detection"; then
    print_success "Test commit successful! Hooks are working."
    rm .pre-commit-test
else
    print_warning "Test commit failed. Please review the output above."
fi

print_header "Setup Complete! 🎉"
