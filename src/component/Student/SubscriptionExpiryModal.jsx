import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import PaymentService from '../../services/paymentService';

const SubscriptionExpiryModal = ({ isOpen, onClose, subscriptionStatus, daysLeft, libraryName }) => {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPlans();
      const resume = async () => {
        try {
          const result = await PaymentService.resumePendingPayment('subscription');
          if (result?.success) {
            alert('Payment successful! Your subscription has been renewed.');
            onClose();
            window.location.reload();
          }
        } catch (_) {
          /* pending payment not ready yet */
        }
      };
      void resume();
    }
  }, [isOpen, onClose]);

  const fetchSubscriptionPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await apiClient.get('/subscription/plans');
      setSubscriptionPlans(response);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
  };

  const handleConfirmPendingPayment = async () => {
    setConfirmingPayment(true);
    setPaymentError('');
    try {
      const result = await PaymentService.resumePendingPayment('subscription');
      if (result?.success) {
        alert('Payment successful! Your subscription has been renewed.');
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setPaymentError(err?.message || 'Could not confirm payment yet. Please try again.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      setPaymentLoading(true);
      setConfirmingPayment(true);
      setPaymentError('');

      const amountPaise = PaymentService.planAmountPaise(selectedPlan);
      const paymentData = {
        plan_id: selectedPlan.id,
        amount: amountPaise,
        plan_name: PaymentService.planDisplayName(selectedPlan),
        student_id: localStorage.getItem('studentId'),
        student_name: localStorage.getItem('studentName'),
        student_email: localStorage.getItem('studentEmail'),
        student_phone: localStorage.getItem('studentPhone'),
      };

      await PaymentService.processPayment(
        paymentData,
        () => {
          alert('Payment successful! Your subscription has been renewed.');
          onClose();
          window.location.reload();
        },
        (error) => {
          console.error('Payment failed:', error);
          const msg = error.message || 'Payment failed. Please try again.';
          setPaymentError(msg);
          if (error.message?.includes('cancelled')) {
            alert('Payment was cancelled.');
          }
        },
      );
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaymentLoading(false);
      setConfirmingPayment(false);
    }
  };

  const getModalTitle = () => {
    if (subscriptionStatus === 'Expired') {
      return '❌ Subscription Expired';
    } else if (daysLeft === 1) {
      return '⚠️ Subscription Expires Tomorrow';
    } else if (daysLeft <= 5) {
      return `⚠️ Subscription Expires in ${daysLeft} Days`;
    }
    return '📚 Subscription Reminder';
  };

  const getModalMessage = () => {
    if (subscriptionStatus === 'Expired') {
      return 'Your library subscription has expired. Please renew immediately to restore access to all library services.';
    } else if (daysLeft === 1) {
      return 'Your library subscription expires tomorrow. Renew now to avoid service interruption.';
    } else if (daysLeft <= 5) {
      return `Your library subscription expires in ${daysLeft} days. Consider renewing to continue your studies.`;
    }
    return 'Your subscription is expiring soon. Please renew to continue enjoying our services.';
  };

  const getUrgencyColor = () => {
    if (subscriptionStatus === 'Expired') {
      return 'from-red-600 to-red-700';
    } else if (daysLeft === 1) {
      return 'from-orange-600 to-red-600';
    } else if (daysLeft <= 5) {
      return 'from-amber-600 to-orange-600';
    }
    return 'from-blue-600 to-indigo-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getUrgencyColor()} text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{getModalTitle()}</h2>
              <p className="text-white/90">{getModalMessage()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentError && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700/50 text-red-200 text-sm">
              {paymentError}
              {PaymentService.loadPendingPayment('subscription') && (
                <button
                  type="button"
                  onClick={handleConfirmPendingPayment}
                  disabled={confirmingPayment}
                  className="mt-3 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
                >
                  {confirmingPayment ? 'Confirming payment…' : 'I already paid — confirm renewal'}
                </button>
              )}
            </div>
          )}
          {confirmingPayment && !paymentError && (
            <div className="mb-4 p-3 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-200 text-sm">
              Confirming your payment… Please wait.
            </div>
          )}
          {/* Library Info */}
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              📚 {libraryName || 'Library'} Subscription Plans
            </h3>
            <p className="text-slate-300">
              Choose a plan that suits your study needs
            </p>
          </div>

          {/* Loading State */}
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-slate-300">Loading subscription plans...</span>
            </div>
          ) : (
            <>
              {/* Subscription Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-slate-700/50 rounded-xl p-6 border-2 transition-all duration-200 cursor-pointer ${
                      selectedPlan?.id === plan.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => handlePlanSelection(plan)}
                  >
                    {/* Selection Indicator */}
                    {selectedPlan?.id === plan.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}

                    <div className="text-center">
                      <h4 className="text-lg font-bold text-white mb-2">
                        {PaymentService.planDisplayName(plan)}
                      </h4>
                      <div className="text-3xl font-bold text-indigo-400 mb-4">
                        ₹{plan.discounted_amount || plan.amount}
                        <span className="text-sm text-slate-400"> / {plan.months} mo</span>
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-2">
                        {plan.features && plan.features.split(',').map((feature, index) => (
                          <div key={index} className="flex items-center text-slate-300 text-sm">
                            <span className="text-emerald-400 mr-2">✓</span>
                            {feature.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Plan Summary */}
              {selectedPlan && (
                <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Selected Plan</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-white font-semibold">{PaymentService.planDisplayName(selectedPlan)}</h5>
                      <p className="text-slate-300 text-sm">
                        {selectedPlan.features && selectedPlan.features.split(',').slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-400">
                        ₹{selectedPlan.discounted_amount || selectedPlan.amount}
                      </div>
                      <div className="text-slate-400 text-sm">{selectedPlan.months} month(s)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Maybe Later
                </button>
                
                <button
                  onClick={handlePayment}
                  disabled={!selectedPlan || paymentLoading}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    selectedPlan && !paymentLoading
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {paymentLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {confirmingPayment ? 'Confirming payment…' : 'Processing...'}
                    </div>
                  ) : (
                    `Pay ₹${selectedPlan ? (selectedPlan.discounted_amount || selectedPlan.amount) : 0} & Renew`
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-700/30 p-4 rounded-b-2xl">
          <div className="text-center text-slate-400 text-sm">
            <p>🔒 Secure payment processing • 💳 Multiple payment options available</p>
            <p>Need help? Contact your library administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiryModal;
