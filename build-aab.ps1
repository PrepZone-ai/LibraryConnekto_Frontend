# PowerShell script to build AAB (Android App Bundle) for Library Connekto PWA
# This script creates a TWA (Trusted Web Activity) AAB without Capacitor

Write-Host "🚀 Building Library Connekto AAB..." -ForegroundColor Green

# Check if Android SDK is installed
if (-not (Test-Path "$env:ANDROID_HOME")) {
    Write-Host "❌ ANDROID_HOME environment variable not set. Please install Android SDK." -ForegroundColor Red
    Write-Host "Download from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java found: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java JDK 8 or higher." -ForegroundColor Red
    exit 1
}

# Navigate to android directory
Set-Location "android"

# Generate debug keystore if it doesn't exist
if (-not (Test-Path "app/debug.keystore")) {
    Write-Host "🔑 Generating debug keystore..." -ForegroundColor Yellow
    keytool -genkey -v -keystore app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
}

# Generate release keystore if it doesn't exist
if (-not (Test-Path "app/release.keystore")) {
    Write-Host "🔑 Generating release keystore..." -ForegroundColor Yellow
    keytool -genkey -v -keystore app/release.keystore -storepass libraryconnekto123 -alias libraryconnekto -keypass libraryconnekto123 -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Library Connekto,O=Library Connekto,C=US"
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
./gradlew clean

# Build debug AAB
Write-Host "🔨 Building debug AAB..." -ForegroundColor Yellow
./gradlew bundleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Debug AAB built successfully!" -ForegroundColor Green
    Write-Host "📱 AAB location: android/app/build/outputs/bundle/debug/app-debug.aab" -ForegroundColor Cyan
} else {
    Write-Host "❌ Debug AAB build failed!" -ForegroundColor Red
    exit 1
}

# Build release AAB
Write-Host "🔨 Building release AAB..." -ForegroundColor Yellow
./gradlew bundleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Release AAB built successfully!" -ForegroundColor Green
    Write-Host "📱 AAB location: android/app/build/outputs/bundle/release/app-release.aab" -ForegroundColor Cyan
} else {
    Write-Host "❌ Release AAB build failed!" -ForegroundColor Red
    exit 1
}

# Copy AABs to root directory for easy access
Write-Host "📋 Copying AABs to root directory..." -ForegroundColor Yellow
Copy-Item "app/build/outputs/bundle/debug/app-debug.aab" "../Library-Connekto-Debug.aab" -Force
Copy-Item "app/build/outputs/bundle/release/app-release.aab" "../Library-Connekto-Release.aab" -Force

Write-Host "🎉 AAB build completed successfully!" -ForegroundColor Green
Write-Host "📱 Debug AAB: Library-Connekto-Debug.aab" -ForegroundColor Cyan
Write-Host "📱 Release AAB: Library-Connekto-Release.aab" -ForegroundColor Cyan
Write-Host "📱 Upload the release AAB to Google Play Console for distribution" -ForegroundColor Yellow

# Return to root directory
Set-Location ".."

