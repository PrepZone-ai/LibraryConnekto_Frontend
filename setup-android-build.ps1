# PowerShell script to set up Android build environment for Library Connekto
# This script prepares everything needed to build APK and AAB files

Write-Host "Setting up Android build environment for Library Connekto..." -ForegroundColor Green

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Java
try {
    $javaVersion = java -version 2>&1
    Write-Host "Java found: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "Java not found. Please install Java JDK 8 or higher." -ForegroundColor Red
    Write-Host "Download from: https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}

# Check Android SDK
if (-not (Test-Path "$env:ANDROID_HOME")) {
    Write-Host "ANDROID_HOME environment variable not set." -ForegroundColor Red
    Write-Host "Please install Android Studio and set ANDROID_HOME:" -ForegroundColor Yellow
    Write-Host "1. Download Android Studio: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host "2. Set ANDROID_HOME to your Android SDK path" -ForegroundColor Yellow
    Write-Host "3. Add ANDROID_HOME/tools and ANDROID_HOME/platform-tools to PATH" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "ANDROID_HOME found: $env:ANDROID_HOME" -ForegroundColor Green
}

# Check ImageMagick for icon generation
try {
    $magickVersion = magick -version 2>&1
    Write-Host "ImageMagick found: $($magickVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "ImageMagick not found. Icon generation will be skipped." -ForegroundColor Yellow
    Write-Host "Install ImageMagick for better icon generation:" -ForegroundColor Yellow
    Write-Host "Download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
}

# Make scripts executable (for Unix compatibility)
Write-Host "Setting up build scripts..." -ForegroundColor Yellow

# Generate icons if ImageMagick is available
if (Get-Command magick -ErrorAction SilentlyContinue) {
    Write-Host "Generating PWA icons..." -ForegroundColor Yellow
    & ".\generate-icons.ps1"
    
    Write-Host "Creating Android launcher icons..." -ForegroundColor Yellow
    & ".\create-launcher-icon.ps1"
} else {
    Write-Host "Skipping icon generation (ImageMagick not available)" -ForegroundColor Yellow
}

# Create Android directories if they don't exist
Write-Host "Ensuring Android project structure..." -ForegroundColor Yellow

$androidDirs = @(
    "android/app/src/main/res/mipmap-mdpi",
    "android/app/src/main/res/mipmap-hdpi",
    "android/app/src/main/res/mipmap-xhdpi", 
    "android/app/src/main/res/mipmap-xxhdpi",
    "android/app/src/main/res/mipmap-xxxhdpi",
    "android/app/src/main/res/values",
    "android/app/src/main/res/xml"
)

foreach ($dir in $androidDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Cyan
    }
}

# Make gradlew executable
if (Test-Path "android/gradlew") {
    Write-Host "Making gradlew executable..." -ForegroundColor Yellow
    # On Windows, this is handled by the .bat file
}

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build APK: npm run build:apk" -ForegroundColor White
Write-Host "2. Build AAB: npm run build:aab" -ForegroundColor White
Write-Host "3. Build both: npm run build:all" -ForegroundColor White
Write-Host ""
Write-Host "Your PWA will be accessible at:" -ForegroundColor Cyan
Write-Host "https://libraryconnekto.me" -ForegroundColor White
Write-Host "https://www.libraryconnekto.me" -ForegroundColor White
Write-Host "https://library-connekto-frontend-cs84.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "Ready to build your Android app!" -ForegroundColor Green
