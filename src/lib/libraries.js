/** Match library ids from URL params and API (UUID string casing). */
export function libraryIdMatches(a, b) {
  return String(a).toLowerCase() === String(b).toLowerCase();
}

export function findLibraryById(libraries, libraryId) {
  return libraries.find((lib) => libraryIdMatches(lib.id, libraryId));
}

/** Haversine distance in km (matches backend ordering intent). */
export function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function withDistance(library, userLocation) {
  if (
    !userLocation ||
    library.latitude == null ||
    library.longitude == null
  ) {
    return library;
  }
  return {
    ...library,
    distance: distanceKm(
      userLocation.latitude,
      userLocation.longitude,
      library.latitude,
      library.longitude,
    ),
  };
}

/**
 * Public library list. When location is set, sorts/filters by radius on the server;
 * falls back to the full list if nothing is nearby (so pages do not go empty).
 */
export async function fetchPublicLibraries(apiClient, location = null) {
  let url = '/booking/libraries';
  if (location) {
    url += `?latitude=${location.latitude}&longitude=${location.longitude}&radius=100`;
  }
  let response = await apiClient.getAnonymous(url);
  if (location && response.length === 0) {
    response = await apiClient.getAnonymous('/booking/libraries');
  }
  return response;
}

/** Load one library by id — uses full list so detail pages are not radius-filtered. */
export async function fetchPublicLibraryById(apiClient, libraryId, userLocation = null) {
  const libraries = await apiClient.getAnonymous('/booking/libraries');
  const found = findLibraryById(libraries, libraryId);
  if (!found) return null;
  return withDistance(found, userLocation);
}

export function resolveLibraryImages(library, resolveMediaUrl, fallbackHref) {
  const raw = library?.facility_images;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((img) => resolveMediaUrl(img)).filter(Boolean);
  }
  return fallbackHref ? [fallbackHref] : [];
}

export function formatInr(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
