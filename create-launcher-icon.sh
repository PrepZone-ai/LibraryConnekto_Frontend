#!/bin/bash

# Bash script to create Android launcher icons
# This script generates the required mipmap icons for Android

echo "🎨 Creating Android launcher icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install ImageMagick to generate icons."
    echo "Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "macOS: brew install imagemagick"
    exit 1
else
    echo "✅ ImageMagick found: $(convert -version | head -n 1)"
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

# Generate launcher icons
for density in "${!icon_sizes[@]}"; do
    size=${icon_sizes[$density]}
    output_file="android/app/src/main/res/$density/ic_launcher.png"
    output_file_round="android/app/src/main/res/$density/ic_launcher_round.png"
    
    echo "🖼️  Generating $density icon (${size}x${size})..."
    
    # Create a simple Library Connekto icon with LC initials
    pointsize=$((size/3))
    convert -size "${size}x${size}" xc:"#0ea5e9" -fill white -gravity center -pointsize $pointsize -font Arial-Bold -annotate +0+0 "LC" "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ Generated ic_launcher.png for $density"
    else
        echo "❌ Failed to generate ic_launcher.png for $density"
    fi
    
    # Create round version - same as regular for now
    convert -size "${size}x${size}" xc:"#0ea5e9" -fill white -gravity center -pointsize $pointsize -font Arial-Bold -annotate +0+0 "LC" "$output_file_round"
    
    if [ $? -eq 0 ]; then
        echo "✅ Generated ic_launcher_round.png for $density"
    else
        echo "❌ Failed to generate ic_launcher_round.png for $density"
    fi
done

echo "🎉 Android launcher icons created successfully!"
echo "📱 Icons are ready for APK/AAB build"