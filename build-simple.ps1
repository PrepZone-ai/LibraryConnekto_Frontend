# Simple build script for Library Connekto APK/AAB
# This script uses existing Gradle setup

Write-Host "Building Library Connekto APK/AAB..." -ForegroundColor Green

# Set environment variables
$env:ANDROID_HOME = "C:\Users\ASUS\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"

# Navigate to android directory
Set-Location "android"

# Generate keystores if they don't exist
if (-not (Test-Path "app/debug.keystore")) {
    Write-Host "Generating debug keystore..." -ForegroundColor Yellow
    keytool -genkey -v -keystore app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
}

if (-not (Test-Path "app/release.keystore")) {
    Write-Host "Generating release keystore..." -ForegroundColor Yellow
    keytool -genkey -v -keystore app/release.keystore -storepass libraryconnekto123 -alias libraryconnekto -keypass libraryconnekto123 -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Library Connekto,O=Library Connekto,C=US"
}

# Try to build with existing Gradle
Write-Host "Attempting to build APK..." -ForegroundColor Yellow

try {
    # Build debug APK
    Write-Host "Building debug APK..." -ForegroundColor Yellow
    ./gradlew assembleDebug --no-daemon --offline
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Debug APK built successfully!" -ForegroundColor Green
        
        # Copy to root directory
        Copy-Item "app/build/outputs/apk/debug/app-debug.apk" "../Library-Connekto-Debug.apk" -Force
        Write-Host "Debug APK copied to: Library-Connekto-Debug.apk" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to network issues or missing dependencies." -ForegroundColor Yellow
}

# Return to root directory
Set-Location ".."

Write-Host "Build process completed!" -ForegroundColor Green
