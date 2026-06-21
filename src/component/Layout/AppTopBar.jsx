import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ASSETS } from '../../lib/assets';
import { getPageTitle } from '../../lib/pageTitles';
import { useAuth } from '../../contexts/AuthContext';
import SelectRoleModal from '../Auth/SelectRoleModal';

const BACK_ROUTES = ['/library/', '/book-seat', '/payment/', '/transfer/payment'];

export default function AppTopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, selectedRole, setRole, clearRole } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const title = getPageTitle(pathname);
  const showBack = BACK_ROUTES.some((r) => pathname.startsWith(r) || pathname === r.replace(/\/$/, ''));

  useEffect(() => {
    const openRoleModal = () => setShowRoleModal(true);
    window.addEventListener('open-role-modal', openRoleModal);
    return () => window.removeEventListener('open-role-modal', openRoleModal);
  }, []);

  const handleSelectRole = (role) => {
    setRole(role);
    setShowRoleModal(false);
  };

  const handleClearRole = () => {
    clearRole();
    navigate('/', { replace: true });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 safe-area-top bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 shrink-0"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <Link to="/" className="shrink-0">
                <img src={ASSETS.logo} alt="Library Connekto" className="h-8 w-8 rounded-lg" />
              </Link>
            )}
            <span className="text-base font-semibold text-white truncate">
              {title || 'Library Connekto'}
            </span>
          </div>

          {!isLoggedIn && (
            <div className="flex items-center gap-1 shrink-0">
              {selectedRole ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-100"
                    title="Change role"
                    aria-label={`Change role (currently ${selectedRole})`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        selectedRole === 'admin' ? 'bg-pink-400' : 'bg-purple-400'
                      }`}
                    />
                    <span className="text-xs font-semibold">
                      {selectedRole === 'admin' ? 'Admin' : 'Student'}
                    </span>
                    <svg className="w-3 h-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearRole}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    title="Clear role"
                    aria-label="Clear role selection"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRoleModal(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-200 border border-purple-400/30 bg-purple-500/10"
                >
                  Choose role
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <SelectRoleModal
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelect={handleSelectRole}
        appMode
      />
    </>
  );
}
