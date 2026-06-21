export function getBottomNavItems({ isLoggedIn, userType, selectedRole }) {
  if (isLoggedIn && userType === 'student') {
    return [
      { label: 'Home', path: '/', icon: 'home', match: (p) => p === '/' },
      { label: 'Dashboard', path: '/student/dashboard', icon: 'dashboard', match: (p) => p === '/student/dashboard' },
      { label: 'Book', path: '/student/book-seat', icon: 'book', match: (p) => p === '/student/book-seat' },
      { label: 'Messages', path: '/student/messages', icon: 'messages', match: (p) => p === '/student/messages' },
      { label: 'Profile', path: '/student/profile', icon: 'profile', match: (p) => p === '/student/profile' },
    ];
  }

  if (isLoggedIn && userType === 'admin') {
    return [
      { label: 'Home', path: '/', icon: 'home', match: (p) => p === '/' },
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard', match: (p) => p === '/admin/dashboard' },
      { label: 'Students', path: '/admin/students', icon: 'students', match: (p) => p === '/admin/students' },
      { label: 'Scanner', path: '/admin/scanner', icon: 'scanner', match: (p) => p === '/admin/scanner' },
      { label: 'Profile', path: '/admin/profile', icon: 'profile', match: (p) => p === '/admin/profile' },
    ];
  }

  if (selectedRole === 'admin') {
    return [];
  }

  // Guest student (or no role yet on welcome screen) — libraries + book without login
  if (selectedRole === 'student' || !selectedRole) {
    return [
      { label: 'Home', path: '/', icon: 'home', match: (p) => p === '/' },
      { label: 'Libraries', path: '/libraries', icon: 'libraries', match: (p) => p === '/libraries' || p.startsWith('/library/') },
      { label: 'Book', path: '/book-seat', icon: 'book', match: (p) => p === '/book-seat' },
      { label: 'Sign In', path: '/student/login', icon: 'login', match: (p) => p.startsWith('/student/login') },
    ];
  }

  return [];
}
