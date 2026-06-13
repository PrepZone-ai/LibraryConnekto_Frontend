import DownloadAppButton from '../common/DownloadAppButton';
import useScrollReveal from '../../hooks/useScrollReveal';
import { withScrollReveal } from '../../utils/scrollAnimations';
import {
  ClockIcon,
  RocketIcon,
  StarIcon,
  TargetIcon,
  UsersIcon
} from '../Icons/Icons';

// Additional icons for About page
const MissionIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const VisionIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ValuesIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

function StatCard({ icon: Icon, value, label, animationIndex = 0 }) {
  return (
    <div {...withScrollReveal(animationIndex, 'text-center group', 100)}>
      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-purple-400" />
      </div>
      <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{value}</div>
      <div className="text-slate-300 font-medium">{label}</div>
    </div>
  );
}

function ValueCard({ icon: Icon, title, description, features, animationIndex = 0 }) {
  const cardClass =
    'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 group';

  return (
    <div {...withScrollReveal(animationIndex, cardClass, 100)}>
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

export default function About() {
  useScrollReveal();

  const stats = [
    { icon: UsersIcon, value: "500+", label: "Partner Libraries\nAcross India" },
    { icon: TargetIcon, value: "50K+", label: "Active Students\nDaily users" },
    { icon: StarIcon, value: "95%", label: "Success Rate\nCustomer satisfaction" },
    { icon: ClockIcon, value: "24/7", label: "Support Available\nAlways here for you" }
  ];

  const coreValues = [
    {
      icon: MissionIcon,
      title: "Our Mission",
      description: "To revolutionize the library ecosystem in India by connecting students with quality study spaces and empowering library owners with smart management tools.",
      features: [
        "Smart technology integration",
        "Seamless user experience",
        "Data-driven insights"
      ]
    },
    {
      icon: VisionIcon,
      title: "Our Vision",
      description: "To become India's largest network of smart libraries, making quality education accessible to every student across the country.",
      features: [
        "Nationwide coverage",
        "Quality education access",
        "Technology-driven growth"
      ]
    },
    {
      icon: ValuesIcon,
      title: "Our Values",
      description: "We believe in innovation, accessibility, and creating meaningful connections between students and learning spaces.",
      features: [
        "Innovation first",
        "Accessibility for all",
        "Community building"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-body">
      {/* Hero Section */}
      <section className="relative isolate pt-16 md:pt-20 overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">
          <div className="text-center max-w-4xl mx-auto relative z-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 backdrop-blur-sm ring-1 ring-purple-400/30 px-4 py-2 text-sm font-medium text-purple-200 mb-6 shadow-lg shadow-purple-500/25">
              <RocketIcon className="w-4 h-4" />
              <span>Our Story</span>
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-white mb-6">
              <span className="block gradient-text">About Library</span>
              <span className="block gradient-text">Connekto</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed mb-8">
              Transforming India's library ecosystem through technology, connecting students with quality study spaces, 
              and empowering library owners with smart management solutions.
            </p>
            
            <div className="flex flex-col lg:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                Join Our Mission
              </button>
              <button className="px-8 py-4 border border-purple-400/50 text-purple-300 font-bold rounded-xl hover:bg-purple-500/10 transition-all duration-300 hover:scale-105">
                Contact Us
              </button>
              <DownloadAppButton variant="secondary" size="default" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-slate-900/50 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                animationIndex={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="relative py-20 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              <span className="gradient-text">Our Core Values</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              The principles that guide everything we do and drive our commitment to excellence
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <ValueCard
                key={index}
                icon={value.icon}
                title={value.title}
                description={value.description}
                features={value.features}
                animationIndex={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50 z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="gradient-text">Join Our Mission</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Be part of the revolution that's transforming how students learn and libraries operate across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
              Partner With Us
            </button>
            <button className="px-8 py-4 border border-purple-400/50 text-purple-300 font-bold rounded-xl hover:bg-purple-500/10 transition-all duration-300 hover:scale-105">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
