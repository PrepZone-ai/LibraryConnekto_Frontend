import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import { fetchPlatformPlans, formatInr, PLATFORM_TRIAL_DAYS } from '../../lib/platformSubscriptionPlans';

/**
 * @param {{ variant?: 'full', showTrialBanner?: boolean, ctaMode?: 'signup'|'renew'|'none', onSelectPlan?: (plan) => void, selectedMonths?: number }} props
 */
export default function PlatformPricingSection({
  variant = 'full',
  showTrialBanner = true,
  ctaMode = 'signup',
  onSelectPlan,
  selectedMonths,
}) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [trialDays, setTrialDays] = useState(PLATFORM_TRIAL_DAYS);

  useEffect(() => {
    fetchPlatformPlans(apiClient).then((data) => {
      setPlans(data.plans || []);
      setTrialDays(data.trial_days ?? PLATFORM_TRIAL_DAYS);
    });
  }, []);

  const handleCta = (plan) => {
    if (ctaMode === 'renew' && onSelectPlan) {
      onSelectPlan(plan);
      return;
    }
    if (ctaMode === 'signup') {
      navigate('/admin/auth?mode=signup');
    }
  };

  if (variant !== 'full') return null;

  return (
    <div className="w-full">
      {showTrialBanner && (
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-5 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
            {trialDays}-Day Free Trial — full access for library owners
          </span>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isPopular = plan.months === 6;
          const isSelected = selectedMonths === plan.months;
          const savings = plan.savings ?? plan.amount - plan.discounted_amount;
          return (
            <div
              key={plan.months}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                isPopular
                  ? 'border-purple-500/50 bg-gradient-to-b from-purple-900/40 to-slate-900/60 shadow-lg shadow-purple-500/10'
                  : 'border-slate-700/50 bg-slate-900/40'
              } ${isSelected ? 'ring-2 ring-emerald-400' : ''}`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{plan.label}</h3>
              <div className="mb-4">
                <span className="text-slate-400 line-through text-lg mr-2">
                  {formatInr(plan.amount)}
                </span>
                <span className="text-3xl font-black text-white">
                  {formatInr(plan.discounted_amount)}
                </span>
                {plan.months === 1 && (
                  <span className="text-slate-400 text-sm ml-1">/month</span>
                )}
              </div>
              {savings > 0 && (
                <span className="inline-block w-fit mb-4 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Save {formatInr(savings)}
                </span>
              )}
              <ul className="text-slate-300 text-sm space-y-2 mb-6 flex-grow">
                <li>✓ Full library management software</li>
                <li>✓ Student & seat management</li>
                <li>✓ Payments & analytics</li>
                <li>✓ {plan.months === 1 ? '1 month' : `${plan.months} months`} access</li>
              </ul>
              {ctaMode !== 'none' && (
                <button
                  type="button"
                  onClick={() => handleCta(plan)}
                  className={`w-full rounded-xl py-3 font-bold transition-all ${
                    ctaMode === 'renew'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                  }`}
                >
                  {ctaMode === 'renew' ? 'Choose Plan' : 'Start Free Trial'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
