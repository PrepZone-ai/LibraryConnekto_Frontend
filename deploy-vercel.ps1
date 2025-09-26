# Vercel Deployment Script for Library Connekto (PowerShell)
# This script helps deploy the frontend to Vercel with the correct configuration

Write-Host "🚀 Deploying Library Connekto to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI is not installed. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if user is logged in to Vercel
try {
    vercel whoami | Out-Null
    Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please log in to Vercel:" -ForegroundColor Yellow
    vercel login
}

# Set environment variable for production
Write-Host "⚙️  Setting environment variables..." -ForegroundColor Blue
try {
    $env:VITE_API_BASE_URL = "https://libraryconnekto-api-324578194548.us-central1.run.app/api/v1"
    vercel env add VITE_API_BASE_URL production
    Write-Host "✅ Environment variable set" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Environment variable may already exist" -ForegroundColor Yellow
}

# Deploy to production
Write-Host "📦 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app should be live at the URL provided above." -ForegroundColor Cyan
Write-Host "📝 Don't forget to configure your custom domain in the Vercel dashboard if needed." -ForegroundColor Yellow
