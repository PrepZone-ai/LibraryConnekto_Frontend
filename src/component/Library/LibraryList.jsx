import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import LibraryCard from './LibraryCard';

const LibraryList = () => {
  const navigate = useNavigate();
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortMode, setSortMode] = useState('distance');

  useEffect(() => {
    if (!navigator.geolocation) {
      fetchLibraries(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        fetchLibraries(location);
      },
      () => {
        fetchLibraries(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  const fetchLibraries = async (location) => {
    try {
      setLoading(true);
      setError('');
      let url = '/booking/libraries';

      if (location) {
        url += `?latitude=${location.latitude}&longitude=${location.longitude}&radius=100`;
      }

      const response = await apiClient.getAnonymous(url);
      setLibraries(response);
    } catch (err) {
      console.error('Error fetching libraries:', err);
      setError('Failed to load libraries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLibraries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let filtered = libraries;

    if (normalizedQuery) {
      filtered = filtered.filter((library) => {
        const name = library.library_name?.toLowerCase() || '';
        const address = library.address?.toLowerCase() || '';
        return name.includes(normalizedQuery) || address.includes(normalizedQuery);
      });
    }

    if (sortMode === 'name') {
      return [...filtered].sort((a, b) => {
        return (a.library_name || '').localeCompare(b.library_name || '');
      });
    }

    if (sortMode === 'availability') {
      return [...filtered].sort((a, b) => {
        const aAvailable = (a.total_seats || 0) - (a.occupied_seats || 0);
        const bAvailable = (b.total_seats || 0) - (b.occupied_seats || 0);
        return bAvailable - aAvailable;
      });
    }

    return [...filtered].sort((a, b) => {
      const aDistance = a.distance ?? Number.POSITIVE_INFINITY;
      const bDistance = b.distance ?? Number.POSITIVE_INFINITY;
      return aDistance - bDistance;
    });
  }, [libraries, query, sortMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800 py-14 font-library-body">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 backdrop-blur-sm ring-1 ring-purple-400/30 px-3 py-1 text-xs font-semibold text-purple-200 mb-3 shadow-lg shadow-purple-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>All Libraries</span>
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2 font-library-display">
            Explore Study Spaces
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl mx-auto">
            {userLocation
              ? 'Libraries near you, sorted by distance.'
              : 'Browse registered libraries and find the perfect study environment.'}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-2 uppercase tracking-[0.12em]">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by library name or address"
                  className="w-full rounded-xl bg-slate-800/70 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-2 uppercase tracking-[0.12em]">Sort</label>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value)}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
              >
                <option value="distance">Distance</option>
                <option value="availability">Seats available</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading libraries...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-300">{error}</p>
          </div>
        ) : filteredLibraries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLibraries.map((library) => (
              <LibraryCard key={library.id} library={library} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Libraries Found</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Try adjusting your search or check back later for new libraries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryList;
