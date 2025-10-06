#!/bin/bash

# MNNR Railway Migration Script
# Migrates from Vercel to Railway with zero downtime

echo "🚂 MNNR Railway Migration Started"
echo "=================================="

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new Railway project
echo "🏗️ Creating Railway project..."
railway init

# Link to Railway service
echo "🔗 Linking to Railway service..."
railway link

# Set up environment variables
echo "🔧 Setting up environment variables..."

# Production URLs (Railway will provide these)
railway variables set NEXT_PUBLIC_SITE_URL="https://mnnr-production.up.railway.app"
railway variables set NEXT_PUBLIC_SITE_NAME="MNNR"
railway variables set NEXT_PUBLIC_RP_ID="mnnr-production.up.railway.app"

# Copy existing environment variables
if [ -f .env.local ]; then
    echo "📋 Copying existing environment variables..."
    
    # Extract variables (excluding comments and empty lines)
    grep -v '^#' .env.local | grep -v '^$' | while IFS='=' read -r key value; do
        if [ -n "$key" ]; then
            railway variables set "$key"="$value"
        fi
    done
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Migration complete!"
echo "🌐 Your MNNR platform is now running on Railway"
echo "📊 Check deployment status: railway status"
echo "📱 View logs: railway logs"