import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../../utils/scrollToTop';

function isInternalRouteHref(href) {
  if (!href || href.startsWith('#')) return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  return href.startsWith('/') || !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Reset before paint when the route changes (Link clicks and navigate()).
  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }

    scrollToTop();
    requestAnimationFrame(scrollToTop);
  }, [pathname, hash]);

  // Scroll immediately on internal link clicks, before React paints the next page.
  useEffect(() => {
    const onDocumentClick = (event) => {
      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!isInternalRouteHref(href)) return;

      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname && url.hash) return;

      scrollToTop();
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, []);

  return null;
}
