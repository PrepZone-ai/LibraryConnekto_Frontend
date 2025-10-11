import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import AnonymousBookingForm from '../Booking/AnonymousBookingForm';
import SelectRoleModal from '../Auth/SelectRoleModal';
import DownloadAppButton from '../common/DownloadAppButton';
import { useAuth } from '../../contexts/AuthContext';
import { 
  RocketIcon, AnalyticsIcon, UsersIcon, SeatIcon, MoneyIcon, 
  SettingsIcon, ClockIcon, LightningIcon, TargetIcon, SupportIcon,
  ShieldIcon, BellIcon, MobileIcon, ChartIcon, StarIcon, QuoteIcon
} from '../Icons/Icons';

function Stat({ value, label }) {
  return (
    <div className="text-center group">
      <div className="text-3xl sm:text-4xl md:text-5xl font-black gradient-text group-hover:scale-110 transition-transform duration-300">{value}</div>
      <div className="text-xs sm:text-sm md:text-base text-slate-300 font-medium mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  const { selectedRole, isLoggedIn, setRole } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    AOS.init({ 
      duration: 700, 
      once: true, 
      offset: 80, 
      easing: 'ease-out',
      disable: false,
      startEvent: 'DOMContentLoaded'
    });
  }, []);

  useEffect(() => {
    // Check if user has visited before and show role modal if needed
    const hasVisited = localStorage.getItem('hasVisited');
    const storedRole = localStorage.getItem('selectedRole');
    
    // Show modal if: not visited before, not logged in, and no role stored
    if (!hasVisited && !isLoggedIn && !storedRole) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        setShowRoleModal(true);
        localStorage.setItem('hasVisited', 'true');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const openRoleModal = () => setShowRoleModal(true);
  
  const handleSelectRole = (role) => {
    setRole(role);
    setShowRoleModal(false);
  };
  
  const handleCloseModal = () => {
    setShowRoleModal(false);
  };

  const handleAuthAction = () => {
    if (selectedRole) {
      // If role is already selected, navigate to appropriate auth page
      if (selectedRole === 'admin') {
        navigate('/admin/auth?mode=signup');
      } else {
        navigate('/student/login');
      }
    } else {
      // If no role selected, show role modal
      setShowRoleModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header />
      <SelectRoleModal 
        open={showRoleModal} 
        onClose={handleCloseModal} 
        onSelect={handleSelectRole} 
      />

      {/* Hero */}
      <section id="hero" className="relative isolate pt-16 md:pt-20 overflow-hidden min-h-screen flex items-start z-10">
        <div className="absolute inset-0 -z-10">
          <img src={new URL('../../assets/Front.png', import.meta.url).href} alt="Library Connekto" className="h-full w-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full relative z-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Text content */}
            <div className="max-w-2xl relative z-30">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 mb-6 shadow-lg shadow-purple-500/25 animate-pulse-glow">
                <RocketIcon className="w-4 h-4" />
                <span>Transform Your Library Today</span>
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-white mb-6">
                <span className="block gradient-text">Smart Library</span>
                <span className="block gradient-text">Management</span>
                <span className="block gradient-text">Made Simple</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl">
                Turn your library into a smart, profitable business with our all-in-one management platform.
              </p>
              <div className="mt-10 flex flex-col lg:flex-row items-center justify-center gap-4">
                <button onClick={handleAuthAction} className="group btn-hover inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 min-w-[200px]">
                  <span className="text-center">
                    {selectedRole === 'admin' ? 'Register Your Library' : 'Get Started'}
                  </span>
                  <svg className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                {!isLoggedIn && selectedRole ? (
                  selectedRole === 'admin' ? (
                    <button onClick={handleAuthAction} className="group btn-hover inline-flex items-center justify-center rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-purple-400/30 px-8 py-4 text-sm font-bold text-white hover:bg-purple-500/10 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 min-w-[140px]">
                      <span className="text-center">Sign In</span>
                    </button>
                  ) : (
                    <a href="#book-seat" className="group btn-hover inline-flex items-center justify-center rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-purple-400/30 px-8 py-4 text-sm font-bold text-white hover:bg-purple-500/10 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 min-w-[160px]">
                      <span className="text-center">Book Your Seat</span>
                    </a>
                  )
                ) : (
                  <a href="#book-seat" className="group btn-hover inline-flex items-center justify-center rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-purple-400/30 px-8 py-4 text-sm font-bold text-white hover:bg-purple-500/10 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 min-w-[160px]">
                    <span className="text-center">Book Your Seat</span>
                  </a>
                )}
                <DownloadAppButton 
                  variant="secondary" 
                  size="large" 
                  className="min-w-[160px] bg-slate-800/80 backdrop-blur-sm border border-purple-400/30 hover:bg-purple-500/10 hover:border-purple-400/50 hover:scale-105 transition-all duration-300"
                />
              </div>
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl">
                <Stat value="50K+" label="Active Students" />
                <Stat value="500+" label="Partner Libraries" />
                <Stat value="300%" label="Revenue Growth" />
              </div>
            </div>

            {/* Right side - India Map with Connected Libraries */}
            <div className="hidden md:block relative z-30">
              <div className="relative">
                <div className="rounded-3xl glass p-4 sm:p-6 lg:p-8 shadow-2xl shadow-purple-500/10 bg-slate-800/30 backdrop-blur-sm">
                  <svg viewBox="0 0 600 500" className="w-full h-full max-h-96 lg:max-h-none">
                    <defs>
                      <linearGradient id="indiaGrad1" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                      <linearGradient id="indiaGrad2" x1="0" x2="1" y1="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4"/>
                        <stop offset="100%" stopColor="#a855f7"/>
                      </linearGradient>
                      <linearGradient id="indiaGrad3" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                      <linearGradient id="indiaGrad4" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981"/>
                        <stop offset="100%" stopColor="#06b6d4"/>
                      </linearGradient>
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      <filter id="pulse" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Background decorative elements */}
                    <circle cx="80" cy="80" r="40" fill="url(#indiaGrad2)" opacity="0.1" filter="url(#glow)" />
                    <circle cx="520" cy="420" r="50" fill="url(#indiaGrad1)" opacity="0.1" filter="url(#glow)" />
                    <circle cx="550" cy="120" r="30" fill="url(#indiaGrad3)" opacity="0.1" filter="url(#glow)" />
                    
                    {/* India Map Outline - More Accurate Shape */}
                    <path d="M120 80 L180 70 L240 75 L300 70 L360 75 L420 80 L480 90 L520 110 L550 140 L560 180 L550 220 L520 260 L480 300 L420 320 L360 330 L300 340 L240 335 L180 330 L120 320 L80 280 L60 240 L50 200 L60 160 L80 120 Z" 
                          fill="#1e293b" 
                          stroke="#64748b" 
                          strokeWidth="1" 
                          opacity="0.9"/>
                    
                    {/* State Boundaries */}
                    <path d="M120 80 L180 70 L240 75 L300 70 L360 75 L420 80" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M420 80 L480 90 L520 110 L550 140" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M550 140 L560 180 L550 220" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M550 220 L520 260 L480 300" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M480 300 L420 320 L360 330" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M360 330 L300 340 L240 335" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M240 335 L180 330 L120 320" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M120 320 L80 280 L60 240" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M60 240 L50 200 L60 160" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    <path d="M60 160 L80 120 L120 80" stroke="#64748b" strokeWidth="0.5" fill="none" opacity="0.6"/>
                    
                    {/* Internal State Lines */}
                    <path d="M200 100 L200 200" stroke="#64748b" strokeWidth="0.3" fill="none" opacity="0.4"/>
                    <path d="M280 90 L280 250" stroke="#64748b" strokeWidth="0.3" fill="none" opacity="0.4"/>
                    <path d="M360 95 L360 280" stroke="#64748b" strokeWidth="0.3" fill="none" opacity="0.4"/>
                    <path d="M440 110 L440 300" stroke="#64748b" strokeWidth="0.3" fill="none" opacity="0.4"/>
                    <path d="M120 150 L500 150" stroke="#64748b" strokeWidth="0.3" fill="none" opacity="0.4"/>
                    <path d="M120 200 L520 200" stroke="#64748b" strokeWidth="0.3" fill="none" opacity="0.4"/>
                    <path d="M120 250 L480 250" stroke="#64748b" strokeWidth="0.3" fill="none" opacity="0.4"/>
                    <path d="M120 300 L420 300" stroke="#64748b" strokeWidth="0.3" fill="none" opacity="0.4"/>
                    
                    {/* Central Library Connekto Hub */}
                    <g transform="translate(300, 220)">
                      <circle cx="0" cy="0" r="25" fill="url(#indiaGrad1)" opacity="0.9" filter="url(#pulse)">
                        <animate attributeName="r" values="25;30;25" dur="3s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.9;0.7;0.9" dur="3s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-15" y="-10" width="30" height="20" rx="3" fill="#0f172a" opacity="0.9"/>
                      <rect x="-12" y="-7" width="24" height="14" rx="2" fill="url(#indiaGrad1)" opacity="0.6"/>
                      <image x="-6" y="-6" width="12" height="12" href={new URL('../../assets/Logo.png', import.meta.url).href} />
                    </g>
                    
                    {/* Library locations across India - Repositioned for better accuracy */}
                    {/* Delhi */}
                    <g transform="translate(280, 100)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad2)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.5s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad2)" opacity="0.6"/>
                    </g>
                    
                    {/* Mumbai */}
                    <g transform="translate(180, 260)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad3)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.8s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad3)" opacity="0.6"/>
                    </g>
                    
                    {/* Bangalore */}
                    <g transform="translate(240, 320)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad4)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.2s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad4)" opacity="0.6"/>
                    </g>
                    
                    {/* Chennai */}
                    <g transform="translate(340, 350)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad1)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.7s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad1)" opacity="0.6"/>
                    </g>
                    
                    {/* Kolkata */}
                    <g transform="translate(420, 180)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad2)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.3s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad2)" opacity="0.6"/>
                    </g>
                    
                    {/* Hyderabad */}
                    <g transform="translate(220, 280)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad3)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.6s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad3)" opacity="0.6"/>
                    </g>
                    
                    {/* Pune */}
                    <g transform="translate(160, 240)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad4)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.4s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad4)" opacity="0.6"/>
                    </g>
                    
                    {/* Ahmedabad */}
                    <g transform="translate(140, 180)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad1)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.9s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad1)" opacity="0.6"/>
                    </g>
                    
                    {/* Kochi */}
                    <g transform="translate(180, 380)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad2)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.1s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad2)" opacity="0.6"/>
                    </g>
                    
                    {/* Jaipur */}
                    <g transform="translate(220, 130)">
                      <circle cx="0" cy="0" r="8" fill="url(#indiaGrad3)" opacity="0.8" filter="url(#pulse)">
                        <animate attributeName="r" values="8;12;8" dur="2.5s" repeatCount="indefinite"/>
                      </circle>
                      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="#0f172a" opacity="0.8"/>
                      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="url(#indiaGrad3)" opacity="0.6"/>
                    </g>
                    
                    {/* Connection lines from libraries to central hub - Updated paths */}
                    <path d="M280 100 Q290 160 300 220" stroke="url(#indiaGrad2)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
                    </path>
                    <path d="M180 260 Q240 240 300 220" stroke="url(#indiaGrad3)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="2.2s" repeatCount="indefinite"/>
                    </path>
                    <path d="M240 320 Q270 270 300 220" stroke="url(#indiaGrad4)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="1.8s" repeatCount="indefinite"/>
                    </path>
                    <path d="M340 350 Q320 285 300 220" stroke="url(#indiaGrad1)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="2.5s" repeatCount="indefinite"/>
                    </path>
                    <path d="M420 180 Q360 200 300 220" stroke="url(#indiaGrad2)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="2.1s" repeatCount="indefinite"/>
                    </path>
                    <path d="M220 280 Q260 250 300 220" stroke="url(#indiaGrad3)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="2.3s" repeatCount="indefinite"/>
                    </path>
                    <path d="M160 240 Q230 230 300 220" stroke="url(#indiaGrad4)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="1.9s" repeatCount="indefinite"/>
                    </path>
                    <path d="M140 180 Q220 200 300 220" stroke="url(#indiaGrad1)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="2.4s" repeatCount="indefinite"/>
                    </path>
                    <path d="M180 380 Q240 300 300 220" stroke="url(#indiaGrad2)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="2.6s" repeatCount="indefinite"/>
                    </path>
                    <path d="M220 130 Q260 175 300 220" stroke="url(#indiaGrad3)" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;10" dur="2.7s" repeatCount="indefinite"/>
                    </path>
                    
                    {/* Floating data points showing network activity */}
                    <circle cx="250" cy="180" r="2" fill="#fff" opacity="0.8">
                      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="320" cy="300" r="2" fill="#fff" opacity="0.8">
                      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="180" cy="350" r="2" fill="#fff" opacity="0.8">
                      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.8s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="350" cy="250" r="2" fill="#fff" opacity="0.8">
                      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="200" cy="220" r="2" fill="#fff" opacity="0.8">
                      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3.2s" repeatCount="indefinite"/>
                    </circle>
                    
                    {/* Title */}
                    <text x="300" y="50" textAnchor="middle" fill="url(#indiaGrad1)" fontSize="16" fontWeight="bold" opacity="0.9">
                      Library Connekto Network
                    </text>
                    <text x="300" y="70" textAnchor="middle" fill="#94a3b8" fontSize="12" opacity="0.8">
                      Connecting Libraries Across India
                    </text>
                  </svg>
                </div>
                
                {/* Floating elements around the map */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg animate-bounce">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg animate-pulse">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <div className="absolute top-1/2 -left-6 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-lg animate-ping">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="relative bg-gradient-to-br from-slate-800 via-purple-900/20 to-slate-900 py-24 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative mb-20" data-aos="fade-up">
            {/* Background decorative elements */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="text-center relative">
              {/* Animated badge */}
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-6 py-3 text-sm font-semibold text-purple-200 mb-8 shadow-lg shadow-purple-500/25 animate-pulse-glow">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <RocketIcon className="w-5 h-5" />
                <span>Getting Started</span>
              </div>
              
              {/* Main heading with enhanced styling */}
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white mb-4 leading-tight">
                  <span className="block">Your Journey to</span>
                  <span className="block relative">
                    <span className="gradient-text">Digital Transformation</span>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </span>
                </h2>
                
                {/* Subtitle with enhanced styling */}
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg sm:text-xl md:text-2xl text-slate-300 font-medium leading-relaxed mb-6">
                    Transform your library in just 
                    <span className="text-purple-300 font-bold"> 4 simple steps</span>. 
                    Our streamlined onboarding process gets you up and running quickly.
                  </p>
                  
                  {/* Progress indicator */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-400 font-medium">Quick Setup</span>
                    </div>
                    <div className="hidden sm:block w-8 h-0.5 bg-slate-600"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <span className="text-sm text-blue-400 font-medium">Easy Migration</span>
                    </div>
                    <div className="hidden sm:block w-8 h-0.5 bg-slate-600"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <span className="text-sm text-purple-400 font-medium">Go Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-16" data-aos="fade-up" data-aos-delay="100">
            {[
              { 
                step: '01', 
                title: 'Quick Setup', 
                time: '5 minutes',
                description: 'Sign up and complete your library profile in under 5 minutes. Our guided setup wizard makes it effortless.',
                icon: LightningIcon
              },
              { 
                step: '02', 
                title: 'Configure Your System', 
                time: '15 minutes',
                description: 'Set up seats, pricing plans, and customize settings to match your library\'s unique requirements.',
                icon: SettingsIcon
              },
              { 
                step: '03', 
                title: 'Add Students', 
                time: '10 minutes',
                description: 'Import existing student data or add new students. Generate ID cards and set up subscriptions instantly.',
                icon: UsersIcon
              },
              { 
                step: '04', 
                title: 'Start Managing', 
                time: 'Ongoing',
                description: 'Begin tracking attendance, managing bookings, and monitoring your library\'s performance in real-time.',
                icon: ChartIcon
              },
            ].map((step, index) => (
              <div key={step.step} className="group relative card-hover rounded-3xl glass p-8 shadow-lg shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {step.step}
                </div>
                <div className="mb-6">
                  <step.icon className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-xs font-bold text-purple-400 mb-3">{step.time}</div>
                <div className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">{step.title}</div>
                <p className="text-slate-300 font-medium leading-relaxed">{step.description}</p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12" data-aos="fade-up" data-aos-delay="150">
            {[
              { title: 'Instant Setup', description: 'Get started in minutes, not days', icon: LightningIcon },
              { title: 'No Technical Skills Required', description: 'User-friendly interface for everyone', icon: TargetIcon },
              { title: '24/7 Support', description: 'We\'re here to help whenever you need', icon: SupportIcon },
            ].map((feature, index) => (
              <div key={feature.title} className="group card-hover rounded-2xl glass p-8 hover:bg-slate-800/60 transition-all duration-300">
                <feature.icon className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">{feature.title}</div>
                <p className="text-slate-300 font-medium">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of library owners who have already transformed their business. Start your free trial today and see the difference in just 30 minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={handleAuthAction} className="btn-hover inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/40">
                {selectedRole === 'admin' ? 'Register Your Library' : 'Start Your Free Trial'}
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Conditional Section - Book Your Seat or Ready to Get Started */}
      {selectedRole !== 'admin' ? (
        /* Book Your Seat Section - Show for student role or no role selected */
        <section id="book-seat" className="relative bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 py-24 z-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 mb-6 shadow-lg shadow-purple-500/25">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Book Your Seat</span>
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
                Reserve Your Study Space
                <span className="block gradient-text">No Account Required</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-3xl mx-auto">
                Find and book your perfect study seat at one of our partner libraries. 
                Quick, easy, and completely anonymous booking process.
              </p>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="100">
              <AnonymousBookingForm />
            </div>
          </div>
        </section>
      ) : (
        /* Ready to Get Started Section - Show for admin role */
        <section className="relative bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 py-24 z-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 mb-6 shadow-lg shadow-purple-500/25">
                <RocketIcon className="w-4 h-4" />
                <span>Ready to Get Started?</span>
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
                Join hundreds of library owners who have already transformed their business. 
                <span className="block gradient-text">Start your free trial today and see the difference in just 30 minutes.</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-3xl mx-auto mb-8">
                Transform your library into a smart, profitable business with our all-in-one management platform.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={handleAuthAction} className="btn-hover inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/40">
                  Register Your Library
                  <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Powerful Features Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800 py-32 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20" data-aos="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 mb-6 shadow-lg shadow-purple-500/25">
              <RocketIcon className="w-4 h-4" />
              <span>Powerful Features</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
              Everything You Need to
              <span className="block gradient-text">Manage Your Library</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-3xl mx-auto">
              From student management to revenue analytics, our comprehensive platform provides all the tools you need to run a modern, efficient library business.
            </p>
          </div>

          {/* Modern Timeline/List Layout */}
          <div className="max-w-5xl mx-auto mb-20" data-aos="fade-up" data-aos-delay="100">
            <div className="space-y-8">
              {[
                { 
                  title: 'Advanced Analytics', 
                  description: 'Get deep insights into your library\'s performance with AI-powered analytics and predictive modeling.',
                  icon: AnalyticsIcon,
                  color: 'from-purple-500 to-pink-500'
                },
                { 
                  title: 'Student Management', 
                  description: 'Comprehensive student profiles, automated ID generation, and seamless subscription management.',
                  icon: UsersIcon,
                  color: 'from-blue-500 to-cyan-500'
                },
                { 
                  title: 'Smart Seat Management', 
                  description: 'Visual seat mapping, real-time occupancy tracking, and automated seat allocation system.',
                  icon: SeatIcon,
                  color: 'from-green-500 to-emerald-500'
                },
                { 
                  title: 'Payment Processing', 
                  description: 'Integrated payment gateway with automated billing, invoice generation, and payment reminders.',
                  icon: MoneyIcon,
                  color: 'from-yellow-500 to-orange-500'
                },
                { 
                  title: 'Smart Notifications', 
                  description: 'Automated alerts for payments, attendance, and important updates via SMS and email.',
                  icon: BellIcon,
                  color: 'from-red-500 to-pink-500'
                },
                { 
                  title: 'Security & Access', 
                  description: 'Role-based access control, secure data encryption, and comprehensive audit trails.',
                  icon: ShieldIcon,
                  color: 'from-indigo-500 to-purple-500'
                },
                { 
                  title: 'Mobile App', 
                  description: 'Native mobile apps for students and staff with offline capabilities and push notifications.',
                  icon: MobileIcon,
                  color: 'from-teal-500 to-blue-500'
                },
                { 
                  title: 'Time Tracking', 
                  description: 'Accurate time tracking, session management, and automated attendance recording.',
                  icon: ClockIcon,
                  color: 'from-violet-500 to-purple-500'
                },
                { 
                  title: 'Business Intelligence', 
                  description: 'Revenue forecasting, trend analysis, and performance benchmarking against industry standards.',
                  icon: ChartIcon,
                  color: 'from-rose-500 to-pink-500'
                },
              ].map((feature, index) => (
                <div key={feature.title} className="group relative">
                  <div className="flex items-start gap-6 p-6 rounded-2xl hover:bg-slate-800/30 transition-all duration-300 border border-slate-700/30 hover:border-slate-600/50">
                    {/* Icon with gradient background */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-400 font-medium">Active</span>
                        </div>
                      </div>
                      <p className="text-slate-300 font-medium leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-300">
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Connecting line */}
                  {index < 8 && (
                    <div className="absolute left-8 top-20 w-0.5 h-8 bg-gradient-to-b from-slate-600 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-8" data-aos="fade-up" data-aos-delay="150">
            <h3 className="text-2xl font-bold text-white mb-6">Ready to Transform Your Library?</h3>
            <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">
              Join hundreds of library owners who have already modernized their operations with our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={handleAuthAction} className="btn-hover inline-flex items-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/40">
                {selectedRole === 'admin' ? 'Register Your Library' : 'Start Free Trial'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              {!isLoggedIn && selectedRole ? (
                selectedRole === 'admin' ? (
                  <button onClick={handleAuthAction} className="btn-hover inline-flex items-center rounded-2xl glass px-8 py-4 text-lg font-bold text-white ring-2 ring-purple-400/30 hover:ring-purple-400/50">
                    Sign In
                  </button>
                ) : (
                  <a href="#book-seat" className="btn-hover inline-flex items-center rounded-2xl glass px-8 py-4 text-lg font-bold text-white ring-2 ring-purple-400/30 hover:ring-purple-400/50">
                    Book Your Seat
                  </a>
                )
              ) : (
                <a href="#book-seat" className="btn-hover inline-flex items-center rounded-2xl glass px-8 py-4 text-lg font-bold text-white ring-2 ring-purple-400/30 hover:ring-purple-400/50">
                  Book Your Seat
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="relative bg-gradient-to-br from-slate-800 via-purple-900/20 to-slate-900 py-24 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 mb-6 shadow-lg shadow-purple-500/25">
              <QuoteIcon className="w-4 h-4" />
              <span>Success Stories</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
              What Our Customers Say
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-3xl mx-auto">
              Don't just take our word for it. Here's what library owners across India are saying about their experience with Library Connekto.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-16" data-aos="fade-up" data-aos-delay="100">
            {[
              { 
                name: 'Rajesh Kumar', 
                role: 'Library Owner', 
                location: 'Delhi',
                quote: 'Library Connekto transformed my traditional library into a modern, efficient business. The analytics dashboard gives me insights I never had before, and student management is now completely automated.'
              },
              { 
                name: 'Priya Sharma', 
                role: 'Educational Institute Director', 
                location: 'Mumbai',
                quote: 'The seat management system is incredible. Students can book seats in advance, and I can track occupancy in real-time. Our revenue has increased by 35% since implementing this system.'
              },
              { 
                name: 'Amit Patel', 
                role: 'Library Chain Owner', 
                location: 'Bangalore',
                quote: 'Managing multiple library locations was a nightmare before Library Connekto. Now I can monitor all my branches from a single dashboard. The automated billing and payment reminders have reduced my workload significantly.'
              },
            ].map((testimonial, index) => (
              <div key={testimonial.name} className="group card-hover rounded-2xl glass p-8 shadow-lg shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/10">
                <QuoteIcon className="w-8 h-8 text-purple-400 mb-6" />
                <p className="text-slate-300 font-medium leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                    <div className="text-sm text-slate-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3" data-aos="fade-up" data-aos-delay="150">
            <Stat value="500+" label="Happy Customers" />
            <Stat value="4.9/5" label="Average Rating" />
            <Stat value="99.9%" label="Uptime Guarantee" />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-800 py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-800/20" />
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-6 py-3 text-sm font-semibold text-purple-200 mb-8 shadow-lg shadow-purple-500/25">
              <RocketIcon className="w-4 h-4" />
              <span>Transform Your Library Today</span>
            </div>
            
            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white mb-8 leading-tight">
              <span className="block gradient-text">Ready to Revolutionize</span>
              <span className="block gradient-text">Your Library?</span>
            </h2>
            
            {/* Description */}
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 font-medium max-w-4xl mx-auto mb-12 leading-relaxed">
              Join thousands of library owners who have transformed their business with our comprehensive management platform. 
              <span className="text-purple-300 font-semibold"> Start your journey today with our risk-free trial.</span>
            </p>
            
            {/* Features Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-16 max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              {[
                { 
                  icon: '✓', 
                  title: '30-Day Free Trial', 
                  description: 'Full access with no limitations' 
                },
                { 
                  icon: '✓', 
                  title: 'No Setup Fees', 
                  description: 'Zero hidden charges or costs' 
                },
                { 
                  icon: '✓', 
                  title: '24/7 Support', 
                  description: 'Round-the-clock customer assistance' 
                },
                { 
                  icon: '✓', 
                  title: 'Easy Migration', 
                  description: 'Seamless data transfer from existing systems' 
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="rounded-2xl glass p-6 text-center hover:bg-slate-800/40 transition-all duration-300 border border-slate-700/50 hover:border-purple-400/30">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-16" data-aos="fade-up" data-aos-delay="150">
              <button onClick={handleAuthAction} className="group btn-hover inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold text-white shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300">
                <RocketIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                {selectedRole === 'admin' ? 'Register Your Library' : 'Start Your Free Trial'}
                <svg className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              {!isLoggedIn && selectedRole ? (
                selectedRole === 'admin' ? (
                  <button onClick={handleAuthAction} className="group btn-hover inline-flex items-center justify-center rounded-2xl glass px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold text-white ring-2 ring-purple-400/30 hover:ring-purple-400/50 hover:bg-slate-800/40 transition-all duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </button>
                ) : (
                  <a href="#book-seat" className="group btn-hover inline-flex items-center justify-center rounded-2xl glass px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold text-white ring-2 ring-purple-400/30 hover:ring-purple-400/50 hover:bg-slate-800/40 transition-all duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Book Your Seat
                  </a>
                )
              ) : (
                <a href="#book-seat" className="group btn-hover inline-flex items-center justify-center rounded-2xl glass px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold text-white ring-2 ring-purple-400/30 hover:ring-purple-400/50 hover:bg-slate-800/40 transition-all duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Book Your Seat
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto mb-12" data-aos="fade-up" data-aos-delay="200">
              <div className="text-center group">
                <div className="text-4xl sm:text-5xl md:text-6xl font-black gradient-text group-hover:scale-110 transition-transform duration-300 mb-2">500+</div>
                <div className="text-base sm:text-lg text-slate-300 font-semibold">Libraries Transformed</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl sm:text-5xl md:text-6xl font-black gradient-text group-hover:scale-110 transition-transform duration-300 mb-2">40%</div>
                <div className="text-base sm:text-lg text-slate-300 font-semibold">Average Revenue Increase</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl sm:text-5xl md:text-6xl font-black gradient-text group-hover:scale-110 transition-transform duration-300 mb-2">4.9/5</div>
                <div className="text-base sm:text-lg text-slate-300 font-semibold">Customer Satisfaction</div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="250">
              <p className="text-slate-400 font-semibold mb-4 text-lg">Trusted by library owners across India</p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-6 h-6 text-yellow-400" />
                  ))}
                </div>
                <span className="text-slate-300 font-semibold text-lg">4.9/5 from 500+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}


