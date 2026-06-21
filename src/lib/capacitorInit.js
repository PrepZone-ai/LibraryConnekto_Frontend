import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function isCapacitorNative() {
  return Capacitor.isNativePlatform();
}

/** Capacitor-only setup. No-op in the website browser. */
export async function initCapacitorApp() {
  if (!Capacitor.isNativePlatform()) return;

  document.documentElement.dataset.platform = 'capacitor';
  document.documentElement.dataset.appMode = 'true';

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1a1f2b' });
  } catch {
    // Status bar plugin may be unavailable on some devices
  }
}
