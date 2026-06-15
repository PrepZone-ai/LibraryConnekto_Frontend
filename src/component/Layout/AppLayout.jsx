import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { scrollToTop } from '../../utils/scrollToTop';

export default function AppLayout() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    scrollToTop();
  }, [pathname, hash]);

  return (
    <div className="app-page-bg min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet key={pathname} />
      </main>
      <Footer />
    </div>
  );
}
