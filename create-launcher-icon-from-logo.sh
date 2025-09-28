#!/bin/bash

# Bash script to create Android launcher icons from Logo.png
# This script generates the required mipmap icons for Android using src/assets/Logo.png

echo "🎨 Creating Android launcher icons from Logo.png..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install ImageMagick to generate icons."
    echo "Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "macOS: brew install imagemagick"
    exit 1
else
    echo "✅ ImageMagick found: $(convert -version | head -n 1)"
fi

# Check if Logo.png exists
SOURCE_LOGO="src/assets/Logo.png"
if [ ! -f "$SOURCE_LOGO" ]; then
    echo "❌ Logo.png not found at $SOURCE_LOGO"
    exit 1
else
    echo "✅ Found Logo.png at $SOURCE_LOGO"
fi

# Create mipmap directories
mipmap_dirs=(
    "android/app/src/main/res/mipmap-mdpi"
    "android/app/src/main/res/mipmap-hdpi"
    "android/app/src/main/res/mipmap-xhdpi"
    "android/app/src/main/res/mipmap-xxhdpi"
    "android/app/src/main/res/mipmap-xxxhdpi"
)

for dir in "${mipmap_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "📁 Created directory: $dir"
    fi
done

# Icon sizes for different densities
declare -A icon_sizes=(
    ["mipmap-mdpi"]=48
    ["mipmap-hdpi"]=72
    ["mipmap-xhdpi"]=96
    ["mipmap-xxhdpi"]=144
    ["mipmap-xxxhdpi"]=192
)

# Generate launcher icons from Logo.png
for density in "${!icon_sizes[@]}"; do
    size=${icon_sizes[$density]}
    output_file="android/app/src/main/res/$density/ic_launcher.png"
    output_file_round="android/app/src/main/res/$density/ic_launcher_round.png"
    
    echo "🖼️  Generating $density icon (${size}x${size})..."
    
    # Create regular launcher icon with white background
    convert "$SOURCE_LOGO" -background white -gravity center -extent "${size}x${size}" "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ Generated ic_launcher.png for $density"
    else
        echo "❌ Failed to generate ic_launcher.png for $density"
    fi
    
    # Create round version with transparent background and circular crop
    convert "$SOURCE_LOGO" -background transparent -gravity center -extent "${size}x${size}" \
        \( +clone -threshold 100% -fill black -draw "circle $((size/2)),$((size/2)) $((size/2)),0" \) \
        -alpha off -compose copy_opacity -composite "$output_file_round"
    
    if [ $? -eq 0 ]; then
        echo "✅ Generated ic_launcher_round.png for $density"
    else
        echo "❌ Failed to generate ic_launcher_round.png for $density"
    fi
done

echo "🎉 Android launcher icons created successfully from Logo.png!"
echo "📱 Icons are ready for APK/AAB build"