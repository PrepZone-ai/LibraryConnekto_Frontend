/** Reset every common document scroll root (SPA layouts often scroll html, not window). */
export function scrollToTop() {
  if (typeof window === 'undefined') return;

  window.scrollTo(0, 0);

  const scrollingElement = document.scrollingElement;
  if (scrollingElement) {
    scrollingElement.scrollTop = 0;
    scrollingElement.scrollLeft = 0;
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const root = document.getElementById('root');
  if (root) {
    root.scrollTop = 0;
  }
}
