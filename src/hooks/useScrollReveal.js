import { useEffect } from 'react';

/**
 * Observes [data-scroll-reveal] elements and toggles .is-visible on scroll.
 * Re-runs when deps change (e.g. libraries loaded) to pick up new cards.
 */
export default function useScrollReveal(deps = []) {
  useEffect(() => {
    let observer;

    const observeElements = () => {
      const elements = document.querySelectorAll('[data-scroll-reveal]:not(.is-visible)');
      if (!elements.length) return;

      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      elements.forEach((el) => observer.observe(el));
    };

    observeElements();
    const raf = requestAnimationFrame(observeElements);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
