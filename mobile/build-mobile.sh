#!/bin/bash

echo "🚀 Building MNNR Mobile Apps..."

# Navigate to mobile directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Next.js app with mobile config
echo "🔨 Building Next.js static export..."
cd ..
npm run build
# Create out directory if it doesn't exist
mkdir -p out
cd mobile

# Initialize Capacitor (if not already done)
if [ ! -d "ios" ] && [ ! -d "android" ]; then
  echo "🎬 Initializing Capacitor..."
  npx cap init MNNR app.mnnr.mobile --web-dir=../out
fi

# Add platforms if needed
if [ ! -d "ios" ]; then
  echo "🍎 Adding iOS platform..."
  npx cap add ios
fi

if [ ! -d "android" ]; then
  echo "🤖 Adding Android platform..."
  npx cap add android
fi

# Sync web assets
echo "🔄 Syncing web assets to native projects..."
npx cap sync

echo "✅ Mobile apps built successfully!"
echo ""
echo "To open in Xcode: npm run open:ios"
echo "To open in Android Studio: npm run open:android"
