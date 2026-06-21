import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import AppTopBar from './AppTopBar';
import AppBottomNav from './AppBottomNav';
import { useAppMode } from '../../hooks/useAppMode';
import { shouldHideBottomNav } from '../../lib/appShellRoutes';
import { scrollToTop } from '../../utils/scrollToTop';

export default function AppLayout() {
  const { pathname, hash } = useLocation();
  const { isApp, isCapacitor } = useAppMode();
  const hideBottomNav = shouldHideBottomNav(pathname);

  useLayoutEffect(() => {
    if (hash) return;
    scrollToTop();
  }, [pathname, hash]);

  const shellKey = isCapacitor ? 'capacitor' : isApp ? 'app-preview' : 'website';

  // Website: full header + footer, no app padding
  // App: slim top bar + bottom nav, safe-area padding on main
  const mainClassName = isApp
    ? ['flex-1', 'pt-app-topbar', hideBottomNav ? '' : 'pb-bottom-nav'].filter(Boolean).join(' ')
    : 'flex-1';

  return (
    <div className={`app-page-bg min-h-screen flex flex-col ${isApp ? 'app-shell' : 'website-shell'}`}>
      {isApp ? <AppTopBar /> : <Header />}
      <main className={mainClassName}>
        <Outlet key={`${shellKey}-${pathname}`} />
      </main>
      {isApp ? (!hideBottomNav && <AppBottomNav />) : <Footer />}
    </div>
  );
}
