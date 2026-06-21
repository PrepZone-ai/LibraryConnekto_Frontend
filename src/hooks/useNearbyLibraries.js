import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { fetchPublicLibraries } from '../lib/libraries';

export default function useNearbyLibraries(limit = 6) {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const fetchLibraries = useCallback(async (location) => {
    try {
      setLoading(true);
      const response = await fetchPublicLibraries(apiClient, location);
      setLibraries(response.slice(0, limit));
    } catch (error) {
      console.error('Error fetching libraries:', error);
      setLibraries([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refetch = useCallback(() => {
    fetchLibraries(userLocation);
  }, [fetchLibraries, userLocation]);

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
        setUserLocation(null);
        fetchLibraries(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, [fetchLibraries]);

  return { libraries, loading, userLocation, refetch };
}
