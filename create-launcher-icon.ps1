# Generate Android launcher icons from Logo.png for all mipmap densities

$ErrorActionPreference = "Stop"

$sourceLogo = "public/Logo.png"
if (-not (Test-Path $sourceLogo)) {
    $sourceLogo = "src/assets/Logo.png"
}
if (-not (Test-Path $sourceLogo)) {
    Write-Host "Logo not found. Expected public/Logo.png or src/assets/Logo.png" -ForegroundColor Red
    exit 1
}

Write-Host "Using logo source: $sourceLogo" -ForegroundColor Cyan

$legacySizes = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$adaptiveSizes = @{
    "mipmap-mdpi"    = 108
    "mipmap-hdpi"    = 162
    "mipmap-xhdpi"   = 216
    "mipmap-xxhdpi"  = 324
    "mipmap-xxxhdpi" = 432
}

$resRoot = "android/app/src/main/res"
$script:DrawingAsmLoaded = $false

function Save-ResizedIcon {
    param(
        [string]$Source,
        [string]$Dest,
        [int]$Px,
        [double]$SafeRatio = 1.0
    )

    if (Get-Command magick -ErrorAction SilentlyContinue) {
        $inner = if ($SafeRatio -ge 1) { $Px } else { [int][Math]::Round($Px * 72 / 108) }
        magick convert $Source -resize "${inner}x${inner}" -background white -gravity center -extent "${Px}x${Px}" $Dest
        return
    }

    if (-not $script:DrawingAsmLoaded) {
        Add-Type -AssemblyName System.Drawing
        $script:DrawingAsmLoaded = $true
    }

    $innerPx = if ($SafeRatio -ge 1) { $Px } else { [int][Math]::Round($Px * 72 / 108) }
    $src = [System.Drawing.Image]::FromFile((Resolve-Path $Source))
    $bmp = New-Object System.Drawing.Bitmap $Px, $Px
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $ratio = [Math]::Min($innerPx / $src.Width, $innerPx / $src.Height)
    $width = [int]($src.Width * $ratio)
    $height = [int]($src.Height * $ratio)
    $x = [int](($Px - $width) / 2)
    $y = [int](($Px - $height) / 2)
    $g.DrawImage($src, $x, $y, $width, $height)

    $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
}

foreach ($folder in $legacySizes.Keys) {
    $dir = Join-Path $resRoot $folder
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $px = $legacySizes[$folder]
    $launcher = Join-Path $dir "ic_launcher.png"
    $launcherRound = Join-Path $dir "ic_launcher_round.png"

    Save-ResizedIcon -Source $sourceLogo -Dest $launcher -Px $px -SafeRatio 1
    Save-ResizedIcon -Source $sourceLogo -Dest $launcherRound -Px $px -SafeRatio 1
    Write-Host "Generated legacy $folder icons (${px}px)" -ForegroundColor Green
}

foreach ($folder in $adaptiveSizes.Keys) {
    $dir = Join-Path $resRoot $folder
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $px = $adaptiveSizes[$folder]
    $foreground = Join-Path $dir "ic_launcher_foreground.png"
    Save-ResizedIcon -Source $sourceLogo -Dest $foreground -Px $px -SafeRatio 0.72
    Write-Host "Generated adaptive foreground $folder (${px}px)" -ForegroundColor Green
}

Write-Host "Launcher icons ready under $resRoot" -ForegroundColor Cyan
