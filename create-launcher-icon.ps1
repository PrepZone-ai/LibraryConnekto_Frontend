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
$script:DrawingAsmLoaded = $false

function Save-ResizedIcon {
    param([string]$Source, [string]$Dest, [int]$Px)
    if (Get-Command magick -ErrorAction SilentlyContinue) {
        magick convert $Source -resize "${Px}x${Px}" $Dest
        return
    }
    if (-not $script:DrawingAsmLoaded) {
        Add-Type -AssemblyName System.Drawing
        $script:DrawingAsmLoaded = $true
    }
    $src = [System.Drawing.Image]::FromFile((Resolve-Path $Source))
    $bmp = New-Object System.Drawing.Bitmap $Px, $Px
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $Px, $Px)
    $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $src.Dispose()
}

foreach ($folder in $sizes.Keys) {
    $dir = Join-Path $resRoot $folder
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $px = $sizes[$folder]
    $launcher = Join-Path $dir "ic_launcher.png"
    $launcherRound = Join-Path $dir "ic_launcher_round.png"

    Save-ResizedIcon -Source $sourceLogo -Dest $launcher -Px $px
    Save-ResizedIcon -Source $sourceLogo -Dest $launcherRound -Px $px
    Write-Host "Generated $folder icons (${px}px)" -ForegroundColor Green
}

Write-Host "Launcher icons ready under $resRoot" -ForegroundColor Cyan
