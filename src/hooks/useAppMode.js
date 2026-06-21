import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  clearAppPreviewMode,
  hasStickyAppPreview,
  isCapacitorApp,
  persistAppPreviewMode,
} from '../lib/runtimePlatform';

let initialNavigationHandled = false;

function isHardPageLoad() {
  if (typeof window === 'undefined') return true;
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  return !nav || nav.type === 'navigate' || nav.type === 'reload';
}

/**
 * Website vs Capacitor APK — independent runtimes:
 * - Capacitor APK: always app shell (no URL bar, AppHome, bottom nav)
 * - Website browser: marketing site unless ?app=1 preview in this tab
 */
export function detectAppMode(search = '') {
  if (typeof window === 'undefined') return false;

  if (isCapacitorApp()) {
    initialNavigationHandled = true;
    return true;
  }

  const params = new URLSearchParams(search || window.location.search);
  const appParam = params.get('app');

  if (appParam === '1') {
    persistAppPreviewMode(true);
    initialNavigationHandled = true;
    return true;
  }

  if (appParam === '0') {
    clearAppPreviewMode();
    initialNavigationHandled = true;
    return false;
  }

  // Fresh website visit in browser — never inherit ?app=1 from an old tab session
  if (!initialNavigationHandled && isHardPageLoad()) {
    initialNavigationHandled = true;
    clearAppPreviewMode();
    return false;
  }

  initialNavigationHandled = true;
  return hasStickyAppPreview();
}

export function isAppMode() {
  if (isCapacitorApp()) return true;
  return detectAppMode();
}

export { isCapacitorApp } from '../lib/runtimePlatform';

export function useAppMode() {
  const location = useLocation();

  const isApp = useMemo(
    () => detectAppMode(location.search),
    [location.search, location.pathname],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('app') === '1') {
      persistAppPreviewMode(true);
    } else if (params.get('app') === '0') {
      clearAppPreviewMode();
    }

    document.documentElement.dataset.platform = isCapacitorApp()
      ? 'capacitor'
      : isApp
        ? 'app-preview'
        : 'website';
    document.documentElement.dataset.appMode = isApp ? 'true' : 'false';
  }, [location.search, isApp]);

  return { isApp, isCapacitor: isCapacitorApp(), isWebsite: !isApp };
}
