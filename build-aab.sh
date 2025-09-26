#!/bin/bash

# Bash script to build AAB (Android App Bundle) for Library Connekto PWA
# This script creates a TWA (Trusted Web Activity) AAB without Capacitor

echo "🚀 Building Library Connekto AAB..."

# Check if Android SDK is installed
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME environment variable not set. Please install Android SDK."
    echo "Download from: https://developer.android.com/studio"
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java JDK 8 or higher."
    exit 1
else
    echo "✅ Java found: $(java -version 2>&1 | head -n 1)"
fi

# Navigate to android directory
cd android

# Generate debug keystore if it doesn't exist
if [ ! -f "app/debug.keystore" ]; then
    echo "🔑 Generating debug keystore..."
    keytool -genkey -v -keystore app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
fi

# Generate release keystore if it doesn't exist
if [ ! -f "app/release.keystore" ]; then
    echo "🔑 Generating release keystore..."
    keytool -genkey -v -keystore app/release.keystore -storepass libraryconnekto123 -alias libraryconnekto -keypass libraryconnekto123 -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Library Connekto,O=Library Connekto,C=US"
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build debug AAB
echo "🔨 Building debug AAB..."
./gradlew bundleDebug

if [ $? -eq 0 ]; then
    echo "✅ Debug AAB built successfully!"
    echo "📱 AAB location: android/app/build/outputs/bundle/debug/app-debug.aab"
else
    echo "❌ Debug AAB build failed!"
    exit 1
fi

# Build release AAB
echo "🔨 Building release AAB..."
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo "✅ Release AAB built successfully!"
    echo "📱 AAB location: android/app/build/outputs/bundle/release/app-release.aab"
else
    echo "❌ Release AAB build failed!"
    exit 1
fi

# Copy AABs to root directory for easy access
echo "📋 Copying AABs to root directory..."
cp app/build/outputs/bundle/debug/app-debug.aab ../Library-Connekto-Debug.aab
cp app/build/outputs/bundle/release/app-release.aab ../Library-Connekto-Release.aab

echo "🎉 AAB build completed successfully!"
echo "📱 Debug AAB: Library-Connekto-Debug.aab"
echo "📱 Release AAB: Library-Connekto-Release.aab"
echo "📱 Upload the release AAB to Google Play Console for distribution"

# Return to root directory
cd ..

