# Library Connekto - APK & AAB Build Guide

This guide explains how to build APK and AAB (Android App Bundle) files for the Library Connekto PWA without using Capacitor. The app uses TWA (Trusted Web Activity) technology to wrap your PWA in a native Android app.

## 🚀 Quick Start

### Prerequisites

1. **Java JDK 8 or higher**
   - Download from: https://adoptium.net/
   - Verify installation: `java -version`

2. **Android SDK**
   - Download Android Studio: https://developer.android.com/studio
   - Set `ANDROID_HOME` environment variable
   - Add `$ANDROID_HOME/tools` and `$ANDROID_HOME/platform-tools` to PATH

3. **Node.js and npm** (for PWA build)
   - Download from: https://nodejs.org/

### Build Commands

#### For Windows (PowerShell):
```bash
# Build APK files
npm run build:apk

# Build AAB files
npm run build:aab
```

#### For Unix/Linux/macOS:
```bash
# Build APK files
npm run build:apk:unix

# Build AAB files
npm run build:aab:unix
```

#### Manual Build:
```bash
# Navigate to android directory
cd android

# Build APK
./gradlew assembleRelease

# Build AAB
./gradlew bundleRelease
```

## 📱 Generated Files

After successful build, you'll find:

### APK Files:
- `Library-Connekto-Debug.apk` - Debug version for testing
- `Library-Connekto-Release.apk` - Release version for distribution

### AAB Files:
- `Library-Connekto-Debug.aab` - Debug bundle for testing
- `Library-Connekto-Release.aab` - Release bundle for Google Play Store

## 🔧 Configuration

### App Configuration

The app is configured to work with these URLs:
- `https://libraryconnekto.me`
- `https://www.libraryconnekto.me`
- `https://library-connekto-frontend-cs84.vercel.app`

### App Details:
- **Package Name**: `com.libraryconnekto.app`
- **App Name**: Library Connekto
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)

### Keystore Configuration

The build scripts automatically generate keystores:
- **Debug Keystore**: `android/app/debug.keystore`
- **Release Keystore**: `android/app/release.keystore`

**Default Release Keystore Password**: `libraryconnekto123`

## 🛠️ Customization

### Changing App URLs

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data
    android:name="android.support.customtabs.trusted.DEFAULT_URL"
    android:value="https://your-domain.com" />
```

### Changing App Details

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.yourcompany.yourapp"
    minSdk 21
    targetSdk 34
    versionCode 1
    versionName "1.0.0"
}
```

### Custom Keystore

1. Generate your keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('my-release-key.keystore')
        storePassword 'your-store-password'
        keyAlias 'my-key-alias'
        keyPassword 'your-key-password'
    }
}
```

## 📋 PWA Requirements

Your PWA must meet these requirements for TWA:

1. **HTTPS**: Your app must be served over HTTPS
2. **Manifest**: Valid `manifest.webmanifest` file
3. **Service Worker**: Working service worker for offline functionality
4. **Icons**: Proper app icons in multiple sizes

### Current PWA Setup

✅ **Manifest**: Configured with proper icons and metadata
✅ **Service Worker**: Implemented with caching strategies
✅ **HTTPS**: All URLs use HTTPS
✅ **Icons**: Multiple icon sizes defined

## 🚀 Deployment

### Google Play Store

1. **Upload AAB**: Use `Library-Connekto-Release.aab`
2. **App Signing**: Use Google Play App Signing
3. **Store Listing**: Complete all required fields
4. **Content Rating**: Complete content rating questionnaire

### Direct Distribution

1. **APK Distribution**: Use `Library-Connekto-Release.apk`
2. **Sideloading**: Users can install directly
3. **Alternative Stores**: Upload to other app stores

## 🔍 Troubleshooting

### Common Issues

1. **ANDROID_HOME not set**
   ```
   Error: ANDROID_HOME environment variable not set
   Solution: Install Android Studio and set ANDROID_HOME
   ```

2. **Java not found**
   ```
   Error: Java not found
   Solution: Install Java JDK 8+ and add to PATH
   ```

3. **Gradle build fails**
   ```
   Error: Build failed
   Solution: Check internet connection and try again
   ```

4. **Keystore issues**
   ```
   Error: Keystore not found
   Solution: Scripts auto-generate keystores, check permissions
   ```

### Build Verification

After build, verify your APK/AAB:

```bash
# Check APK info
aapt dump badging Library-Connekto-Release.apk

# Install APK for testing
adb install Library-Connekto-Release.apk
```

## 📚 Technical Details

### TWA (Trusted Web Activity)

This implementation uses TWA technology which:
- Wraps your PWA in a native Android app
- Provides native app experience
- Maintains PWA functionality
- Supports deep linking
- Enables app store distribution

### Architecture

```
Library Connekto PWA
├── React + Vite Frontend
├── Service Worker (Offline Support)
├── Web App Manifest
└── TWA Wrapper (Android)
    ├── LauncherActivity
    ├── Custom Tabs
    └── Native Android Features
```

### Security

- **HTTPS Only**: All communication over secure connections
- **App Signing**: APK/AAB files are digitally signed
- **Domain Verification**: TWA verifies domain ownership
- **Secure Storage**: Keystores protected with passwords

## 🎯 Next Steps

1. **Test APK**: Install and test on Android devices
2. **Upload to Play Store**: Use AAB for Google Play
3. **Monitor Performance**: Track app performance and user feedback
4. **Update Process**: Rebuild and upload new versions as needed

## 📞 Support

For issues or questions:
1. Check this guide first
2. Verify all prerequisites are installed
3. Check build logs for specific errors
4. Ensure PWA is working correctly in browsers

---

**Happy Building! 🚀**

