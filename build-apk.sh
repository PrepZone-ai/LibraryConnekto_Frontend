#!/bin/bash

# Bash script to build APK for Library Connekto PWA
# This script creates a TWA (Trusted Web Activity) APK without Capacitor

echo "🚀 Building Library Connekto APK..."

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

# Build debug APK
echo "🔨 Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Debug APK build failed!"
    exit 1
fi

# Build release APK
echo "🔨 Building release APK..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo "✅ Release APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
else
    echo "❌ Release APK build failed!"
    exit 1
fi

# Copy APKs to root directory for easy access
echo "📋 Copying APKs to root directory..."
cp app/build/outputs/apk/debug/app-debug.apk ../Library-Connekto-Debug.apk
cp app/build/outputs/apk/release/app-release.apk ../Library-Connekto-Release.apk

echo "🎉 APK build completed successfully!"
echo "📱 Debug APK: Library-Connekto-Debug.apk"
echo "📱 Release APK: Library-Connekto-Release.apk"

# Return to root directory
cd ..

