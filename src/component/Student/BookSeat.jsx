import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import PaymentService from '../../services/paymentService';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const BookSeat = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [libraries, setLibraries] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    start_time: '',
    end_time: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (userType !== 'student') {
      navigate('/student/login');
      return;
    }
    fetchLibraries();
  }, [userType, navigate]);

  const fetchLibraries = async () => {
    try {
      const response = await apiClient.get('/booking/libraries');
      setLibraries(response);
    } catch (error) {
      console.error('Error fetching libraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSeats = async (libraryId, date) => {
    try {
      const response = await apiClient.get(`/booking/libraries/${libraryId}/seats?date=${date}`);
      setAvailableSeats(response);
    } catch (error) {
      console.error('Error fetching available seats:', error);
    }
  };

  const fetchSubscriptionPlans = async (libraryId) => {
    try {
      const response = await apiClient.get(`/booking/libraries/${libraryId}/subscription-plans`);
      setSubscriptionPlans(response);
      
      // Set default subscription plan if available
      if (response.length > 0) {
        const defaultPlan = response.find(plan => plan.months === 1) || response[0];
        setSelectedPlan(defaultPlan);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      setSubscriptionPlans([]);
      setSelectedPlan(null);
    }
  };

  const handleLibrarySelect = (library) => {
    setSelectedLibrary(library);
    setSelectedSeat(null);
    setAvailableSeats([]);
    setSelectedPlan(null);
    fetchSubscriptionPlans(library.id);
  };

  const handleDateChange = (date) => {
    setBookingDetails({...bookingDetails, date});
    if (selectedLibrary && date) {
      fetchAvailableSeats(selectedLibrary.id, date);
    }
  };

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeat || !selectedPlan || !bookingDetails.date || !bookingDetails.start_time || !bookingDetails.end_time) {
      alert('Please fill in all required fields and select a subscription plan');
      return;
    }

    setBookingLoading(true);
    try {
      // 1) Initiate Rs.1 token order
      const order = await PaymentService.initBookingTokenPayment({
        library_id: selectedLibrary.id,
        subscription_plan_id: selectedPlan.id,
        seat_id: selectedSeat.id
      });

      // 2) Open Razorpay to pay Rs.1
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
              // 3) Verify and create pending booking
              await PaymentService.verifyBookingTokenPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                library_id: selectedLibrary.id,
                subscription_plan_id: selectedPlan.id,
                seat_id: selectedSeat.id,
                date: bookingDetails.date,
                start_time: bookingDetails.start_time,
                end_time: bookingDetails.end_time,
                purpose: bookingDetails.purpose,
                amount: parseFloat(selectedPlan.discounted_amount || selectedPlan.amount)
              });
              alert('Token paid. Booking submitted for admin approval.');
              navigate('/student/dashboard');
              resolve();
            } catch (e2) {
              reject(e2);
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
        });
        rzp.open();
      });
    } catch (error) {
      console.error('Error booking seat:', error);
      alert(error.message || 'Failed to book seat. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const LibraryCard = ({ library }) => (
    <div 
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
        selectedLibrary?.id === library.id 
          ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50' 
          : 'border-slate-200 hover:border-indigo-300 bg-white/80 backdrop-blur-sm'
      }`}
      onClick={() => handleLibrarySelect(library)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">{library.name}</h3>
          <p className="text-slate-600 mb-2">{library.address}</p>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span className="flex items-center">📞 {library.phone}</span>
            <span className="flex items-center">📧 {library.email}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{library.total_seats}</div>
          <div className="text-sm text-slate-500 font-medium">Total Seats</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full font-medium">
            {library.available_seats} Available
          </span>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium">
            {library.occupied_seats} Occupied
          </span>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Open: {library.opening_time} - {library.closing_time}
        </div>
      </div>
    </div>
  );

  const SeatCard = ({ seat }) => (
    <div 
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg ${
        selectedSeat?.id === seat.id 
          ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50' 
          : seat.is_available 
            ? 'border-emerald-200 hover:border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50' 
            : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 cursor-not-allowed opacity-50'
      }`}
      onClick={() => seat.is_available && handleSeatSelect(seat)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-lg">Seat {seat.seat_number}</h4>
          <p className="text-sm text-slate-600 font-medium">{seat.area}</p>
        </div>
        <div className="text-right">
          <div className={`w-4 h-4 rounded-full shadow-sm ${
            seat.is_available ? 'bg-emerald-500' : 'bg-red-500'
          }`}></div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {seat.is_available ? 'Available' : 'Occupied'}
          </div>
        </div>
      </div>
      {seat.features && seat.features.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {seat.features.map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
              {feature}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Book a Study Seat 🪑
            </h1>
            <p className="text-slate-600 text-lg">Find and reserve your perfect study space</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Library Selection */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Select Library
              </h2>
              <p className="text-slate-600">Choose from available libraries</p>
            </div>
            <div className="space-y-4">
              {libraries.map((library) => (
                <LibraryCard key={library.id} library={library} />
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            {selectedLibrary ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Book at {selectedLibrary.name}
                </h2>
                
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Select Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDetails.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Start Time
                      </label>
                      <input
                        type="time"
                        required
                        value={bookingDetails.start_time}
                        onChange={(e) => setBookingDetails({...bookingDetails, start_time: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        End Time
                      </label>
                      <input
                        type="time"
                        required
                        value={bookingDetails.end_time}
                        onChange={(e) => setBookingDetails({...bookingDetails, end_time: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Purpose (Optional)
                    </label>
                    <textarea
                      value={bookingDetails.purpose}
                      onChange={(e) => setBookingDetails({...bookingDetails, purpose: e.target.value})}
                      placeholder="e.g., Exam preparation, group study, research..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 shadow-sm"
                      rows="3"
                    />
                  </div>

                  {/* Subscription Plan Selection */}
                  {subscriptionPlans.length > 0 ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subscription Plan *
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {subscriptionPlans.map((plan) => {
                          const amount = parseFloat(plan.discounted_amount || plan.amount);
                          const originalAmount = parseFloat(plan.amount);
                          const hasDiscount = plan.discounted_amount && plan.discounted_amount < plan.amount;
                          const isSelected = selectedPlan?.id === plan.id;
                          
                          return (
                            <div
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan)}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {plan.months} {plan.months === 1 ? 'Month' : 'Months'}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {plan.is_custom ? 'Custom Plan' : 'Standard Plan'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-blue-600">
                                    ₹{amount}
                                  </div>
                                  {hasDiscount && (
                                    <div className="text-sm text-gray-500 line-through">
                                      ₹{originalAmount}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {hasDiscount && (
                                <div className="mt-2">
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Save ₹{originalAmount - amount}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : selectedLibrary ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-yellow-800 font-medium">
                          No subscription plans available for this library
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {bookingDetails.date && availableSeats.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Seat
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {availableSeats.map((seat) => (
                          <SeatCard key={seat.id} seat={seat} />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSeat && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900">Selected Seat</h4>
                      <p className="text-blue-700">
                        Seat {selectedSeat.seat_number} in {selectedSeat.area}
                      </p>
                    </div>
                  )}

                  {/* Booking Summary */}
                  {selectedPlan && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Library:</span>
                          <span className="font-medium">{selectedLibrary.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subscription:</span>
                          <span className="font-medium">
                            {selectedPlan.months} {selectedPlan.months === 1 ? 'Month' : 'Months'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-bold text-lg text-blue-600">
                            ₹{parseFloat(selectedPlan.discounted_amount || selectedPlan.amount)}
                          </span>
                        </div>
                        {selectedPlan.discounted_amount && selectedPlan.discounted_amount < selectedPlan.amount && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Original Price:</span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{parseFloat(selectedPlan.amount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedSeat || !selectedPlan || bookingLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
                  >
                    {bookingLoading ? 'Booking...' : 'Book Seat'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <div className="text-slate-400 text-8xl mb-6">🪑</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Select a Library</h3>
                <p className="text-slate-600 text-lg">Choose a library from the left to start booking your seat</p>
              </div>
            )}
          </div>
        </div>

        {/* My Bookings */}
        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Bookings
              </h2>
              <button
                onClick={() => navigate('/student/my-bookings')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
              >
                View All
              </button>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <p className="text-slate-500 text-center text-lg">No recent bookings found</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookSeat;
