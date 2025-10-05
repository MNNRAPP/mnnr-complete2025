#!/bin/bash
echo "=== Build Verification ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PNPM version: $(pnpm --version)"
echo "Environment: $NODE_ENV"
echo "=== API Routes Check ==="
if [ -d ".next/server/app/api" ]; then
    echo "✅ API directory found"
    ls -la .next/server/app/api/
    if [ -d ".next/server/app/api/health" ]; then
        echo "✅ Health API route found"
    else
        echo "❌ Health API route missing"
    fi
else
    echo "❌ API directory missing"
fi
echo "=== Build Complete ==="