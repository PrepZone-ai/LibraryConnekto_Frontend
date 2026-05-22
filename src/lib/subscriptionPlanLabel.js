/**
 * Human-readable label for subscription plan dropdowns (admin add student, extend, etc.)
 */
export function formatSubscriptionPlanOptionLabel(plan) {
  if (!plan) return '';

  const months = Number(plan.months) || 1;
  const duration = `${months} month${months > 1 ? 's' : ''}`;
  const amount = plan.discounted_amount ?? plan.amount;
  const price =
    amount !== null && amount !== undefined && amount !== ''
      ? `₹${amount}`
      : '';
  const base = price ? `${duration} - ${price}` : duration;

  if (plan.is_shift_plan) {
    const shift = (plan.shift_time || '').trim();
    return shift ? `${base} · Shift: ${shift}` : `${base} · Shift plan`;
  }

  return base;
}
