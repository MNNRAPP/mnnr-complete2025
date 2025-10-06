#!/bin/bash

##############################################################################
# MNNR Documentation Deployment Script
#
# This script automates the deployment of docs.mnnr.app to Vercel
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════"
echo "  MNNR Documentation Deployment Script"
echo "═══════════════════════════════════════════════════════"
echo -e "${NC}"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo -e "${BLUE}📋 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Please log in to Vercel:${NC}"
    vercel login
fi

# Load environment variables
if [ ! -f .env.production ]; then
    echo -e "${RED}✗ Error: .env.production not found!${NC}"
    echo -e "${YELLOW}Please create .env.production with required variables${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment file found${NC}"

# Build the project
echo -e "${BLUE}🔨 Building Next.js application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
vercel --prod

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Deployment failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Deployment successful${NC}"

# Add custom domain (if not already added)
echo -e "${BLUE}🌐 Configuring custom domain...${NC}"
vercel domains add docs.mnnr.app 2>/dev/null || echo -e "${YELLOW}⚠ Domain already added or needs manual configuration${NC}"

echo -e "${GREEN}"
echo "═══════════════════════════════════════════════════════"
echo "  ✓ Deployment Complete!"
echo "═══════════════════════════════════════════════════════"
echo -e "${NC}"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure DNS in your domain registrar:"
echo "   - Type: CNAME"
echo "   - Name: docs"
echo "   - Value: cname.vercel-dns.com"
echo "   - TTL: 3600"
echo ""
echo "2. Verify deployment:"
echo "   curl https://docs.mnnr.app/api/health"
echo ""
echo "3. Check Vercel dashboard for SSL certificate status"

# Test deployment
echo -e "\n${BLUE}🧪 Testing deployment...${NC}"
sleep 5

DEPLOYMENT_URL=$(vercel inspect --wait | grep -oP 'https://[^\s]+' | head -1)

if [ ! -z "$DEPLOYMENT_URL" ]; then
    echo -e "${BLUE}Testing health endpoint...${NC}"
    curl -s "$DEPLOYMENT_URL/api/health" | jq '.' || echo -e "${YELLOW}⚠ Health check failed (may be DNS propagation delay)${NC}"
fi

echo -e "\n${GREEN}🎉 Done!${NC}"
