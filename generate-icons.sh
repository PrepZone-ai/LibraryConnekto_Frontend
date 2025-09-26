#!/bin/bash

# Bash script to generate PNG icons for PWA
# This script creates all required icon sizes from the existing SVG

echo "🎨 Generating PNG icons for Library Connekto PWA..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick not found. Please install ImageMagick to generate icons."
    echo "Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "macOS: brew install imagemagick"
    echo "Or download from: https://imagemagick.org/script/download.php"
    exit 1
else
    echo "✅ ImageMagick found: $(magick -version | head -n 1)"
fi

# Create icons directory if it doesn't exist
if [ ! -d "public/icons" ]; then
    mkdir -p public/icons
    echo "📁 Created icons directory"
fi

# Icon sizes required for PWA
icon_sizes=(72 96 128 144 152 192 384 512)

# Generate PNG icons from SVG
for size in "${icon_sizes[@]}"; do
    input_file="public/icons/icon-192.svg"
    output_file="public/icons/icon-$size.png"
    
    if [ -f "$input_file" ]; then
        echo "🖼️  Generating icon-$size.png..."
        magick convert "$input_file" -resize "${size}x${size}" "$output_file"
        
        if [ $? -eq 0 ]; then
            echo "✅ Generated icon-$size.png"
        else
            echo "❌ Failed to generate icon-$size.png"
        fi
    else
        echo "⚠️  Source SVG not found: $input_file"
        echo "Creating placeholder icon-$size.png..."
        
        # Create a simple placeholder icon
        magick convert -size "${size}x${size}" xc:"#0ea5e9" -fill white -gravity center -pointsize $((size/8)) -annotate +0+0 "LC" "$output_file"
        
        if [ $? -eq 0 ]; then
            echo "✅ Generated placeholder icon-$size.png"
        else
            echo "❌ Failed to generate placeholder icon-$size.png"
        fi
    fi
done

echo "🎉 Icon generation completed!"
echo "📱 All required PNG icons have been generated in public/icons/"

