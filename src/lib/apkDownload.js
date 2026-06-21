/** Stable GitHub Releases URL — /latest/ always resolves to the newest release asset. */
export const DEFAULT_APK_DOWNLOAD_URL =
  'https://github.com/PrepZone-ai/LibraryConnekto_Frontend/releases/latest/download/LibraryConnekto.apk';

export const APK_DOWNLOAD_URL =
  import.meta.env.VITE_APK_DOWNLOAD_URL?.trim() || DEFAULT_APK_DOWNLOAD_URL;

export function isExternalApkUrl(url = APK_DOWNLOAD_URL) {
  return /^https?:\/\//i.test(url);
}

export function triggerApkDownload() {
  const url = APK_DOWNLOAD_URL;

  if (isExternalApkUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = 'LibraryConnekto.apk';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
