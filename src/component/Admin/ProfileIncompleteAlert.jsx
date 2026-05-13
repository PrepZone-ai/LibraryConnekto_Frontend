import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileIncompleteAlert = ({ profileData }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!profileData) return;

    const { is_complete, bank_details_complete } = profileData;

    if (is_complete && !bank_details_complete) {
      const dismissed = sessionStorage.getItem('profile_alert_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [profileData]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('profile_alert_dismissed', 'true');
  };

  const handleCompleteProfile = () => {
    navigate('/admin/profile');
    setTimeout(() => {
      const bankSection = document.getElementById('bank-details-section');
      if (bankSection) {
        bankSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="mb-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-l-2 border-amber-500 rounded-md px-2.5 py-1.5 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p className="text-xs font-medium text-white truncate flex-1 min-w-0">
            Complete Your Profile — Add bank details for payouts &amp; settlements.
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleCompleteProfile}
              className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium rounded hover:from-amber-600 hover:to-orange-600 transition-colors duration-200 whitespace-nowrap"
            >
              Complete Now
            </button>
            <button
              onClick={handleDismiss}
              className="text-[10px] text-white/60 hover:text-white transition-colors duration-200 whitespace-nowrap"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/40 hover:text-white transition-colors duration-200 flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProfileIncompleteAlert;
