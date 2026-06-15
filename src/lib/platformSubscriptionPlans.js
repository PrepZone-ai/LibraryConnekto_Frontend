/** Fixed platform SaaS plans — mirrors backend platform_subscription_plans.py */
export const PLATFORM_TRIAL_DAYS = 30;

export const PLATFORM_PLANS = [
  { months: 1, label: '1 Month', amount: 999, discounted_amount: 799, savings: 200 },
  { months: 6, label: '6 Months', amount: 5999, discounted_amount: 4499, savings: 1500 },
  { months: 12, label: '1 Year', amount: 11999, discounted_amount: 8999, savings: 3000 },
];

export function formatInr(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export async function fetchPlatformPlans(apiClient) {
  try {
    const data = await apiClient.getAnonymous('/platform-subscription/plans');
    if (data?.plans?.length) return data;
  } catch (_) {}
  return { plans: PLATFORM_PLANS, trial_days: PLATFORM_TRIAL_DAYS };
}
