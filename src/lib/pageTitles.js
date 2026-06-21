export const pageTitleMap = {
  '/': 'Home',
  '/services': 'Services',
  '/about': 'About',
  '/contact': 'Contact',
  '/libraries': 'Libraries',
  '/book-seat': 'Book a Seat',
  '/admin/auth': 'Admin Sign In',
  '/admin/reset-password': 'Reset Password',
  '/admin/details': 'Library Details',
  '/admin/dashboard': 'Dashboard',
  '/admin/profile': 'Profile',
  '/admin/students': 'Students',
  '/admin/messages': 'Messages',
  '/admin/seats': 'Seats',
  '/admin/seat-management': 'Seat Management',
  '/admin/analytics': 'Analytics',
  '/admin/booking-management': 'Bookings',
  '/admin/attendance-details': 'Attendance',
  '/admin/revenue-details': 'Revenue',
  '/admin/referral': 'Referral',
  '/admin/scanner': 'QR Scanner',
  '/admin/platform-subscription': 'Subscription',
  '/student/login': 'Sign In',
  '/student/forgot-password': 'Forgot Password',
  '/student/set-password': 'Set Password',
  '/student/dashboard': 'Dashboard',
  '/student/subscription': 'Subscription',
  '/student/book-seat': 'Book Seat',
  '/student/messages': 'Messages',
  '/student/tasks': 'Tasks',
  '/student/exams': 'Exams',
  '/student/attendance': 'Attendance',
  '/student/attendance-history': 'Attendance History',
  '/student/profile': 'Profile',
  '/student/subscription-unavailable': 'Unavailable',
};

export function getPageTitle(pathname) {
  if (pageTitleMap[pathname]) return pageTitleMap[pathname];
  if (pathname.startsWith('/library/')) return 'Library Details';
  if (pathname.startsWith('/payment/')) return 'Payment';
  if (pathname.startsWith('/admin/student-attendance/')) return 'Student Attendance';
  return null;
}
