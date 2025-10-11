import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import PaymentService from '../../services/paymentService';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const PaymentConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setError('Invalid booking ID');
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      // Use anonymous API call since this is for anonymous bookings
      const response = await apiClient.getAnonymous(`/booking/booking-details/${bookingId}`);
      setBooking(response);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details. Please check if the booking ID is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    try {
      setPaymentLoading(true);
      setError('');

      // Create Razorpay order for the booking
      const orderData = {
        booking_id: bookingId,
        amount: booking.amount * 100, // Convert to paise
        currency: 'INR'
      };

       const order = await apiClient.postAnonymous('/booking/create-razorpay-order', orderData);

      // Initialize Razorpay
      const Razorpay = await PaymentService.initializePaymentGateway();

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured. Please check environment variables.');
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'Library Connekto',
        description: `Seat Booking Payment - ${booking.library_name || 'Library'}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verificationData = {
              booking_id: bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

             const verificationResponse = await apiClient.postAnonymous('/booking/verify-razorpay-payment', verificationData);
            
            if (verificationResponse) {
              // Payment successful - redirect to success page or show success message
              navigate('/payment/success', { 
                state: { 
                  booking: verificationResponse,
                  message: 'Payment successful! Your seat has been confirmed and login credentials have been sent to your email.'
                }
              });
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: booking.name,
          email: booking.email,
          contact: booking.mobile
        },
        theme: {
          color: '#9333ea'
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          }
        }
      };

      const razorpay = new Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initialization failed:', error);
      let errorMessage = 'Failed to initialize payment. Please try again.';
      
      if (error.message.includes('Razorpay key not configured')) {
        errorMessage = 'Payment system is not configured. Please contact support.';
      } else if (error.message.includes('receipt')) {
        errorMessage = 'Payment system error. Please try again or contact support.';
      } else if (error.message.includes('Booking not found')) {
        errorMessage = 'Booking not found. Please check your booking ID.';
      }
      
      setError(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative z-10">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative z-10">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10">
        <Header />
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Confirm Your Seat & Complete Payment
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Your seat booking request has been approved! Complete your payment to secure your seat and activate your subscription.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Details Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Booking Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Library</span>
                  <span className="text-white font-semibold">{booking?.library_name || 'Library'}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Student Name</span>
                  <span className="text-white font-semibold">{booking?.name}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Email</span>
                  <span className="text-white font-semibold">{booking?.email}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Mobile</span>
                  <span className="text-white font-semibold">{booking?.mobile}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Subscription Duration</span>
                  <span className="text-white font-semibold">{booking?.subscription_months} month{booking?.subscription_months > 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Estimated Seat Number</span>
                  <span className="text-purple-300 font-semibold bg-purple-900/30 px-3 py-1 rounded-full">
                    {booking?.seat_number || `SEAT-${bookingId?.slice(-6).toUpperCase()}`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-300 font-medium">Status</span>
                  <span className="text-green-400 font-semibold bg-green-900/30 px-3 py-1 rounded-full">
                    ✅ Approved
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Complete Payment
              </h2>

              {/* Amount Display */}
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 mb-6 border border-purple-700/50">
                <div className="text-center">
                  <p className="text-slate-300 text-lg mb-2">Amount to Pay</p>
                  <p className="text-4xl font-bold text-purple-400 mb-2">₹{booking?.amount}</p>
                  <p className="text-slate-400 text-sm">Secure payment powered by Razorpay</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700/30 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-purple-600 border-slate-600 focus:ring-purple-500"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="text-2xl mr-3">💳</span>
                      <div>
                        <p className="font-medium text-white">Razorpay</p>
                        <p className="text-sm text-slate-300">Credit/Debit Cards, UPI, Net Banking</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {paymentLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ₹{booking?.amount} Now
                  </div>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-blue-300 font-medium text-sm mb-1">Secure Payment</p>
                    <p className="text-blue-200 text-xs">
                      Your payment is secured with 256-bit SSL encryption. After successful payment, 
                      you'll receive login credentials via email to access your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8 bg-amber-900/30 border border-amber-700/50 rounded-xl p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-amber-300 font-semibold mb-2">Important Notice</h3>
                <ul className="text-amber-200 text-sm space-y-1">
                  <li>• Your seat will be reserved for 48 hours pending payment confirmation</li>
                  <li>• After successful payment, your subscription will start immediately</li>
                  <li>• You'll receive login credentials via email to access your account</li>
                  <li>• Please complete the payment soon to secure your booking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentConfirmation;
