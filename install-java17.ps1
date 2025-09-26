# Script to install Java 17 for Android builds
# This will help resolve the Java version compatibility issue

Write-Host "Installing Java 17 for Android builds..." -ForegroundColor Green

# Check if winget is available
if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "Installing Java 17 using winget..." -ForegroundColor Yellow
    winget install Microsoft.OpenJDK.17
    Write-Host "Java 17 installed successfully!" -ForegroundColor Green
    Write-Host "Please restart your terminal and try building again." -ForegroundColor Cyan
} else {
    Write-Host "Winget not available. Please install Java 17 manually:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Cyan
    Write-Host "2. Download Java 17 for Windows" -ForegroundColor Cyan
    Write-Host "3. Install and set JAVA_HOME to Java 17" -ForegroundColor Cyan
    Write-Host "4. Update PATH to use Java 17" -ForegroundColor Cyan
}

Write-Host "After installing Java 17, run: npm run build:apk" -ForegroundColor Green
