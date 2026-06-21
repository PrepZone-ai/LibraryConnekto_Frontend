# PowerShell script to build Capacitor APK for Library Connekto

Write-Host "Building Library Connekto Capacitor APK..." -ForegroundColor Green

if (-not (Test-Path "$env:ANDROID_HOME")) {
    Write-Host "ANDROID_HOME environment variable not set. Please install Android SDK." -ForegroundColor Red
    exit 1
}

try {
    java -version 2>&1 | Out-Null
} catch {
    Write-Host "Java not found. Please install Java JDK." -ForegroundColor Red
    exit 1
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$jbrCandidates = @(
    "$env:LOCALAPPDATA\Programs\Android Studio\jbr",
    "C:\Program Files\Android\Android Studio\jbr",
    "$env:ProgramFiles\Android\Android Studio\jbr"
)
foreach ($jbr in $jbrCandidates) {
    if (Test-Path "$jbr\bin\java.exe") {
        $env:JAVA_HOME = $jbr
        $env:PATH = "$jbr\bin;$env:PATH"
        Write-Host "Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
        break
    }
}

$env:VITE_API_BASE_URL = "https://api.libraryconnekto.me/api/v1"
Write-Host "Using API: $env:VITE_API_BASE_URL" -ForegroundColor Cyan

Write-Host "Generating launcher icons from Logo..." -ForegroundColor Yellow
npm run create:launcher
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Building web assets..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Syncing Capacitor Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit 1 }

Set-Location "android"

if (-not (Test-Path "app/debug.keystore")) {
    if (Test-Path "../keystore-backup/debug.keystore") {
        Copy-Item "../keystore-backup/debug.keystore" "app/debug.keystore" -Force
    } else {
        keytool -genkey -v -keystore app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    }
}

if (-not (Test-Path "app/release.keystore")) {
    if (Test-Path "../keystore-backup/release.keystore") {
        Copy-Item "../keystore-backup/release.keystore" "app/release.keystore" -Force
    } else {
        keytool -genkey -v -keystore app/release.keystore -storepass libraryconnekto123 -alias libraryconnekto -keypass libraryconnekto123 -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Library Connekto,O=Library Connekto,C=US"
    }
}

Write-Host "Building debug APK..." -ForegroundColor Yellow
./gradlew assembleDebug
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Building release APK..." -ForegroundColor Yellow
./gradlew assembleRelease
if ($LASTEXITCODE -ne 0) { exit 1 }

Copy-Item "app/build/outputs/apk/debug/app-debug.apk" "../Library-Connekto-Debug.apk" -Force
Copy-Item "app/build/outputs/apk/release/app-release.apk" "../Library-Connekto-Release.apk" -Force

Set-Location ".."
Write-Host "APK build completed!" -ForegroundColor Green
Write-Host "Debug: Library-Connekto-Debug.apk" -ForegroundColor Cyan
Write-Host "Release: Library-Connekto-Release.apk" -ForegroundColor Cyan
