import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import PaymentService from '../../services/paymentService';
import PlatformPricingSection from '../common/PlatformPricingSection';
import { formatInr } from '../../lib/platformSubscriptionPlans';

export default function AdminPlatformSubscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userType, isLoggedIn } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn || userType !== 'admin') {
      navigate('/admin/auth', { replace: true });
      return;
    }
    loadStatus();
    const token = searchParams.get('renew_token');
    if (token) {
      apiClient.getAnonymous(`/platform-subscription/renew?token=${encodeURIComponent(token)}`).catch(() => {});
    }
  }, [isLoggedIn, userType, navigate, searchParams]);

  const loadStatus = async () => {
    try {
      const data = await apiClient.get('/platform-subscription/status');
      setStatus(data);
    } catch (err) {
      setError(err.message || 'Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    setPaying(true);
    setError('');
    try {
      await PaymentService.processPlatformSubscriptionPayment(
        { months: selectedPlan.months },
        async () => {
          await loadStatus();
          setSelectedPlan(null);
          navigate('/admin/dashboard');
        },
        (err) => setError(err.message || 'Payment failed'),
      );
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const statusLabel = {
    trial: 'Free Trial',
    active: 'Active',
    expired: 'Expired',
  };

  if (loading) {
    return (
      <div className="app-page-bg min-h-screen flex items-center justify-center">
        <p className="text-white/80">Loading subscription...</p>
      </div>
    );
  }

  return (
    <div className="app-page-bg min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-white mb-2">Software Subscription</h1>
        <p className="text-slate-400 mb-8">
          Manage your LibraryConnekto platform subscription. Students cannot access the software when this expires.
        </p>

        {status && (
          <div
            className={`mb-8 rounded-2xl border p-6 ${
              status.status === 'expired'
                ? 'border-red-500/40 bg-red-900/20'
                : status.status === 'trial'
                  ? 'border-amber-500/40 bg-amber-900/20'
                  : 'border-emerald-500/40 bg-emerald-900/20'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Current status</p>
                <p className="text-2xl font-bold text-white">
                  {statusLabel[status.status] || status.status}
                </p>
                {status.subscription_end && (
                  <p className="text-slate-300 text-sm mt-1">
                    {status.status === 'expired' ? 'Expired on' : 'Valid until'}:{' '}
                    {new Date(status.subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-white">{status.days_left}</p>
                <p className="text-slate-400 text-sm">days remaining</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-900/30 border border-red-500/40 px-4 py-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        <h2 className="text-xl font-semibold text-white mb-6">Choose a plan</h2>
        <PlatformPricingSection
          ctaMode="renew"
          showTrialBanner={status?.status === 'trial'}
          onSelectPlan={setSelectedPlan}
          selectedMonths={selectedPlan?.months}
        />

        {selectedPlan && (
          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
            <h3 className="text-lg font-bold text-white mb-2">Confirm payment</h3>
            <p className="text-slate-300 mb-4">
              {selectedPlan.label} — {formatInr(selectedPlan.discounted_amount)}
            </p>
            <button
              type="button"
              disabled={paying}
              onClick={handlePayment}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-bold text-white disabled:opacity-50"
            >
              {paying ? 'Processing...' : 'Pay with Razorpay'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
