/** Same-origin APK path — bundled on Vercel after the Android CI workflow publishes a release. */
export const DEFAULT_APK_DOWNLOAD_URL = '/LibraryConnekto.apk';

/** Fallback when the static APK has not been deployed yet. */
export const APK_DOWNLOAD_FALLBACK_URL = '/api/apk-download';

export const APK_FILENAME = 'LibraryConnekto.apk';

export const APK_DOWNLOAD_URL =
  import.meta.env.VITE_APK_DOWNLOAD_URL?.trim() || DEFAULT_APK_DOWNLOAD_URL;

export function isExternalApkUrl(url = APK_DOWNLOAD_URL) {
  return /^https?:\/\//i.test(url);
}

function downloadViaAnchor(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function downloadViaFetch(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    downloadViaAnchor(objectUrl, filename);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function isDownloadAvailable(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/** Start an APK download in-place without opening a new browser tab. */
export async function triggerApkDownload() {
  let url = APK_DOWNLOAD_URL;

  if (!isExternalApkUrl(url)) {
    const staticAvailable = await isDownloadAvailable(url);
    if (!staticAvailable && url !== APK_DOWNLOAD_FALLBACK_URL) {
      url = APK_DOWNLOAD_FALLBACK_URL;
    }

    downloadViaAnchor(url, APK_FILENAME);
    return;
  }

  try {
    await downloadViaFetch(url, APK_FILENAME);
  } catch (error) {
    console.warn('Fetch download failed, falling back to direct link:', error);
    downloadViaAnchor(url, APK_FILENAME);
  }
}
