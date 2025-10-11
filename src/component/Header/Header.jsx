import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import SelectRoleModal from '../Auth/SelectRoleModal';

export default function Header() {
  const { user, userType, isLoggedIn, logout, selectedRole, setRole } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('header')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const openRoleModal = () => setShowRoleModal(true);
    window.addEventListener('open-role-modal', openRoleModal);
    return () => {
      window.removeEventListener('open-role-modal', openRoleModal);
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const fetchStudentProfile = async () => {
    if (userType === 'student' && isLoggedIn) {
      try {
        const response = await apiClient.get('/student/profile');
        setStudentProfile(response);
      } catch (error) {
        console.error('Error fetching student profile:', error);
      }
    }
  };

  useEffect(() => {
    if (userType === 'student' && isLoggedIn) {
      fetchStudentProfile();
    }
  }, [userType, isLoggedIn]);

  const handleSelectRole = (role) => {
    setShowRoleModal(false);
    setRole(role); // Store role in localStorage
  };

  const handleClearRole = () => {
    setRole(null); // Clear role from localStorage
    localStorage.removeItem('selectedRole');
  };

  // Determine current page title for admin and student routes
  const pageTitleMap = {
    '/admin/profile': 'Admin Profile',
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/students': 'Student Management',
    '/admin/analytics': 'Admin Analytics',
    '/admin/bookings': 'Booking Management',
    '/admin/settings': 'Admin Settings',
    '/admin/reports': 'Reports',
    '/admin/notifications': 'Notifications',
    '/admin/revenue-details': 'Revenue Details',
    '/admin/referral': 'Referral Program',
    '/student/attendance-history': 'Attendance History',
    '/student/messages': 'Chat with Admin',
  };
  const currentPageTitle = pageTitleMap[location.pathname];
  const isHome = location.pathname === '/';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl shadow-purple-500/10' 
        : 'bg-transparent'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
              <img 
                src={new URL('../../assets/Logo.png', import.meta.url).href} 
                alt="Library Connekto Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Library Connekto
            </span>
          </Link>
          
          {/* Role Display - Clickable to Change Role */}
          {!isLoggedIn && selectedRole && (
            <div className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all duration-200 group"
                title="Click to change role"
              >
                <div className={`w-2 h-2 rounded-full ${selectedRole === 'admin' ? 'bg-pink-400' : 'bg-purple-400'} group-hover:scale-110 transition-transform duration-200`}></div>
                <span className="text-sm font-medium text-purple-200 group-hover:text-purple-100 transition-colors duration-200">
                  {selectedRole === 'admin' ? 'Admin' : 'Student'}
                </span>
                <svg className="w-3 h-3 text-purple-300 group-hover:text-purple-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </button>
              <button 
                onClick={handleClearRole}
                className="p-1 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                title="Clear role selection"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {currentPageTitle && (
            <div className="hidden md:block text-white text-lg font-semibold px-4 py-2 rounded-lg border border-slate-600/50 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm">
              {currentPageTitle}
            </div>
          )}
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {isHome ? (
              <>
                <Link 
                  to="/" 
                  className={`transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                    location.pathname === '/' 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={closeMobileMenu}
                >
                  Home
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-400 transition-all duration-200 ${
                    location.pathname === '/' ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
                {isLoggedIn && (
                  <button 
                    onClick={() => navigate(userType === 'admin' ? '/admin/dashboard' : '/student/dashboard')}
                    className={`transition-all duration-200 px-3 py-2 rounded-lg ${
                      location.pathname === (userType === 'admin' ? '/admin/dashboard' : '/student/dashboard') 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                  >
                    Dashboard
                  </button>
                )}
                <Link 
                  to="/services" 
                  className={`transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                    location.pathname === '/services' 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={closeMobileMenu}
                >
                  Services
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-400 transition-all duration-200 ${
                    location.pathname === '/services' ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
                <Link 
                  to="/about" 
                  className={`transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                    location.pathname === '/about' 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={closeMobileMenu}
                >
                  About
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-400 transition-all duration-200 ${
                    location.pathname === '/about' ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
                <Link 
                  to="/contact" 
                  className={`transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                    location.pathname === '/contact' 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={closeMobileMenu}
                >
                  Contact
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-400 transition-all duration-200 ${
                    location.pathname === '/contact' ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
                <button 
                  onClick={() => {
                    if (selectedRole === 'admin') {
                      setShowRoleModal(true);
                    } else {
                      const element = document.getElementById('book-seat');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {selectedRole === 'admin' ? 'Register Your Library' : 'Book Your Seat'}
                </button>
              </>
            ) : !isLoggedIn ? (
              <>
                <Link 
                  to="/" 
                  className={`transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                    location.pathname === '/' 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={closeMobileMenu}
                >
                  Home
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-400 transition-all duration-200 ${
                    location.pathname === '/' ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
                <Link 
                  to="/services" 
                  className={`transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                    location.pathname === '/services' 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={closeMobileMenu}
                >
                  Services
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-400 transition-all duration-200 ${
                    location.pathname === '/services' ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
                <Link 
                  to="/about" 
                  className={`transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                    location.pathname === '/about' 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={closeMobileMenu}
                >
                  About
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-400 transition-all duration-200 ${
                    location.pathname === '/about' ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
                <Link 
                  to="/contact" 
                  className={`transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                    location.pathname === '/contact' 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                  }`}
                  onClick={closeMobileMenu}
                >
                  Contact
                  <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-400 transition-all duration-200 ${
                    location.pathname === '/contact' ? 'w-8' : 'w-0 group-hover:w-8'
                  }`}></span>
                </Link>
              </>
            ) : (
              <>
                {userType === 'admin' ? (
                  <>
                    <button 
                      onClick={() => navigate('/')}
                      className={`transition-all duration-200 px-3 py-2 rounded-lg ${
                        location.pathname === '/' 
                          ? 'text-purple-400 bg-purple-500/10' 
                          : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                      }`}
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => navigate('/admin/dashboard')}
                      className={`transition-all duration-200 px-3 py-2 rounded-lg ${
                        location.pathname === '/admin/dashboard' 
                          ? 'text-purple-400 bg-purple-500/10' 
                          : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                      }`}
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => navigate('/admin/students')}
                      className={`transition-all duration-200 px-3 py-2 rounded-lg ${
                        location.pathname === '/admin/students' 
                          ? 'text-purple-400 bg-purple-500/10' 
                          : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                      }`}
                    >
                      Students
                    </button>
                    <button 
                      onClick={() => navigate('/admin/messages')}
                      className={`transition-all duration-200 px-3 py-2 rounded-lg ${
                        location.pathname === '/admin/messages' 
                          ? 'text-purple-400 bg-purple-500/10' 
                          : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                      }`}
                    >
                      Messages
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate('/')}
                      className={`transition-all duration-200 px-3 py-2 rounded-lg ${
                        location.pathname === '/' 
                          ? 'text-purple-400 bg-purple-500/10' 
                          : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                      }`}
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => navigate('/student/dashboard')}
                      className={`transition-all duration-200 px-3 py-2 rounded-lg ${
                        location.pathname === '/student/dashboard' 
                          ? 'text-purple-400 bg-purple-500/10' 
                          : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                      }`}
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => navigate('/student/messages')}
                      className={`transition-all duration-200 px-3 py-2 rounded-lg ${
                        location.pathname === '/student/messages' 
                          ? 'text-purple-400 bg-purple-500/10' 
                          : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                      }`}
                    >
                      Messages
                    </button>
                  </>
                )}
              </>
            )}
          </nav>
          
          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {(userType === 'admin' || userType === 'student') && (
                  <button 
                    onClick={() => navigate(userType === 'admin' ? '/admin/profile' : '/student/profile')}
                    className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-purple-500/5 flex items-center gap-2"
                    title="Profile Settings"
                  >
                    {userType === 'student' && studentProfile ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-400/50">
                          {studentProfile.profile_image ? (
                            <img 
                              src={studentProfile.profile_image} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {studentProfile.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="hidden sm:block">{studentProfile.name || 'Student'}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </>
                    )}
                  </button>
                )}
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-sm font-medium text-slate-300 hover:text-red-400 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-red-500/5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => {
                  if (selectedRole) {
                    if (selectedRole === 'admin') {
                      navigate('/admin/auth');
                    } else {
                      navigate('/student/login');
                    }
                  } else {
                    setShowRoleModal(true);
                  }
                }} className="text-sm font-medium text-slate-300 hover:text-purple-400 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-purple-500/5">
                  Sign In
                </button>
                <button onClick={() => {
                  if (selectedRole) {
                    if (selectedRole === 'admin') {
                      navigate('/admin/auth?mode=signup');
                    } else {
                      navigate('/student/login');
                    }
                  } else {
                    setShowRoleModal(true);
                  }
                }} className="inline-flex items-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-200">
                  {selectedRole === 'admin' ? 'Register Your Library' : 'Get Started'}
                </button>
              </>
            )}
          </div>

          {/* Mobile page title and menu button */}
          <div className="md:hidden flex items-center gap-3">
            {currentPageTitle && (
              <div className="text-white text-sm font-medium px-2 py-1 rounded border border-slate-600/50 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
                {currentPageTitle}
              </div>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

          {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden mobile-menu-container ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-6 space-y-4 border-t border-slate-700/50 mt-4 bg-slate-900/95 backdrop-blur-xl mobile-menu-content">
            {/* Mobile Role Display - Clickable to Change Role */}
            {!isLoggedIn && selectedRole && (
              <div className="flex items-center gap-3 mb-4">
                <button 
                  onClick={() => { closeMobileMenu(); setShowRoleModal(true); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all duration-200 group"
                  title="Click to change role"
                >
                  <div className={`w-2 h-2 rounded-full ${selectedRole === 'admin' ? 'bg-pink-400' : 'bg-purple-400'} group-hover:scale-110 transition-transform duration-200`}></div>
                  <span className="text-sm font-medium text-purple-200 group-hover:text-purple-100 transition-colors duration-200">
                    {selectedRole === 'admin' ? 'Admin' : 'Student'} Role
                  </span>
                  <svg className="w-3 h-3 text-purple-300 group-hover:text-purple-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </button>
                <button 
                  onClick={() => { closeMobileMenu(); handleClearRole(); }}
                  className="p-3 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                  title="Clear role selection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {/* Navigation Links Section */}
            <div className="space-y-2 mobile-menu-section">
              {isHome ? (
                <>
                  <Link 
                    to="/" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/' 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                  {isLoggedIn && (
                    <button 
                      onClick={() => { closeMobileMenu(); navigate(userType === 'admin' ? '/admin/dashboard' : '/student/dashboard'); }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200"
                    >
                      Dashboard
                    </button>
                  )}
                  <Link 
                    to="/services" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/services' 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Services
                  </Link>
                  <Link 
                    to="/about" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/about' 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/contact' 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Contact
                  </Link>
                </>
                ) : !isLoggedIn ? (
                <>
                  <Link 
                    to="/" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/' 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/services" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/services' 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Services
                  </Link>
                  <Link 
                    to="/about" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/about' 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/contact' 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-slate-300 hover:text-purple-400 hover:bg-purple-500/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Contact
                  </Link>
                </>
                ) : (
                <>
                  {userType === 'admin' ? (
                    <>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/'); }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200"
                      >
                        Home
                      </button>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/admin/dashboard'); }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/admin/students'); }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200"
                      >
                        Students
                      </button>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/admin/messages'); }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200"
                      >
                        Messages
                      </button>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/admin/profile'); }} 
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/'); }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200"
                      >
                        Home
                      </button>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/student/dashboard'); }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/student/messages'); }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200"
                      >
                        Messages
                      </button>
                      <button 
                        onClick={() => { closeMobileMenu(); navigate('/student/profile'); }} 
                        className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200 flex items-center gap-2"
                      >
                        {studentProfile ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-400/50">
                              {studentProfile.profile_image ? (
                                <img 
                                  src={studentProfile.profile_image} 
                                  alt="Profile" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {studentProfile.name?.charAt(0)?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{studentProfile.name || 'Student'}</span>
                              <span className="text-xs text-slate-400">ID: {studentProfile.student_id || 'N/A'}</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </>
                        )}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* CTA Button Section */}
            {isHome && (
              <div className="pt-4 border-t border-slate-700/50 mobile-menu-section">
                <button 
                  onClick={() => { 
                    closeMobileMenu(); 
                    if (selectedRole === 'admin') {
                      setShowRoleModal(true);
                    } else {
                      const element = document.getElementById('book-seat');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="block w-full text-left px-4 py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-center shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 transition-all duration-200 mb-4"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {selectedRole === 'admin' ? 'Register Your Library' : 'Book Your Seat'}
                  </div>
                </button>
              </div>
            )}

            {/* Auth Section */}
            <div className="pt-4 border-t border-slate-700/50 space-y-2 mobile-menu-section">
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => { 
                      closeMobileMenu(); 
                      logout(); 
                      navigate('/'); 
                    }} 
                    className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { 
                    closeMobileMenu(); 
                    if (selectedRole) {
                      if (selectedRole === 'admin') {
                        navigate('/admin/auth');
                      } else {
                        navigate('/student/login');
                      }
                    } else {
                      setShowRoleModal(true);
                    }
                  }} className="block w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200">
                    Sign In
                  </button>
                  <button onClick={() => { 
                    closeMobileMenu(); 
                    if (selectedRole) {
                      if (selectedRole === 'admin') {
                        navigate('/admin/auth?mode=signup');
                      } else {
                        navigate('/student/login');
                      }
                    } else {
                      setShowRoleModal(true);
                    }
                  }} className="block w-full text-left px-4 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-center shadow-lg shadow-purple-500/25 hover:shadow-purple-500/30 transition-all duration-200">
                    {selectedRole === 'admin' ? 'Register Your Library' : 'Get Started'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <SelectRoleModal open={showRoleModal} onClose={() => setShowRoleModal(false)} onSelect={handleSelectRole} />
    </header>
  );
}
