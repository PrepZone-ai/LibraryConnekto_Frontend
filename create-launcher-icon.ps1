# PowerShell script to create Android launcher icons
# This script generates the required mipmap icons for Android

Write-Host "🎨 Creating Android launcher icons..." -ForegroundColor Green

# Check if ImageMagick is installed
try {
    $magickVersion = magick -version 2>&1
    Write-Host "✅ ImageMagick found: $($magickVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ ImageMagick not found. Please install ImageMagick to generate icons." -ForegroundColor Red
    Write-Host "Download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    exit 1
}

# Create mipmap directories
$mipmapDirs = @(
    "android/app/src/main/res/mipmap-mdpi",
    "android/app/src/main/res/mipmap-hdpi", 
    "android/app/src/main/res/mipmap-xhdpi",
    "android/app/src/main/res/mipmap-xxhdpi",
    "android/app/src/main/res/mipmap-xxxhdpi"
)

foreach ($dir in $mipmapDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "📁 Created directory: $dir" -ForegroundColor Yellow
    }
}

# Icon sizes for different densities
$iconSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

# Generate launcher icons
foreach ($density in $iconSizes.Keys) {
    $size = $iconSizes[$density]
    $outputFile = "android/app/src/main/res/$density/ic_launcher.png"
    $outputFileRound = "android/app/src/main/res/$density/ic_launcher_round.png"
    
    Write-Host "🖼️  Generating $density icon ($size x $size)..." -ForegroundColor Yellow
    
    # Create a simple Library Connekto icon with LC initials
    magick convert -size "${size}x${size}" xc:"#0ea5e9" -fill white -gravity center -pointsize $([math]::Floor($size/3)) -font Arial-Bold -annotate +0+0 "LC" $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Generated ic_launcher.png for $density" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to generate ic_launcher.png for $density" -ForegroundColor Red
    }
    
    # Create round version
    magick convert -size "${size}x${size}" xc:"#0ea5e9" -fill white -gravity center -pointsize $([math]::Floor($size/3)) -font Arial-Bold -annotate +0+0 "LC" -background transparent -gravity center -extent "${size}x${size}" -alpha set -channel A -evaluate set 100% $outputFileRound
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Generated ic_launcher_round.png for $density" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to generate ic_launcher_round.png for $density" -ForegroundColor Red
    }
}

Write-Host "🎉 Android launcher icons created successfully!" -ForegroundColor Green
Write-Host "📱 Icons are ready for APK/AAB build" -ForegroundColor Cyan

