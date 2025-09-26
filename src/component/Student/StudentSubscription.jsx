import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const StudentSubscription = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (userType !== 'student') {
      navigate('/student/login');
      return;
    }
    fetchSubscriptionData();
  }, [userType, navigate]);

  const fetchSubscriptionData = async () => {
    try {
      const [profileResponse, plansResponse] = await Promise.all([
        apiClient.get('/student/profile'),
        apiClient.get('/subscription/plans')
      ]);
      
      setCurrentSubscription(profileResponse);
      setSubscriptionPlans(plansResponse);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    try {
      // Here you would integrate with your payment gateway (Razorpay, Stripe, etc.)
      // For now, we'll simulate a successful payment
      const paymentData = {
        plan_id: selectedPlan.id,
        amount: selectedPlan.price,
        student_id: currentSubscription.id
      };

      const response = await apiClient.post('/subscription/purchase', paymentData);
      
      if (response.success) {
        alert('Subscription renewed successfully!');
        setShowPaymentModal(false);
        fetchSubscriptionData(); // Refresh data
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const getDaysLeft = () => {
    if (!currentSubscription?.subscription_end) return 0;
    const today = new Date();
    const expiryDate = new Date(currentSubscription.subscription_end);
    return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  };

  const isUrgent = getDaysLeft() <= 5 && getDaysLeft() > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Subscription Status */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">📚 Subscription Management</h1>
          
          {currentSubscription && (
            <div className={`bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6 ${
              isUrgent ? 'border-red-500/50 bg-red-900/20' : ''
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Current Subscription</h2>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentSubscription.subscription_status === 'Active' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {currentSubscription.subscription_status}
                    </span>
                    <span className="text-slate-300">
                      Library: {currentSubscription.library_name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isUrgent ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                    {getDaysLeft() > 0 ? (
                      <>
                        {getDaysLeft()} day{getDaysLeft() !== 1 ? 's' : ''} left
                        {isUrgent && <span className="ml-2">⚠️</span>}
                      </>
                    ) : getDaysLeft() === 0 ? (
                      'Expires today'
                    ) : (
                      `Expired ${Math.abs(getDaysLeft())} day${Math.abs(getDaysLeft()) !== 1 ? 's' : ''} ago`
                    )}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Expires: {new Date(currentSubscription.subscription_end).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Available Subscription Plans</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6 hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.plan_name}</h3>
                  <div className="text-3xl font-bold text-indigo-400 mb-2">₹{plan.price}</div>
                  <div className="text-slate-400 text-sm">per month</div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features && plan.features.split(',').map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-300">
                        <span className="text-emerald-400 mr-2">✓</span>
                        {feature.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => handlePlanSelection(plan)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold"
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-white mb-6">Confirm Subscription</h3>
              
              <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-2">{selectedPlan.plan_name}</h4>
                <div className="text-2xl font-bold text-indigo-400">₹{selectedPlan.price}/month</div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-semibold"
                >
                  💳 Pay Now
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full bg-slate-600 text-white py-3 px-6 rounded-xl hover:bg-slate-700 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StudentSubscription;
