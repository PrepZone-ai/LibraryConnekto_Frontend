import { Link } from 'react-router-dom';
import DownloadAppSection from '../common/DownloadAppSection';

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
              <div className="h-12 w-12 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25">
                <img 
                  src={new URL('../../assets/Logo.png', import.meta.url).href} 
                  alt="Library Connekto Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Library Connekto
              </span>
            </Link>
            <p className="text-slate-300 mb-8 leading-relaxed text-lg max-w-md">
              Transforming library management with smart technology. Connect students, optimize spaces, and grow your business with our comprehensive platform.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col gap-1 text-slate-300">
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@libraryconnekto.me
                </span>
              
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  sandeep@libraryconnekto.me
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 9982385483</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Uttardhona Ayodhya Road Lucknow 226028</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-slate-300 font-medium">Follow us:</span>
              <div className="flex items-center gap-3">
                {[
                  { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                  { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
                  { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                  { name: 'Instagram', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 2h11a2 2 0 012 2v11a2 2 0 01-2 2h-11a2 2 0 01-2-2V4a2 2 0 012-2z' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200 hover:scale-110"
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Product Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Features</h3>
            <ul className="space-y-4">
              {[
                { name: 'Student Management', href: '/admin/students' },
                { name: 'Seat Management', href: '/admin/seats' },
                { name: 'Analytics Dashboard', href: '/admin/analytics' },
                { name: 'Booking Management', href: '/admin/booking-management' },
                { name: 'Attendance Tracking', href: '/admin/attendance-details' },
                { name: 'Revenue Analytics', href: '/admin/revenue-details' },
                { name: 'Mobile App', href: '#mobile-app' },
                { name: 'Payment Gateway', href: '#payment' }
              ].map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-slate-300 hover:text-purple-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-slate-300 hover:text-purple-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-slate-300 hover:text-purple-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-purple-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#partner-libraries" className="text-slate-300 hover:text-purple-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                  Partner Libraries
                </a>
              </li>
              <li>
                <a href="#become-partner" className="text-slate-300 hover:text-purple-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                  Become a Partner
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-slate-300 hover:text-purple-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          
          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Support & Legal</h3>
            <ul className="space-y-4">
              {[
                { name: 'Help Center', href: '#help' },
                { name: 'Student Guide', href: '#student-guide' },
                { name: 'Admin Guide', href: '#admin-guide' },
                { name: 'Privacy Policy', href: '#privacy' },
                { name: 'Terms of Service', href: '#terms' },
                { name: 'Refund Policy', href: '#refund' },
                { name: 'Data Security', href: '#security' },
                { name: 'System Status', href: '#status' }
              ].map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-slate-300 hover:text-purple-400 transition-colors duration-200 hover:translate-x-1 transform inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Mobile App Section */}
        <div className="mt-16 pt-8 border-t border-slate-700/50">
          <DownloadAppSection />
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-700/50 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-slate-400">
            © 2025 Library Connekto. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-slate-400">
            <span className="text-sm">Trusted by 500+ Libraries</span>
            <span className="text-sm">•</span>
            <span className="text-sm">10,000+ Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
