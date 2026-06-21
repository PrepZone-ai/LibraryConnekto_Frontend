import { HERO_IMAGES, APP_LOGO_URL } from '../../lib/assets';
import { RocketIcon } from '../Icons/Icons';

/**
 * App home hero — moving carousel visible behind a glass content card.
 */
export default function AppHomeHero({
  badge,
  title,
  subtitle,
  children,
}) {
  return (
    <section className="app-home-hero relative isolate overflow-hidden">
      <div className="app-home-hero-bg absolute inset-0 z-0">
        <div className="hero-carousel app-home-hero-carousel" aria-hidden="true">
          <div className="hero-carousel-track">
            {HERO_IMAGES.concat(HERO_IMAGES).map((src, index) => (
              <div key={`${src}-${index}`} className="hero-carousel-slide app-home-hero-slide">
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 app-home-hero-overlay" />
        <div className="hero-orb hero-orb-violet app-home-hero-orb z-[1]" aria-hidden="true" />
        <div className="hero-orb hero-orb-rose app-home-hero-orb z-[1]" aria-hidden="true" />
      </div>

      <div className="relative z-20 px-4 py-5">
        <div className="app-home-hero-panel rounded-2xl overflow-hidden">
          <div className="px-4 py-5">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={APP_LOGO_URL}
                alt="Library Connekto"
                className="h-12 w-12 rounded-xl shadow-lg ring-2 ring-white/30 bg-white/95 object-contain p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-100">
                  Library Connekto
                </p>
                {badge && (
                  <span className="app-home-hero-badge mt-1 inline-flex items-center gap-1.5">
                    <RocketIcon className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                    <span>{badge}</span>
                  </span>
                )}
              </div>
            </div>

            {title && (
              <h1 className="app-home-hero-title text-2xl font-bold text-white leading-snug mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="app-home-hero-subtitle text-sm leading-relaxed">{subtitle}</p>
            )}
            {children && <div className="mt-4 flex flex-wrap gap-3">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
