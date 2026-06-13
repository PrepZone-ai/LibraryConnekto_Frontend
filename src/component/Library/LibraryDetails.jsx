import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, resolveMediaUrl } from '../../lib/api';
import {
  fetchPublicLibraryById,
  formatInr,
  resolveLibraryImages,
} from '../../lib/libraries';

import { ASSETS } from '../../lib/assets';

const PLACEHOLDER_IMAGE = ASSETS.lib;

function StatTile({ label, value, accent = 'text-white' }) {
  return (
    <div className="rounded-xl bg-slate-900/40 border border-slate-700/50 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}

const LibraryDetails = () => {
  const { libraryId } = useParams();
  const navigate = useNavigate();
  const [library, setLibrary] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImageIndex(0);
    fetchLibraryDetails();
  }, [libraryId]);

  const fetchLibraryDetails = async () => {
    try {
      setLoading(true);
      setError('');

      let userLocation = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000,
            });
          });
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch {
          /* distance optional */
        }
      }

      const [foundLibrary, plansResponse] = await Promise.all([
        fetchPublicLibraryById(apiClient, libraryId, userLocation),
        apiClient
          .getAnonymous(`/booking/libraries/${libraryId}/subscription-plans`)
          .catch(() => []),
      ]);

      if (foundLibrary) {
        setLibrary(foundLibrary);
        setPlans(Array.isArray(plansResponse) ? plansResponse : []);
      } else {
        setError('Library not found');
      }
    } catch (err) {
      console.error('Error fetching library details:', err);
      setError('Failed to load library details');
    } finally {
      setLoading(false);
    }
  };

  const images = useMemo(
    () =>
      library
        ? resolveLibraryImages(library, resolveMediaUrl, PLACEHOLDER_IMAGE)
        : [PLACEHOLDER_IMAGE],
    [library],
  );

  const hasOwnerPhotos =
    Array.isArray(library?.facility_images) && library.facility_images.length > 0;

  const handleBookRequest = () => {
    navigate(`/book-seat?libraryId=${encodeURIComponent(libraryId)}`, {
      state: {
        libraryId,
        libraryName: library?.library_name || '',
      },
    });
  };

  const mapsUrl = useMemo(() => {
    if (!library) return null;
    if (library.latitude != null && library.longitude != null) {
      return `https://www.google.com/maps/search/?api=1&query=${library.latitude},${library.longitude}`;
    }
    if (library.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(library.address)}`;
    }
    return null;
  }, [library]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Loading library details...</p>
        </div>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Library Not Found</h2>
          <p className="text-slate-300 mb-6">{error || 'The library you are looking for does not exist.'}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const availableSeats = library.total_seats - library.occupied_seats;
  const occupancyPercentage =
    library.total_seats > 0
      ? (library.occupied_seats / library.total_seats) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={() => navigate('/libraries')}
            className="text-sm text-purple-300 hover:text-purple-200 font-medium"
          >
            Browse all libraries
          </button>
        </div>

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {availableSeats > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 text-green-300 text-xs font-semibold ring-1 ring-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {availableSeats} seats available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-300 text-xs font-semibold ring-1 ring-red-500/30">
                Fully booked
              </span>
            )}
            {library.has_shift_system && (
              <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-200 text-xs font-semibold ring-1 ring-purple-500/30">
                Shift system
              </span>
            )}
            {library.distance != null && (
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-200 text-xs font-semibold ring-1 ring-blue-500/30">
                {library.distance.toFixed(1)} km away
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
            {library.library_name}
          </h1>
          <p className="text-slate-300 flex items-start gap-2 text-base sm:text-lg max-w-3xl">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{library.address}</span>
          </p>
          {library.mobile_no && (
            <a
              href={`tel:+91${library.mobile_no.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-2 mt-3 text-purple-300 hover:text-purple-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +91 {library.mobile_no}
            </a>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Gallery — 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-purple-900/20 bg-slate-800">
              <img
                src={images[selectedImageIndex]}
                alt={`${library.library_name} — photo ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/85 text-white rounded-full flex items-center justify-center hover:bg-slate-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/85 text-white rounded-full flex items-center justify-center hover:bg-slate-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-900/85 text-white text-sm font-medium rounded-full">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div
                className={`grid gap-2 ${
                  images.length <= 4
                    ? 'grid-cols-4'
                    : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
                }`}
              >
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-purple-500 ring-2 ring-purple-500/40 scale-[1.02]'
                        : 'border-slate-700/50 hover:border-slate-500 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {!hasOwnerPhotos && (
              <p className="text-sm text-slate-500 italic">
                The library owner has not uploaded facility photos yet.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Total seats" value={library.total_seats} />
              <StatTile label="Available" value={availableSeats} accent="text-green-400" />
              <StatTile label="Occupied" value={library.occupied_seats} accent="text-purple-300" />
              <StatTile label="Occupancy" value={`${occupancyPercentage.toFixed(0)}%`} />
            </div>

            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  occupancyPercentage > 80
                    ? 'bg-red-500'
                    : occupancyPercentage > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
              />
            </div>

            {library.has_shift_system &&
              library.shift_timings &&
              library.shift_timings.length > 0 && (
                <div className="rounded-2xl bg-purple-500/10 border border-purple-500/25 p-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Shift timings
                  </h3>
                  <ul className="space-y-2">
                    {library.shift_timings.map((timing, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-purple-100 text-sm"
                      >
                        <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {timing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <button
              type="button"
              onClick={handleBookRequest}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-3"
            >
              Book a seat
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl border border-slate-600 text-slate-200 text-center font-semibold hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Open in Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Owner description */}
        <section className="mt-12 rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
            <svg className="w-7 h-7 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            About this library
          </h2>
          {library.facility_description ? (
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {library.facility_description}
            </p>
          ) : (
            <p className="text-slate-500 italic">
              No description has been added by the library owner yet.
            </p>
          )}
        </section>

        {/* All photos grid */}
        {hasOwnerPhotos && images.length > 1 && (
          <section className="mt-10">
            <h2 className="text-2xl font-black text-white mb-6">
              All photos ({images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={`grid-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-colors group"
                >
                  <img
                    src={image}
                    alt={`${library.library_name} facility ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Subscription plans */}
        {plans.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-black text-white mb-2">Subscription plans</h2>
            <p className="text-slate-400 mb-6 text-sm">
              Pricing set by the library owner. Book a seat to choose a plan during checkout.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const price = plan.discounted_amount ?? plan.amount;
                const hasDiscount =
                  plan.discounted_amount != null &&
                  Number(plan.discounted_amount) < Number(plan.amount);
                return (
                  <div
                    key={plan.id}
                    className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 hover:border-purple-500/30 transition-colors"
                  >
                    <p className="text-white font-bold text-lg mb-1">
                      {plan.months} {plan.months === 1 ? 'month' : 'months'}
                    </p>
                    {plan.is_shift_plan && plan.shift_time && (
                      <p className="text-xs text-purple-300 mb-2">{plan.shift_time}</p>
                    )}
                    <p className="text-2xl font-black text-purple-200">{formatInr(price)}</p>
                    {hasDiscount && (
                      <p className="text-sm text-slate-500 line-through mt-1">
                        {formatInr(plan.amount)}
                      </p>
                    )}
                    {plan.is_custom && (
                      <span className="inline-block mt-2 text-xs text-slate-400">Custom plan</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center pb-8">
          <button
            type="button"
            onClick={handleBookRequest}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/30"
          >
            Book a seat at {library.library_name}
          </button>
          <button
            type="button"
            onClick={() => navigate('/libraries')}
            className="px-8 py-4 rounded-xl border border-slate-600 text-slate-200 font-semibold hover:bg-slate-800/50"
          >
            View other libraries
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryDetails;
