# Script to check GitHub Actions build status
# This helps you monitor your APK/AAB build progress

Write-Host "GitHub Actions Build Status Checker" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$repoUrl = "https://github.com/PrepZone-ai/LibraryConnekto_Frontend"
$actionsUrl = "$repoUrl/actions"

Write-Host "Repository: $repoUrl" -ForegroundColor Cyan
Write-Host "Actions URL: $actionsUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check your build status:" -ForegroundColor Yellow
Write-Host "1. Open: $actionsUrl" -ForegroundColor White
Write-Host "2. Look for 'Build Android APK and AAB' workflow" -ForegroundColor White
Write-Host "3. Click on the latest run to see progress" -ForegroundColor White
Write-Host "4. When complete, download artifacts from the bottom" -ForegroundColor White
Write-Host ""
Write-Host "Expected build time: 5-10 minutes" -ForegroundColor Green
Write-Host "You'll get 3 files:" -ForegroundColor Green
Write-Host "  - debug-apk (for testing)" -ForegroundColor White
Write-Host "  - release-apk (for distribution)" -ForegroundColor White
Write-Host "  - release-aab (for Google Play Store)" -ForegroundColor White
Write-Host ""

# Try to open the actions page
try {
    Start-Process $actionsUrl
    Write-Host "Opening GitHub Actions page in your browser..." -ForegroundColor Green
} catch {
    Write-Host "Could not open browser automatically. Please visit: $actionsUrl" -ForegroundColor Yellow
}
