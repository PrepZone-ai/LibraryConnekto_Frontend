/** Alternating left/right scroll reveal — CSS classes + data attribute for observer */
export function scrollCardReveal(index, staggerMs = 90) {
  return {
    'data-scroll-reveal': 'true',
    revealClassName: index % 2 === 0 ? 'scroll-reveal-left' : 'scroll-reveal-right',
    style: { transitionDelay: `${index * staggerMs}ms` },
  };
}

/** Horizontal strip / timeline rows */
export function scrollStripReveal(index, staggerMs = 100) {
  return {
    'data-scroll-reveal': 'true',
    revealClassName: index % 2 === 0 ? 'scroll-reveal-left' : 'scroll-reveal-right',
    style: { transitionDelay: `${Math.min(index * staggerMs, 400)}ms` },
  };
}

/** Merge scroll reveal props with an element's existing className */
export function withScrollReveal(index, baseClassName, staggerMs = 90, strip = false) {
  const reveal = strip ? scrollStripReveal(index, staggerMs) : scrollCardReveal(index, staggerMs);
  return {
    'data-scroll-reveal': reveal['data-scroll-reveal'],
    className: `scroll-reveal ${reveal.revealClassName} ${baseClassName}`.trim(),
    style: reveal.style,
  };
}
