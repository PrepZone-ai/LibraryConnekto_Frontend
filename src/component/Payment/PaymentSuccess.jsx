import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, message } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-900/30 rounded-full mb-8">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            {message || 'Your payment has been processed successfully!'}
          </p>

          {/* Booking Summary */}
          {booking && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Booking Confirmed</h2>
              
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Library:</span>
                    <span className="font-semibold text-white">{booking.library_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Amount Paid:</span>
                    <span className="font-semibold text-green-400">₹{booking.amount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Subscription:</span>
                    <span className="font-semibold text-white">{booking.subscription_months || 1} month{(booking.subscription_months || 1) > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Seat Number:</span>
                    <span className="font-semibold text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
                      {booking.seat_number || 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Status:</span>
                    <span className="font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded">
                      ✅ Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Payment Date:</span>
                    <span className="font-semibold text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">What's Next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  1
                </div>
                <p className="text-blue-200">Check your email for login credentials (Student ID and password)</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  2
                </div>
                <p className="text-blue-200">Log in to your account using the provided credentials</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  3
                </div>
                <p className="text-blue-200">Complete your profile setup and start using the library facilities</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/student/login')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-300 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@libraryconnekto.me" className="text-purple-400 hover:underline">
                support@libraryconnekto.me
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
