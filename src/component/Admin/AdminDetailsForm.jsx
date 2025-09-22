import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const AdminDetailsForm = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    admin_name: '',
    library_name: '',
    mobile_no: '',
    address: '',
    total_seats: '',
    latitude: '',
    longitude: '',
    has_shift_system: false,
    shift_timings: [
      { start: '09:00', end: '13:00', name: 'Morning Shift' },
      { start: '14:00', end: '18:00', name: 'Evening Shift' },
      { start: '19:00', end: '23:00', name: 'Night Shift' }
    ],
    referral_code: ''
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    
    // Load existing admin details if available
    loadAdminDetails();
    
    // Automatically detect current location
    detectCurrentLocation();
  }, [userType, navigate]);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access to automatically detect your coordinates.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const loadAdminDetails = async () => {
    try {
      const response = await apiClient.get('/admin/details');
      if (response) {
        setFormData({
          admin_name: response.admin_name || '',
          library_name: response.library_name || '',
          mobile_no: response.mobile_no || '',
          address: response.address || '',
          total_seats: response.total_seats || '',
          latitude: response.latitude || '',
          longitude: response.longitude || '',
          has_shift_system: response.has_shift_system || false,
          shift_timings: response.shift_timings ? 
            (Array.isArray(response.shift_timings) ? 
              response.shift_timings.map((timing, index) => ({
                start: timing.split(' - ')[0] || '09:00',
                end: timing.split(' - ')[1] || '13:00',
                name: `Shift ${index + 1}`
              })) : 
              [
                { start: '09:00', end: '13:00', name: 'Morning Shift' },
                { start: '14:00', end: '18:00', name: 'Evening Shift' },
                { start: '19:00', end: '23:00', name: 'Night Shift' }
              ]
            ) : [
              { start: '09:00', end: '13:00', name: 'Morning Shift' },
              { start: '14:00', end: '18:00', name: 'Evening Shift' },
              { start: '19:00', end: '23:00', name: 'Night Shift' }
            ],
          referral_code: response.referral_code || ''
        });
      }
    } catch (error) {
      console.error('Error loading admin details:', error);
      if ((error?.message || '').toLowerCase().includes('not authenticated')) {
        navigate('/admin/auth');
        return;
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleShiftTimingChange = (index, field, value) => {
    const newShiftTimings = [...formData.shift_timings];
    newShiftTimings[index] = {
      ...newShiftTimings[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      shift_timings: newShiftTimings
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.admin_name.trim() || !formData.library_name.trim() || 
          !formData.mobile_no.trim() || !formData.address.trim() || 
          !formData.total_seats || formData.total_seats <= 0 ||
          !formData.latitude || !formData.longitude) {
        setError('Please fill in all required fields including location coordinates');
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        admin_name: formData.admin_name.trim(),
        library_name: formData.library_name.trim(),
        mobile_no: formData.mobile_no.trim(),
        address: formData.address.trim(),
        total_seats: parseInt(formData.total_seats),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        has_shift_system: formData.has_shift_system,
        shift_timings: formData.has_shift_system ? 
          formData.shift_timings
            .filter(timing => timing.start && timing.end)
            .map(timing => `${timing.start} - ${timing.end}`) : null,
        referral_code: formData.referral_code.trim() || null
      };

      // Submit admin details
      await apiClient.put('/admin/details', submitData);
      
      setSuccess('Admin details saved successfully!');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Error saving admin details:', error);
      setError(error.message || 'Failed to save admin details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 overflow-hidden shadow-lg shadow-purple-500/25">
              <img 
                src={new URL('../../assets/Logo.png', import.meta.url).href} 
                alt="Library Connekto Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Complete Your Admin Profile
            </h1>
            <p className="text-xl text-center text-white/70">
              Please provide your library details to get started
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
              <p className="text-red-200 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl backdrop-blur-sm">
              <p className="text-green-200 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </p>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h2 className="text-2xl font-semibold text-white">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Name */}
                <div className="space-y-2">
                  <label htmlFor="admin_name" className="block text-sm font-medium text-white/90">
                    Admin Name *
                  </label>
                  <input
                    type="text"
                    id="admin_name"
                    name="admin_name"
                    value={formData.admin_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Library Name */}
                <div className="space-y-2">
                  <label htmlFor="library_name" className="block text-sm font-medium text-white/90">
                    Library Name *
                  </label>
                  <input
                    type="text"
                    id="library_name"
                    name="library_name"
                    value={formData.library_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                    placeholder="Enter library name"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label htmlFor="mobile_no" className="block text-sm font-medium text-white/90">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobile_no"
                    name="mobile_no"
                    value={formData.mobile_no}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>

                {/* Total Seats */}
                <div className="space-y-2">
                  <label htmlFor="total_seats" className="block text-sm font-medium text-white/90">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    id="total_seats"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                    placeholder="Enter total number of seats"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h2 className="text-2xl font-semibold text-white">Library Address</h2>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-white/90">
                  Library Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 transition-all duration-200 resize-none"
                  placeholder="Enter complete library address"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Library Location</h2>
                </div>
                <button
                  type="button"
                  onClick={detectCurrentLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                >
                  {locationLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Detecting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2">📍</span>
                      Detect Current Location
                    </div>
                  )}
                </button>
              </div>
              
              {locationError && (
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl backdrop-blur-sm">
                  <p className="text-yellow-200 text-sm flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {locationError}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="latitude" className="block text-sm font-medium text-white/90">
                    Latitude
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="any"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                    placeholder="e.g., 28.6139"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="longitude" className="block text-sm font-medium text-white/90">
                    Longitude
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="any"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                    placeholder="e.g., 77.2090"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-200 text-sm flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Location coordinates are automatically detected from your current position. 
                  You can also manually enter the coordinates if needed.
                </p>
              </div>
            </div>

            {/* Shift System Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <h2 className="text-2xl font-semibold text-white">Shift System</h2>
              </div>
              
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_shift_system"
                    checked={formData.has_shift_system}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-white font-medium">Enable shift system for seat booking</span>
                    <p className="text-white/60 text-sm mt-1">
                      Allow students to book seats for specific time shifts
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Shift Timings */}
            {formData.has_shift_system && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Shift Timings</h3>
                <div className="space-y-4">
                  {formData.shift_timings.map((timing, index) => (
                    <div key={index} className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium text-lg">{timing.name}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const newShiftTimings = formData.shift_timings.filter((_, i) => i !== index);
                            setFormData(prev => ({
                              ...prev,
                              shift_timings: newShiftTimings
                            }));
                          }}
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm text-white/70">Start Time</label>
                          <input
                            type="time"
                            value={timing.start}
                            onChange={(e) => handleShiftTimingChange(index, 'start', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all duration-200"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm text-white/70">End Time</label>
                          <input
                            type="time"
                            value={timing.end}
                            onChange={(e) => handleShiftTimingChange(index, 'end', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newShift = {
                        start: '09:00',
                        end: '17:00',
                        name: `Shift ${formData.shift_timings.length + 1}`
                      };
                      setFormData(prev => ({
                        ...prev,
                        shift_timings: [...prev.shift_timings, newShift]
                      }));
                    }}
                    className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-all duration-200 hover:bg-white/5"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Another Shift
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Referral Code Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                <h2 className="text-2xl font-semibold text-white">Referral Code</h2>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="referral_code" className="block text-sm font-medium text-white/90">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  id="referral_code"
                  name="referral_code"
                  value={formData.referral_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                  placeholder="Enter referral code if any"
                />
                <p className="text-white/50 text-sm">
                  If you were referred by someone, enter their referral code here
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save & Continue to Dashboard
                  </div>
                )}
              </button>
            </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDetailsForm;
