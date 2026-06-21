# Generate Android launcher icons from Logo.png for all mipmap densities

$ErrorActionPreference = "Stop"

$sourceLogo = "src/assets/Logo.png"
if (-not (Test-Path $sourceLogo)) {
    Write-Host "Logo not found at $sourceLogo" -ForegroundColor Red
    exit 1
}

$sizes = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$resRoot = "android/app/src/main/res"

foreach ($folder in $sizes.Keys) {
    $dir = Join-Path $resRoot $folder
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $px = $sizes[$folder]
    $launcher = Join-Path $dir "ic_launcher.png"
    $launcherRound = Join-Path $dir "ic_launcher_round.png"

    if (Get-Command magick -ErrorAction SilentlyContinue) {
        magick convert $sourceLogo -resize "${px}x${px}" $launcher
        magick convert $sourceLogo -resize "${px}x${px}" $launcherRound
        Write-Host "Generated $folder icons (${px}px)" -ForegroundColor Green
    } else {
        Copy-Item $sourceLogo $launcher -Force
        Copy-Item $sourceLogo $launcherRound -Force
        Write-Host "Copied Logo.png to $folder (install ImageMagick for proper resize)" -ForegroundColor Yellow
    }
}

Write-Host "Launcher icons ready under $resRoot" -ForegroundColor Cyan
