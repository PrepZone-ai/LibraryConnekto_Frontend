import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import AnonymousBookingForm from '../Booking/AnonymousBookingForm';
import { 
  AnalyticsIcon, UsersIcon, SeatIcon, MoneyIcon, 
  SettingsIcon, ClockIcon, LightningIcon, TargetIcon, SupportIcon,
  ShieldIcon, BellIcon, MobileIcon, ChartIcon, StarIcon, QuoteIcon,
  RocketIcon
} from '../Icons/Icons';

// Additional icons for services
const BookIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const LocationIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const QRIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const BrainIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const NetworkIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

function ServiceCard({ icon: Icon, title, description, features, popular = false, delay = 0 }) {
  return (
    <div 
      className="relative group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
          {title}
        </h3>
      </div>
      
      <p className="text-slate-300 mb-6 leading-relaxed">
        {description}
      </p>
      
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-slate-300">
            <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, stat, delay = 0 }) {
  return (
    <div 
      className="text-center group"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-300 mb-3">{description}</p>
      {stat && (
        <div className="text-2xl font-black gradient-text">{stat}</div>
      )}
    </div>
  );
}

export default function Services() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 80, easing: 'ease-out' });
  }, []);

  const openRoleModal = () => window.dispatchEvent(new Event('open-role-modal'));

  const coreServices = [
    {
      icon: BrainIcon,
      title: "AI-Powered Analytics",
      description: "Advanced AI dashboard providing deep insights into student behavior, peak hours, occupancy patterns, and revenue optimization strategies.",
      features: [
        "Real-time occupancy tracking",
        "Predictive analytics",
        "Revenue optimization",
        "Student behavior insights"
      ],
      popular: true
    },
    {
      icon: QRIcon,
      title: "Smart Attendance System",
      description: "Geo-fenced attendance marking with QR code scanning for seamless student check-ins, tracking, and automated attendance reports.",
      features: [
        "QR code check-in",
        "Geo-fencing technology",
        "Automated reports",
        "Real-time tracking"
      ]
    },
    {
      icon: MoneyIcon,
      title: "Integrated Payment Gateway",
      description: "Secure payment processing for seat bookings, subscriptions, and study materials with automated reconciliation and instant receipts.",
      features: [
        "Multiple payment options",
        "Automated billing",
        "Instant receipts",
        "Secure transactions"
      ]
    },
    {
      icon: BookIcon,
      title: "Digital Study Resources",
      description: "Comprehensive library of previous year papers, affordable e-books, mock tests, and exam-specific study materials.",
      features: [
        "10,000+ study resources",
        "Previous year papers",
        "Mock tests",
        "E-book library"
      ]
    },
    {
      icon: LocationIcon,
      title: "Multi-Location Network",
      description: "Single membership access across multiple library locations with seamless booking and unified student management.",
      features: [
        "500+ partner libraries",
        "Single membership",
        "Cross-location booking",
        "Unified access"
      ]
    },
    {
      icon: SupportIcon,
      title: "24/7 Support System",
      description: "Round-the-clock technical support and customer service ensuring smooth operations and immediate issue resolution.",
      features: [
        "24/7 availability",
        "Technical support",
        "Customer service",
        "Issue resolution"
      ]
    }
  ];

  const studentFeatures = [
    {
      icon: LocationIcon,
      title: "Smart Library Discovery",
      description: "Find nearby libraries with real-time availability, amenities, and ratings",
      stat: "500+ Libraries"
    },
    {
      icon: SeatIcon,
      title: "Instant Seat Booking",
      description: "Reserve your perfect study spot with integrated payments and confirmations",
      stat: "100% guaranteed seats"
    },
    {
      icon: BrainIcon,
      title: "AI Study Planner",
      description: "Personalized study schedules based on your exam goals and preferences",
      stat: "40% better results"
    },
    {
      icon: MobileIcon,
      title: "Mobile App Access",
      description: "Complete library management through our intuitive mobile application",
      stat: "iOS & Android"
    }
  ];

  const ownerFeatures = [
    {
      icon: ChartIcon,
      title: "Business Analytics",
      description: "Comprehensive dashboard with revenue tracking, occupancy rates, and growth metrics",
      stat: "+40% Revenue Growth"
    },
    {
      icon: UsersIcon,
      title: "Student Management",
      description: "Automated ID generation, bulk uploads, subscription tracking, and student profiles",
      stat: "Save 5+ hours daily"
    },
    {
      icon: SeatIcon,
      title: "Seat Management",
      description: "Visual seat mapping with real-time occupancy status and booking management",
      stat: "95% efficiency boost"
    },
    {
      icon: ShieldIcon,
      title: "Security & Compliance",
      description: "Data security, privacy compliance, and secure payment processing",
      stat: "100% secure data"
    }
  ];

  const additionalFeatures = [
    {
      icon: ClockIcon,
      title: "Time Management",
      description: "Track study hours, set goals, and monitor productivity with detailed analytics",
      stat: "Boost productivity by 35%"
    },
    {
      icon: TargetIcon,
      title: "Performance Tracking",
      description: "Monitor academic progress, attendance patterns, and achievement milestones",
      stat: "Track success metrics"
    },
    {
      icon: NetworkIcon,
      title: "Community Features",
      description: "Connect with fellow students, join study groups, and share resources",
      stat: "Build study networks"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header />

      {/* Hero Section */}
      <section className="relative isolate pt-16 md:pt-20 overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 mb-6 shadow-lg shadow-purple-500/25" data-aos="fade-up">
              <RocketIcon className="w-4 h-4" />
              <span>Complete Library Solutions</span>
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-white mb-6" data-aos="fade-up" data-aos-delay="100">
              <span className="block gradient-text">Our Services</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed mb-8" data-aos="fade-up" data-aos-delay="200">
              Comprehensive solutions for modern library management and enhanced student learning experiences. 
              Everything you need to transform your library into a smart, efficient business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="300">
              <button onClick={openRoleModal} className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                Get Started Today
              </button>
            <a href="#book-seat" className="px-8 py-4 border border-purple-400/50 text-purple-300 font-bold rounded-xl hover:bg-purple-500/10 transition-all duration-300 hover:scale-105">
              Book your seat
            </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
              <span className="gradient-text">Core Services</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Everything you need for smart library management in one comprehensive platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreServices.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
                features={service.features}
                popular={service.popular}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* For Students */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
              <span className="gradient-text">For Students</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Enhance your study experience with smart tools designed for academic success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {studentFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                stat={feature.stat}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* For Library Owners */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
              <span className="gradient-text">For Library Owners</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Powerful tools to grow your library business and maximize revenue potential
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ownerFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                stat={feature.stat}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
              <span className="gradient-text">Additional Features</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Extra tools and features to enhance your overall library experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                stat={feature.stat}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
            <span className="gradient-text">Ready to Transform Your Library?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8" data-aos="fade-up" data-aos-delay="100">
            Join thousands of library owners who have already revolutionized their business with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="200">
            <button onClick={openRoleModal} className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
              Start Free Trial
            </button>
            <a href="#book-seat" className="px-8 py-4 border border-purple-400/50 text-purple-300 font-bold rounded-xl hover:bg-purple-500/10 transition-all duration-300 hover:scale-105">
              Book your seat
            </a>
          </div>
        </div>
      </section>

      {/* Book Your Seat Section */}
      <section id="book-seat" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 mb-6 shadow-lg shadow-purple-500/25">
              <SeatIcon className="w-4 h-4" />
              <span>Book Your Seat</span>
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
              Reserve Your Study Space
            </h2>
            <p className="text-xl text-slate-300 font-medium max-w-3xl mx-auto">
              No account required! Simply fill out the form below to request a seat at one of our partner libraries. 
              Our library admins will review your request and contact you for confirmation.
            </p>
          </div>
          
          <div data-aos="fade-up" data-aos-delay="100">
            <AnonymousBookingForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
