const HIDE_BOTTOM_NAV_PREFIXES = [
  '/admin/auth',
  '/admin/reset-password',
  '/student/login',
  '/student/forgot-password',
  '/student/set-password',
  '/auth/verify-success',
  '/auth/verify-error',
  '/payment/',
  '/transfer/payment',
  '/admin/details',
  '/admin/scanner',
  '/student/subscription-unavailable',
  '/book-seat',
  '/library/',
];

export function shouldHideBottomNav(pathname) {
  return HIDE_BOTTOM_NAV_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}
