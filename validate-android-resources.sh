#!/bin/bash

# Script to validate all required Android resources are in place

echo "🔍 Validating Android resources..."

# Check if Android directory exists
if [ ! -d "android" ]; then
    echo "❌ Android directory not found"
    exit 1
fi

echo "✅ Android directory found"

# Check launcher icons
icon_densities=("mipmap-mdpi" "mipmap-hdpi" "mipmap-xhdpi" "mipmap-xxhdpi" "mipmap-xxxhdpi")
missing_icons=0

for density in "${icon_densities[@]}"; do
    launcher_icon="android/app/src/main/res/$density/ic_launcher.png"
    launcher_round_icon="android/app/src/main/res/$density/ic_launcher_round.png"
    launcher_foreground="android/app/src/main/res/$density/ic_launcher_foreground.png"
    
    if [ ! -f "$launcher_icon" ]; then
        echo "❌ Missing: $launcher_icon"
        missing_icons=$((missing_icons + 1))
    fi
    
    if [ ! -f "$launcher_round_icon" ]; then
        echo "❌ Missing: $launcher_round_icon"
        missing_icons=$((missing_icons + 1))
    fi

    if [ ! -f "$launcher_foreground" ]; then
        echo "❌ Missing: $launcher_foreground"
        missing_icons=$((missing_icons + 1))
    fi
done

if [ $missing_icons -eq 0 ]; then
    echo "✅ All launcher icons present (${#icon_densities[@]} densities)"
else
    echo "❌ Missing $missing_icons launcher icons"
    exit 1
fi

# Check required XML files
required_xml=(
    "android/app/src/main/res/xml/backup_rules.xml"
    "android/app/src/main/res/xml/data_extraction_rules.xml"
    "android/app/src/main/res/values/strings.xml"
    "android/app/src/main/res/values/themes.xml"
    "android/app/src/main/res/values/colors.xml"
)

missing_xml=0
for xml_file in "${required_xml[@]}"; do
    if [ ! -f "$xml_file" ]; then
        echo "❌ Missing: $xml_file"
        missing_xml=$((missing_xml + 1))
    fi
done

if [ $missing_xml -eq 0 ]; then
    echo "✅ All required XML files present"
else
    echo "❌ Missing $missing_xml XML files"
    exit 1
fi

# Check gradlew executable
if [ ! -x "android/gradlew" ]; then
    echo "❌ android/gradlew is not executable"
    exit 1
else
    echo "✅ android/gradlew is executable"
fi

# Check AndroidManifest.xml
if [ ! -f "android/app/src/main/AndroidManifest.xml" ]; then
    echo "❌ AndroidManifest.xml not found"
    exit 1
else
    echo "✅ AndroidManifest.xml found"
fi

echo "🎉 All Android resources validated successfully!"
echo "📱 Ready for Android build"