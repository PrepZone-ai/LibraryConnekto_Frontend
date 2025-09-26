# PowerShell script to build APK for Library Connekto PWA
# This script creates a TWA (Trusted Web Activity) APK without Capacitor

Write-Host "Building Library Connekto APK..." -ForegroundColor Green

# Check if Android SDK is installed
if (-not (Test-Path "$env:ANDROID_HOME")) {
    Write-Host "ANDROID_HOME environment variable not set. Please install Android SDK." -ForegroundColor Red
    Write-Host "Download from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1
    Write-Host "Java found: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "Java not found. Please install Java JDK 8 or higher." -ForegroundColor Red
    exit 1
}

# Navigate to android directory
Set-Location "android"

# Generate debug keystore if it doesn't exist
if (-not (Test-Path "app/debug.keystore")) {
    Write-Host "Generating debug keystore..." -ForegroundColor Yellow
    keytool -genkey -v -keystore app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
}

# Generate release keystore if it doesn't exist
if (-not (Test-Path "app/release.keystore")) {
    Write-Host "Generating release keystore..." -ForegroundColor Yellow
    keytool -genkey -v -keystore app/release.keystore -storepass libraryconnekto123 -alias libraryconnekto -keypass libraryconnekto123 -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Library Connekto,O=Library Connekto,C=US"
}

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
./gradlew clean

# Build debug APK
Write-Host "Building debug APK..." -ForegroundColor Yellow
./gradlew assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host "Debug APK built successfully!" -ForegroundColor Green
    Write-Host "APK location: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Cyan
} else {
    Write-Host "Debug APK build failed!" -ForegroundColor Red
    exit 1
}

# Build release APK
Write-Host "Building release APK..." -ForegroundColor Yellow
./gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "Release APK built successfully!" -ForegroundColor Green
    Write-Host "APK location: android/app/build/outputs/apk/release/app-release.apk" -ForegroundColor Cyan
} else {
    Write-Host "Release APK build failed!" -ForegroundColor Red
    exit 1
}

# Copy APKs to root directory for easy access
Write-Host "Copying APKs to root directory..." -ForegroundColor Yellow
Copy-Item "app/build/outputs/apk/debug/app-debug.apk" "../Library-Connekto-Debug.apk" -Force
Copy-Item "app/build/outputs/apk/release/app-release.apk" "../Library-Connekto-Release.apk" -Force

Write-Host "APK build completed successfully!" -ForegroundColor Green
Write-Host "Debug APK: Library-Connekto-Debug.apk" -ForegroundColor Cyan
Write-Host "Release APK: Library-Connekto-Release.apk" -ForegroundColor Cyan

# Return to root directory
Set-Location ".."

