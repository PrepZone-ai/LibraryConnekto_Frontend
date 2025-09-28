import { Link } from 'react-router-dom';

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
              <div className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@libraryconnekto.me</span>
                <span>sandeep@libraryconnekto.me</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Rahul Nagar, KheriaMod Agra 282001</span>
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
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Download Our Mobile App</h3>
            <p className="text-slate-300 mb-6">Access your library management on the go with our mobile app</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h7v7H3V3zm1 1v5h5V4H4zm7-1h7v7h-7V3zm1 1v5h5V4h-5zM3 11h7v7H3v-7zm1 1v5h5v-5H4zm7 0h7v7h-7v-7zm1 1v5h5v-5h-5z"/>
                    </svg>
                    <div className="text-xs">QR Code</div>
                  </div>
                </div>
              </div>
              
              {/* Download Links */}
              <div className="flex flex-col gap-4">
                <a href="#download-ios" className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-sm">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </a>
                
                <a href="#download-android" className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.0589 13.8533 7.8505 12 7.8505s-3.5902.2084-5.1367.5954L4.841 4.943a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-sm">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
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
