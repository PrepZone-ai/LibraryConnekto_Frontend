import { useState } from 'react';
import DownloadAppButton from './DownloadAppButton';

const DownloadAppSection = ({ className = '' }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = new URL('../../assets/LibraryConnekto.apk', import.meta.url).href;
      link.download = 'LibraryConnekto.apk';
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-slate-800/50 to-purple-900/20 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 ${className}`}>
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - App Info & Download */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white gradient-text">Download Our Mobile App</h3>
              <p className="text-slate-400 text-sm">Available for Android devices</p>
            </div>
          </div>
          
          <p className="text-slate-300 mb-6 leading-relaxed">
            Access your library management on the go with our mobile app.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <DownloadAppButton 
              variant="primary" 
              size="default" 
              onClick={handleDownload}
              className="px-6 py-3 text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
            />
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.0589 13.8533 7.8505 12 7.8505s-3.5902.2084-5.1367.5954L4.841 4.943a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
              </svg>
              <span className="text-sm">Android APK</span>
            </div>
          </div>
        </div>
        
        {/* Right Side - Features */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-300">Free Download</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-300">No Registration</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-300">Offline Access</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-300">Secure & Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppSection;
