#!/usr/bin/env bash
set -euo pipefail

# Vercel Deployment Script for Library Connekto
# This script helps deploy the frontend to Vercel with the correct configuration

echo "🚀 Deploying Library Connekto to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

# Set environment variable for production
echo "⚙️  Setting environment variables..."
vercel env add VITE_API_BASE_URL production <<< "https://ddlsandeep7-libraryconnekto1.hf.space/api/v1" || echo "Environment variable may already exist"

# Deploy to production
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at the URL provided above."
echo "📝 Don't forget to configure your custom domain in the Vercel dashboard if needed."
