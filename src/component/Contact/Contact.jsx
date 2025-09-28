import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { 
  RocketIcon, UsersIcon, TargetIcon, ShieldIcon, 
  ClockIcon, LightningIcon, StarIcon, QuoteIcon,
  ChartIcon, SupportIcon, BellIcon, MobileIcon
} from '../Icons/Icons';

// Additional icons for Contact page
const EmailIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ChatIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const VideoIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

function StatCard({ icon: Icon, value, label, delay = 0 }) {
  return (
    <div 
      className="text-center group"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-purple-400" />
      </div>
      <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{value}</div>
      <div className="text-slate-300 font-medium">{label}</div>
    </div>
  );
}

function ContactMethodCard({ icon: Icon, title, status, description, contact, timing, note, comingSoon = false, delay = 0 }) {
  return (
    <div 
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 group relative ${
        comingSoon ? 'opacity-75' : ''
      }`}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      {comingSoon && (
        <div className="absolute -top-3 right-4">
          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Coming Soon
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
            {title}
          </h3>
          <div className={`text-sm font-medium ${comingSoon ? 'text-orange-400' : 'text-green-400'}`}>
            {status}
          </div>
        </div>
      </div>
      
      <p className="text-slate-300 mb-4 leading-relaxed">
        {description}
      </p>
      
      <div className="space-y-3">
        <div className="text-white font-semibold">{contact}</div>
        <div className="text-slate-400 text-sm">{timing}</div>
        <div className="text-slate-300 text-sm">{note}</div>
      </div>
    </div>
  );
}

function OfficeCard({ city, address, phone, email, hours, delay = 0 }) {
  return (
    <div 
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 group"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
          <LocationIcon className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
          {city}
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <LocationIcon className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
          <span className="text-slate-300">{address}</span>
        </div>
        <div className="flex items-center gap-3">
          <PhoneIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <span className="text-slate-300">{phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <EmailIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <span className="text-slate-300">{email}</span>
        </div>
        <div className="flex items-center gap-3">
          <ClockIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <span className="text-slate-300">{hours}</span>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer, delay = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-white font-semibold">{question}</span>
        <svg 
          className={`w-5 h-5 text-purple-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-slate-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Contact() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 80, easing: 'ease-out' });
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    priority: 'Normal',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const stats = [
    { icon: UsersIcon, value: "500+", label: "Libraries Served" },
    { icon: ClockIcon, value: "24hr", label: "Response Time" },
    { icon: StarIcon, value: "99%", label: "Satisfaction Rate" }
  ];

  const contactMethods = [
    {
      icon: EmailIcon,
      title: "Email Support",
      status: "Available",
      description: "Get detailed help via email",
      contact: "support@libraryconnekto.me",
      timing: "Within 24 hours",
      note: "Best for detailed queries"
    },
    {
      icon: PhoneIcon,
      title: "Phone Support",
      status: "Available",
      description: "Speak directly with our team",
      contact: "+91 9982385483",
      timing: "Mon-Fri, 9 AM - 6 PM",
      note: "Urgent issues only"
    },
    {
      icon: ChatIcon,
      title: "Live Chat",
      status: "Coming Soon",
      description: "Instant messaging support",
      contact: "Available on website",
      timing: "Real-time response",
      note: "Coming Soon",
      comingSoon: true
    },
    {
      icon: VideoIcon,
      title: "Video Call",
      status: "Coming Soon",
      description: "Face-to-face consultation",
      contact: "Schedule appointment",
      timing: "By appointment only",
      note: "Premium feature",
      comingSoon: true
    }
  ];

  const offices = [
    {
      city: "Lucknow",
      address: "Tiwariganj uttardhona Lucknow - 226028",
      phone: "+91 98765 43210",
      email: "support@libraryconnekto.me",
      hours: "Mon-Fri: 9 AM - 6 PM"
    },
    {
      city: "Agra",
      address: "KheriaMod Agra - 226001",
      phone: "+91 98765 43211",
      email: "support@libraryconnekto.me",
      hours: "Mon-Fri: 9 AM - 6 PM"
    }
  ];

  const faqs = [
    {
      question: "How quickly can I set up my library?",
      answer: "Most libraries are up and running within 24-48 hours after signup."
    },
    {
      question: "Do you provide training for staff?",
      answer: "Yes, we provide comprehensive training and ongoing support for all staff members."
    },
    {
      question: "What's included in the free trial?",
      answer: "Full access to all features for 14 days, including setup assistance and support."
    },
    {
      question: "Can I integrate with existing systems?",
      answer: "Yes, we support integration with most existing library management systems."
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
              <SupportIcon className="w-4 h-4" />
              <span>24/7 Support Coming Soon</span>
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-white mb-6" data-aos="fade-up" data-aos-delay="100">
              <span className="block gradient-text">Get in Touch</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed mb-8" data-aos="fade-up" data-aos-delay="200">
              Have questions about Library Connekto? Our expert team is here to help you transform your library into a smart study hub.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
              <span className="gradient-text">Choose Your Preferred Contact Method</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Select the best way to reach us based on your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <ContactMethodCard
                key={index}
                icon={method.icon}
                title={method.title}
                status={method.status}
                description={method.description}
                contact={method.contact}
                timing={method.timing}
                note={method.note}
                comingSoon={method.comingSoon}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
              <span className="gradient-text">Send us a Message</span>
            </h2>
            <p className="text-xl text-slate-300" data-aos="fade-up" data-aos-delay="100">
              Fill out the form below and we'll get back to you soon
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8" data-aos="fade-up" data-aos-delay="200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Priority Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What's this about?"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
              <span className="gradient-text">Our Offices</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <OfficeCard
                key={index}
                city={office.city}
                address={office.address}
                phone={office.phone}
                email={office.email}
                hours={office.hours}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6" data-aos="fade-up">
              <span className="gradient-text">Quick FAQ</span>
            </h2>
            <p className="text-xl text-slate-300" data-aos="fade-up" data-aos-delay="100">
              Common questions and answers
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
