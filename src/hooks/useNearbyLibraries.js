import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { fetchPublicLibraries, withDistance } from '../lib/libraries';

function sortByDistance(libraries, location) {
  if (!location) return libraries;
  return [...libraries]
    .map((lib) => withDistance(lib, location))
    .sort((a, b) => {
      const distA = a.distance ?? Number.POSITIVE_INFINITY;
      const distB = b.distance ?? Number.POSITIVE_INFINITY;
      return distA - distB;
    });
}

export default function useNearbyLibraries(limit = 6) {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [usingFallbackList, setUsingFallbackList] = useState(false);

  const fetchLibraries = useCallback(async (location) => {
    try {
      setLoading(true);
      let response = await fetchPublicLibraries(apiClient, location);

      // If location-based search returns nothing, show all available libraries.
      if (response.length === 0) {
        response = await fetchPublicLibraries(apiClient, null);
        setUsingFallbackList(true);
      } else {
        setUsingFallbackList(false);
      }

      const sorted = sortByDistance(response, location);
      setLibraries(sorted.slice(0, limit));
    } catch (error) {
      console.error('Error fetching libraries:', error);
      setLibraries([]);
      setUsingFallbackList(false);
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

  return { libraries, loading, userLocation, usingFallbackList, refetch };
}
