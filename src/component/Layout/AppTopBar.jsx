import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ASSETS } from '../../lib/assets';
import { getPageTitle } from '../../lib/pageTitles';

const BACK_ROUTES = ['/library/', '/book-seat', '/payment/', '/transfer/payment'];

export default function AppTopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = getPageTitle(pathname);
  const showBack = BACK_ROUTES.some((r) => pathname.startsWith(r) || pathname === r.replace(/\/$/, ''));

  return (
    <header className="fixed inset-x-0 top-0 z-50 safe-area-top bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex h-14 items-center justify-between px-4">
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
      </div>
    </header>
  );
}
