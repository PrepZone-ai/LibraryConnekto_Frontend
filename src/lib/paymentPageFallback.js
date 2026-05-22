/**
 * Booking summary encoded in the payment link query string (email fallback when
 * GET /booking/booking-details is not yet deployed on the API).
 */
export function bookingFromPaymentUrlSearch(bookingId, search = '') {
  const params = new URLSearchParams(search);
  const amount = params.get('amount');
  const months = params.get('months');
  const library = params.get('library');
  if (!bookingId || (!amount && !library)) {
    return null;
  }
  return {
    id: bookingId,
    library_name: library || 'Library',
    name: params.get('name') || '',
    email: params.get('email') || '',
    mobile: params.get('mobile') || '',
    amount: amount ? Number(amount) : 0,
    subscription_months: months ? Number(months) : 1,
    seat_number: null,
    status: 'approved',
  };
}
