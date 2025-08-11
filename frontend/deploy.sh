#!/bin/bash

# FastTrack Production Deployment Script
# Deploy PWA to Netlify with performance optimization

echo "🚀 Starting FastTrack Production Deployment..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "quasar.config.js" ]; then
    echo "❌ Error: Not in FastTrack project directory"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/pwa

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run tests before deployment
echo "🧪 Running tests..."
npm run test:run
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Deployment aborted."
    exit 1
fi
echo "✅ All tests passed!"

# Build PWA for production
echo "🏗️  Building PWA for production..."
quasar build -m pwa

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Deployment aborted."
    exit 1
fi

echo "✅ Build successful!"

# Display build stats
echo "📊 Build Statistics:"
echo "==================="
du -sh dist/pwa
echo ""

# Check for Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
cd dist/pwa

# Production deployment
netlify deploy --prod --dir .

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "========================"
    echo "✅ FastTrack PWA is now live!"
    echo "✅ Service Worker enabled"
    echo "✅ Offline functionality active"
    echo "✅ PWA installable on mobile devices"
    echo ""
    echo "📱 Test on mobile devices for PWA installation"
    echo "📊 Monitor performance with Lighthouse"
    echo "🔗 Share the URL to start collecting user feedback!"
    echo ""
else
    echo "❌ Deployment failed!"
    exit 1
fi 