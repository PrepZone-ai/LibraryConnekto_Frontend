import { Capacitor } from '@capacitor/core';

const APP_MODE_KEY = 'appMode';

/**
 * Runtime platform — website and Capacitor APK are independent:
 *
 * - `capacitor`  → installed APK (WebView, bundled dist, app shell always)
 * - `website`    → browser at libraryconnekto.me (marketing UI, header, footer)
 * - `app-preview`→ browser with ?app=1 (app shell for local testing only)
 */
export function getRuntimePlatform() {
  if (typeof window === 'undefined') return 'website';

  if (Capacitor.isNativePlatform()) {
    return 'capacitor';
  }

  const appParam = new URLSearchParams(window.location.search).get('app');
  if (appParam === '1') {
    return 'app-preview';
  }

  return 'website';
}

export function isCapacitorApp() {
  return getRuntimePlatform() === 'capacitor';
}

export function isWebsite() {
  return getRuntimePlatform() === 'website';
}

/** True when the mobile app shell (bottom nav, AppHome) should render. */
export function isAppShell() {
  const platform = getRuntimePlatform();
  return platform === 'capacitor' || platform === 'app-preview';
}

export function persistAppPreviewMode(enabled) {
  if (typeof window === 'undefined') return;
  if (enabled) {
    sessionStorage.setItem(APP_MODE_KEY, '1');
  } else {
    sessionStorage.removeItem(APP_MODE_KEY);
  }
}

export function clearAppPreviewMode() {
  persistAppPreviewMode(false);
}

export function hasStickyAppPreview() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(APP_MODE_KEY) === '1';
}
