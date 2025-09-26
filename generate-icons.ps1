# PowerShell script to generate PNG icons for PWA
# This script creates all required icon sizes from the existing SVG

Write-Host "🎨 Generating PNG icons for Library Connekto PWA..." -ForegroundColor Green

# Check if ImageMagick is installed
try {
    $magickVersion = magick -version 2>&1
    Write-Host "✅ ImageMagick found: $($magickVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ ImageMagick not found. Please install ImageMagick to generate icons." -ForegroundColor Red
    Write-Host "Download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    Write-Host "Or use: winget install ImageMagick.ImageMagick" -ForegroundColor Yellow
    exit 1
}

# Create icons directory if it doesn't exist
if (-not (Test-Path "public/icons")) {
    New-Item -ItemType Directory -Path "public/icons" -Force
    Write-Host "📁 Created icons directory" -ForegroundColor Yellow
}

# Icon sizes required for PWA
$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)

# Generate PNG icons from SVG
foreach ($size in $iconSizes) {
    $inputFile = "public/icons/icon-192.svg"
    $outputFile = "public/icons/icon-$size.png"
    
    if (Test-Path $inputFile) {
        Write-Host "🖼️  Generating icon-$size.png..." -ForegroundColor Yellow
        magick convert $inputFile -resize "${size}x${size}" $outputFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Generated icon-$size.png" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to generate icon-$size.png" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Source SVG not found: $inputFile" -ForegroundColor Yellow
        Write-Host "Creating placeholder icon-$size.png..." -ForegroundColor Yellow
        
        # Create a simple placeholder icon
        magick convert -size "${size}x${size}" xc:"#0ea5e9" -fill white -gravity center -pointsize $([math]::Floor($size/8)) -annotate +0+0 "LC" $outputFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Generated placeholder icon-$size.png" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to generate placeholder icon-$size.png" -ForegroundColor Red
        }
    }
}

Write-Host "🎉 Icon generation completed!" -ForegroundColor Green
Write-Host "📱 All required PNG icons have been generated in public/icons/" -ForegroundColor Cyan

