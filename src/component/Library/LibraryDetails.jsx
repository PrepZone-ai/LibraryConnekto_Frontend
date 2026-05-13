import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';

const LibraryDetails = () => {
  const { libraryId } = useParams();
  const navigate = useNavigate();
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  useEffect(() => {
    fetchLibraryDetails();
  }, [libraryId]);
  
  const fetchLibraryDetails = async () => {
    try {
      setLoading(true);
      
      // Get user's location for distance calculation
      let userLocation = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            });
          });
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (err) {
          console.log('Location access denied or unavailable');
        }
      }
      
      // Fetch libraries with location
      let url = '/booking/libraries';
      if (userLocation) {
        url += `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
      }
      
      const libraries = await apiClient.getAnonymous(url);
      const foundLibrary = libraries.find(lib => lib.id === libraryId);
      
      if (foundLibrary) {
        setLibrary(foundLibrary);
      } else {
        setError('Library not found');
      }
    } catch (error) {
      console.error('Error fetching library details:', error);
      setError('Failed to load library details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBookRequest = () => {
    // Scroll to the book seat section on home page
    navigate('/#book-seat');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
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
  const occupancyPercentage = (library.occupied_seats / library.total_seats) * 100;
  
  // Prepare images array
  const images = library.facility_images && library.facility_images.length > 0
    ? library.facility_images.map(img => `${import.meta.env.VITE_API_URL}${img}`)
    : [new URL('../../assets/Lib.jpeg', import.meta.url).href];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden border-2 border-slate-700/50">
              <img
                src={images[selectedImageIndex]}
                alt={`${library.library_name} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors duration-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>
            
            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'border-purple-500 scale-105'
                        : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Library Information Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-black text-white mb-2">
                  {library.library_name}
                </h1>
                {library.distance !== null && library.distance !== undefined && (
                  <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm text-blue-300 text-sm font-bold rounded-full flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {library.distance.toFixed(1)} km away
                  </div>
                )}
              </div>
              
              {/* Address */}
              <p className="text-slate-300 flex items-start gap-2 mb-4">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{library.address}</span>
              </p>
            </div>
            
            {/* Seat Availability Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Seat Availability</h3>
                {availableSeats > 0 ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Available
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    Fully Booked
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-slate-300">Total Seats</span>
                  <span className="text-white font-bold">{library.total_seats}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-slate-300">Available Seats</span>
                  <span className="text-green-400 font-bold">{availableSeats}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-slate-300">Occupied Seats</span>
                  <span className="text-purple-400 font-bold">{library.occupied_seats}</span>
                </div>
                
                {/* Occupancy Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                    <span>Occupancy</span>
                    <span className="font-bold">{occupancyPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        occupancyPercentage > 80
                          ? 'bg-red-500'
                          : occupancyPercentage > 50
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shift System Info */}
            {library.has_shift_system && library.shift_timings && library.shift_timings.length > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Shift Timings
                </h3>
                <div className="space-y-2">
                  {library.shift_timings.map((timing, index) => (
                    <div key={index} className="flex items-center gap-2 text-purple-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{timing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Book Request Button */}
            <button
              onClick={handleBookRequest}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book a Seat Now
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Facilities Description Section */}
        {library.facility_description && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
              <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              About Our Facilities
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-line">
              {library.facility_description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryDetails;
