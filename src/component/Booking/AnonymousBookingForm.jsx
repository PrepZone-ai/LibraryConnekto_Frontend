import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import PaymentService from '../../services/paymentService';

/**
 * AnonymousBookingForm Component
 * 
 * Allows users to book library seats without creating an account.
 * Features:
 * - Location-based library sorting (nearest first)
 * - Two view modes: dropdown and list view
 * - Real-time seat availability
 * - Distance calculation and display
 * - Responsive design with loading states
 */
const AnonymousBookingForm = () => {
  const [libraries, setLibraries] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState('');
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [viewMode, setViewMode] = useState('dropdown'); // 'dropdown' or 'list'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    subscription_months: 1,
    amount: 0,
    purpose: ''
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation || locationPermission === 'denied') {
      fetchLibraries();
    }
  }, [userLocation, locationPermission]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationPermission('granted');
      },
      (error) => {
        console.log('Location access denied:', error);
        setLocationPermission('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      let url = '/booking/libraries';
      
      // Add location parameters if available
      if (userLocation) {
        url += `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&radius=100`;
      }
      
      // Use anonymous API call (no authentication required)
      const response = await apiClient.getAnonymous(url);
      setLibraries(response);
    } catch (error) {
      console.error('Error fetching libraries:', error);
      setError('Failed to load libraries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async (libraryId) => {
    try {
      const response = await apiClient.getAnonymous(`/booking/libraries/${libraryId}/subscription-plans`);
      setSubscriptionPlans(response);
      
      // Set default subscription plan if available
      if (response.length > 0) {
        const defaultPlan = response.find(plan => plan.months === 1) || response[0];
        setFormData(prev => ({
          ...prev,
          subscription_months: defaultPlan.months,
          amount: parseFloat(defaultPlan.discounted_amount || defaultPlan.amount)
        }));
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      // Clear subscription plans and reset form data
      setSubscriptionPlans([]);
      setFormData(prev => ({
        ...prev,
        subscription_months: 1,
        amount: 0
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLibrary) {
      setError('Please select a library');
      return;
    }

    if (!formData.name || !formData.email || !formData.mobile || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    if (subscriptionPlans.length === 0 || formData.amount === 0) {
      setError('Please select a valid subscription plan');
      return;
    }

    // Date/time optional for anonymous booking; admin will coordinate details

    try {
      setSubmitting(true);
      setError('');
      // 1) Initiate Rs.1 token order
      const order = await PaymentService.initAnonymousBookingTokenPayment({
        library_id: selectedLibrary,
        subscription_plan_id: null,
        seat_id: null,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile
      });

      // 2) Open Razorpay and pay Rs.1 token
      const Razorpay = await PaymentService.initializePaymentGateway();
      await new Promise((resolve, reject) => {
        const rzp = new Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Library Connekto',
          description: 'Seat booking token payment',
          order_id: order.id,
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true
          },
          upi: { flow: 'intent' },
          handler: async (response) => {
            try {
              // 3) Verify token payment and create pending booking
              await PaymentService.verifyAnonymousBookingTokenPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                library_id: selectedLibrary,
                subscription_plan_id: null,
                seat_id: null,
                purpose: formData.purpose,
                amount: formData.amount,
              
                // anonymous required fields
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                address: formData.address,
                subscription_months: formData.subscription_months
              });
              setSuccess(true);
              resolve();
            } catch (e2) {
              reject(e2);
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
        });
        rzp.open();
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        address: '',
        subscription_months: 1,
        amount: 0,
        purpose: ''
      });
      setSelectedLibrary('');
      setSubscriptionPlans([]);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.detail || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Booking Request Submitted!</h3>
        <p className="text-slate-300 mb-6">
          Thank you for your interest! Your seat booking request has been submitted successfully. 
          The library admin will review your request and contact you soon.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
        >
          Book Another Seat
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Book Your Seat</h2>
        <p className="text-slate-300 text-sm sm:text-base px-2">
          Reserve your study seat at one of our partner libraries. No account required!
        </p>
        {locationPermission === 'prompt' && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-300 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Getting your location to show nearest libraries...
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Library Selection */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <label className="block text-sm font-medium text-slate-300">
              Select Library *
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {locationPermission === 'denied' && (
                <button
                  type="button"
                  onClick={getUserLocation}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Enable location
                </button>
              )}
              {libraries.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'dropdown' ? 'list' : 'dropdown')}
                  className="text-xs text-slate-400 hover:text-slate-300 underline"
                >
                  {viewMode === 'dropdown' ? 'List view' : 'Dropdown view'}
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="p-4 bg-slate-700/50 rounded-xl text-center">
              <p className="text-slate-400">
                {locationPermission === 'prompt' ? 'Getting your location...' : 'Loading libraries...'}
              </p>
            </div>
          ) : viewMode === 'dropdown' ? (
            <div className="relative">
              <select
                value={selectedLibrary}
                onChange={(e) => {
                  setSelectedLibrary(e.target.value);
                  if (e.target.value) {
                    fetchSubscriptionPlans(e.target.value);
                  } else {
                    setSubscriptionPlans([]);
                    setFormData(prev => ({
                      ...prev,
                      subscription_months: 1,
                      amount: 0
                    }));
                  }
                }}
                className="w-full p-4 pr-10 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer"
                required
              >
                <option value="">Choose a library...</option>
                {libraries.map((library) => {
                  const availableSeats = library.total_seats - library.occupied_seats;
                  const distanceText = library.distance ? ` (${library.distance.toFixed(1)} km away)` : '';
                  return (
                    <option key={library.id} value={library.id}>
                      {library.library_name} - {library.address}
                      {distanceText} - {availableSeats} seats available
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {libraries.map((library) => {
                const availableSeats = library.total_seats - library.occupied_seats;
                const isSelected = selectedLibrary === library.id;
                return (
                  <div
                    key={library.id}
                    onClick={() => {
                      setSelectedLibrary(library.id);
                      fetchSubscriptionPlans(library.id);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                        : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50 hover:bg-slate-700/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 truncate">{library.library_name}</h3>
                        <p className="text-sm text-slate-300 mb-2 line-clamp-2 break-words">{library.address}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                          <span className="text-green-400 flex items-center gap-1">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            {availableSeats} seats available
                          </span>
                          {library.distance && (
                            <span className="text-blue-400 flex items-center gap-1">
                              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {library.distance.toFixed(1)} km away
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-400'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {libraries.length > 0 && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <p className="text-slate-400">
                {libraries.length} {libraries.length === 1 ? 'library' : 'libraries'} found
              </p>
              {locationPermission === 'granted' && (
                <p className="text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Sorted by distance
                </p>
              )}
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 sm:p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 sm:p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {/* Purpose removed for anonymous booking */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mobile Number *
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full p-3 sm:p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base"
              placeholder="Enter 10-digit mobile number"
              pattern="^[0-9]{10}$"
              maxLength={10}
              inputMode="numeric"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subscription Duration *
            </label>
            <select
              name="subscription_months"
              value={formData.subscription_months}
              onChange={(e) => {
                const selectedMonths = parseInt(e.target.value);
                const selectedPlan = subscriptionPlans.find(plan => plan.months === selectedMonths);
                const amount = selectedPlan ? parseFloat(selectedPlan.discounted_amount || selectedPlan.amount) : 0;
                
                setFormData(prev => ({
                  ...prev,
                  subscription_months: selectedMonths,
                  amount: amount
                }));
              }}
              className="w-full p-3 sm:p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base"
              required
              disabled={!selectedLibrary || subscriptionPlans.length === 0}
            >
              {subscriptionPlans.length > 0 ? (
                subscriptionPlans.map((plan) => {
                  const amount = parseFloat(plan.discounted_amount || plan.amount);
                  const originalAmount = parseFloat(plan.amount);
                  const hasDiscount = plan.discounted_amount && plan.discounted_amount < plan.amount;
                  
                  return (
                    <option key={plan.id} value={plan.months}>
                      {plan.months} {plan.months === 1 ? 'Month' : 'Months'} - ₹{amount}
                      {hasDiscount && ` (₹${originalAmount})`}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>
                  {selectedLibrary ? 'No subscription plans available for this library' : 'Select a library first'}
                </option>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-3 sm:p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base resize-none"
            placeholder="Enter your complete address"
            required
          />
        </div>

        {/* Total Amount Display */}
        <div className="p-3 sm:p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium text-sm sm:text-base">Total Amount:</span>
            <span className="text-xl sm:text-2xl font-bold text-purple-400">
              ₹{formData.amount || 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            You will pay Rs.1 token fee now to submit your booking request. Remaining payment will be collected after admin approval.
          </p>
          {subscriptionPlans.length > 0 && (
            <p className="text-xs text-green-400 mt-1">
              ✓ Library-specific pricing applied
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {submitting ? 'Submitting...' : 'Submit Booking Request'}
        </button>
      </form>

      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-slate-400 px-2">
          By submitting this form, you agree to our terms and conditions. 
          The library admin will contact you to confirm your booking and collect payment.
        </p>
      </div>
    </div>
  );
};

export default AnonymousBookingForm;
