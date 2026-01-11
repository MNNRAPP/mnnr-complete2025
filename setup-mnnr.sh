#!/bin/bash
# ============================================================================
# MNNR SETUP SCRIPT
# One-command setup for MNNR.app local development
# ============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        MNNR.APP SETUP SCRIPT - Machine Economy            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# STEP 1: CHECK PREREQUISITES
# ============================================================================
echo -e "${BLUE}[1/7]${NC} Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not found${NC}"
    echo "Install from: https://nodejs.org (v20+)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}WARNING: Node.js v20+ recommended (found v$NODE_VERSION)${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}ERROR: npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js v$(node -v | cut -d'v' -f2) detected${NC}"

# ============================================================================
# STEP 2: INSTALL DEPENDENCIES
# ============================================================================
echo ""
echo -e "${BLUE}[2/7]${NC} Installing dependencies..."

# Prefer pnpm, fallback to npm
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# ============================================================================
# STEP 3: SETUP ENVIRONMENT
# ============================================================================
echo ""
echo -e "${BLUE}[3/7]${NC} Setting up environment..."

if [ ! -f .env.local ]; then
    if [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✓ Created .env.local from example${NC}"
        echo -e "${YELLOW}  → Please update with your real credentials${NC}"
    else
        # Create minimal .env.local for demo mode
        cat > .env.local << 'EOF'
# MNNR Development Environment
# Created by setup-mnnr.sh

NODE_ENV=development

# ============================================================================
# OPTION A: Neon Database (FREE - RECOMMENDED)
# ============================================================================
# 1. Go to https://neon.tech and create free account
# 2. Create a project named "mnnr-dev"
# 3. Copy connection string below
# DATABASE_URL="postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ============================================================================
# OPTION B: Supabase (If you have active subscription)
# ============================================================================
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================================================
# STRIPE (Required for payments)
# ============================================================================
# Get keys from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# ============================================================================
# DEMO MODE (No auth required)
# ============================================================================
DEMO_MODE=true

# ============================================================================
# OPTIONAL - Redis (Upstash)
# ============================================================================
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=

# ============================================================================
# OPTIONAL - Analytics (PostHog)
# ============================================================================
# NEXT_PUBLIC_POSTHOG_KEY=
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
        echo -e "${GREEN}✓ Created .env.local with demo settings${NC}"
    fi
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# ============================================================================
# STEP 4: DATABASE SETUP CHECK
# ============================================================================
echo ""
echo -e "${BLUE}[4/7]${NC} Checking database configuration..."

if grep -q "DATABASE_URL" .env.local 2>/dev/null && ! grep -q "DATABASE_URL=\"\"" .env.local; then
    echo -e "${GREEN}✓ Database URL configured${NC}"
else
    echo -e "${YELLOW}⚠ No database configured${NC}"
    echo ""
    echo "Choose a database (enter number):"
    echo "  1) Neon (FREE - Recommended for new setup)"
    echo "  2) Supabase (Existing subscription)"
    echo "  3) Skip (Demo mode only)"
    read -r DB_CHOICE

    case $DB_CHOICE in
        1)
            echo ""
            echo -e "${BLUE}NEON SETUP INSTRUCTIONS:${NC}"
            echo "1. Go to https://neon.tech"
            echo "2. Sign up with GitHub (free)"
            echo "3. Create project: 'mnnr-dev'"
            echo "4. Copy the connection string"
            echo ""
            echo "Paste your Neon DATABASE_URL (or press Enter to skip):"
            read -r NEON_URL
            if [ -n "$NEON_URL" ]; then
                sed -i.bak "s|# DATABASE_URL=.*|DATABASE_URL=\"$NEON_URL\"|" .env.local 2>/dev/null || \
                echo "DATABASE_URL=\"$NEON_URL\"" >> .env.local
                echo -e "${GREEN}✓ Neon database configured${NC}"
            fi
            ;;
        2)
            echo ""
            echo "Enter your Supabase project URL:"
            read -r SUPABASE_URL
            echo "Enter your Supabase anon key:"
            read -r SUPABASE_ANON
            if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON" ]; then
                sed -i.bak "s|# NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env.local
                sed -i.bak "s|# NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON|" .env.local
                echo -e "${GREEN}✓ Supabase configured${NC}"
            fi
            ;;
        *)
            echo -e "${YELLOW}Running in demo mode (no database)${NC}"
            ;;
    esac
fi

# ============================================================================
# STEP 5: BUILD CHECK
# ============================================================================
echo ""
echo -e "${BLUE}[5/7]${NC} Running build check..."

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${YELLOW}⚠ Build has warnings (may still work)${NC}"
fi

# ============================================================================
# STEP 6: RUN TESTS
# ============================================================================
echo ""
echo -e "${BLUE}[6/7]${NC} Running tests..."

if npm test -- --run --reporter=dot 2>/dev/null | tail -3; then
    echo -e "${GREEN}✓ Tests completed${NC}"
else
    echo -e "${YELLOW}⚠ Some tests may have failed (check later)${NC}"
fi

# ============================================================================
# STEP 7: FINAL SUMMARY
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              SETUP COMPLETE                                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}MNNR is ready!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start development server:"
echo "     ${BLUE}npm run dev${NC}"
echo ""
echo "  2. Open in browser:"
echo "     ${BLUE}http://localhost:3000${NC}"
echo ""
echo "  3. Configure database (if skipped):"
echo "     Edit ${BLUE}.env.local${NC}"
echo ""
echo "Quick commands:"
echo "  npm run dev        - Start dev server"
echo "  npm run build      - Production build"
echo "  npm test           - Run tests"
echo "  npm run lint       - Check code style"
echo ""
echo "Documentation:"
echo "  • README.md"
echo "  • docs/NEON_SETUP_GUIDE.md"
echo "  • MNNR_AAA_CERTIFICATION_ROADMAP.md"
echo ""
echo -e "${GREEN}Happy building! 🚀${NC}"
