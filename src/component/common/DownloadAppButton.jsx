import { useState } from 'react';

const DownloadAppButton = ({ 
  variant = 'primary', 
  size = 'default', 
  showIcon = true, 
  className = '',
  onClick = null 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (onClick) {
      onClick();
      return;
    }

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
        // You can add a toast notification here if needed
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500';
    
    const sizeClasses = {
      small: 'px-4 py-2 text-sm rounded-lg',
      default: 'px-6 py-3 text-base rounded-xl',
      large: 'px-8 py-4 text-sm rounded-2xl'
    };
    
    const variantClasses = {
      primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30',
      secondary: 'bg-slate-800/50 backdrop-blur-sm border border-purple-400/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/50',
      outline: 'border-2 border-purple-400/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/70',
      ghost: 'text-purple-300 hover:bg-purple-500/10 hover:text-purple-200'
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getIcon = () => {
    if (isDownloading) {
      return (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={getButtonClasses()}
      title="Download Library Connekto Mobile App"
    >
      {showIcon && (
        <span className="mr-2">
          {getIcon()}
        </span>
      )}
      <span className="text-center">
        {isDownloading ? 'Downloading...' : 'Download App'}
      </span>
    </button>
  );
};

export default DownloadAppButton;
