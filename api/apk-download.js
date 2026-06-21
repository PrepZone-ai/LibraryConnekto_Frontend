/**
 * Redirect APK downloads to the latest GitHub release asset.
 * Used when the static /LibraryConnekto.apk file is not yet bundled on Vercel.
 */
const REPO = process.env.GITHUB_REPOSITORY || 'PrepZone-ai/LibraryConnekto_Frontend';
const APK_ASSET = 'LibraryConnekto.apk';

export default function handler(_request, response) {
  const downloadUrl = `https://github.com/${REPO}/releases/latest/download/${APK_ASSET}`;

  response.setHeader('Cache-Control', 'public, max-age=300');
  response.setHeader(
    'Content-Disposition',
    `attachment; filename="${APK_ASSET}"`,
  );
  response.redirect(302, downloadUrl);
}
