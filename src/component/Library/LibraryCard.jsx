import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '../../lib/api';
import { ASSETS } from '../../lib/assets';

import { withScrollReveal } from '../../utils/scrollAnimations';

const LibraryCard = ({ library, animationIndex }) => {
  const navigate = useNavigate();
  
  const availableSeats = library.total_seats - library.occupied_seats;
  const occupancyPercentage = (library.occupied_seats / library.total_seats) * 100;
  
  // Get the first image or use a placeholder
  const primaryImage = library.facility_images && library.facility_images.length > 0
    ? resolveMediaUrl(library.facility_images[0])
    : ASSETS.lib;
  
  // Truncate description to 80 characters
  const truncatedDescription = library.facility_description
    ? library.facility_description.slice(0, 80) + (library.facility_description.length > 80 ? '...' : '')
    : 'Explore our modern library facilities with comfortable study spaces, high-speed WiFi...';
  
  const handleViewDetails = () => {
    navigate(`/library/${library.id}`);
  };
  
  const cardClassName =
    'group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer transform hover:-translate-y-1';

  return (
    <div
      {...(animationIndex !== undefined
        ? withScrollReveal(animationIndex, cardClassName)
        : { className: cardClassName })}
      onClick={handleViewDetails}
    >
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={primaryImage}
          alt={library.library_name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            if (e.currentTarget.src !== ASSETS.lib) {
              e.currentTarget.src = ASSETS.lib;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        
        {/* Distance Badge */}
        {library.distance !== null && library.distance !== undefined && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-[11px] font-semibold rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {library.distance.toFixed(1)} km
          </div>
        )}
        
        {/* Seat Availability Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold rounded-full">
          {availableSeats > 0 ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {availableSeats} seats available
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              Fully Booked
            </span>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* Library Name */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300 line-clamp-1">
          {library.library_name}
        </h3>
        
        {/* Address */}
        <p className="text-xs text-slate-400 mb-3 flex items-start gap-2 line-clamp-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{library.address}</span>
        </p>
        
        {/* Description */}
        <p className="text-xs text-slate-300 mb-3 line-clamp-2">
          {truncatedDescription}
        </p>
        
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-3 text-[11px]">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              {library.occupied_seats}/{library.total_seats}
            </span>
            {library.has_shift_system && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-[11px] font-medium">
                Shift System
              </span>
            )}
          </div>
        </div>
        
        {/* Occupancy Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Occupancy</span>
            <span className="font-bold">{occupancyPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                occupancyPercentage > 80
                  ? 'bg-red-500'
                  : occupancyPercentage > 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>
        
        {/* View Details Button */}
        <button
          className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 group-hover:from-purple-700 group-hover:to-pink-700"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          View Details
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Image Count Indicator */}
      {library.facility_images && library.facility_images.length > 1 && (
        <div className="absolute bottom-20 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          +{library.facility_images.length - 1}
        </div>
      )}
    </div>
  );
};

export default LibraryCard;
