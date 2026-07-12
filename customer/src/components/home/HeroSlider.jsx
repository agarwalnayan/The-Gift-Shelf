import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

// Replaces the previously static hero section with an auto-rotating slider
// driven by admin-managed Hero Banners. Falls back to the original static
// copy when no banners are configured, so the homepage never looks broken
// before an admin has set anything up.
const HeroSlider = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="border-b border-charcoal/10 bg-primary-50">
        <div className="container-tgs grid items-center gap-10 py-14 sm:py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary-600">Curated with care</p>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-charcoal sm:text-4xl md:text-5xl">
              Gifts that say what words can't.
            </h1>
            <p className="mt-5 max-w-md text-base text-charcoal/70">
              Discover thoughtfully sourced gifts for every relationship, milestone, and moment worth celebrating.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary inline-flex">
                Shop the collection
              </Link>
              <Link to="/categories" className="btn-secondary inline-flex">
                Browse categories
              </Link>
            </div>
          </div>
          <div className="aspect-[4/3] w-full rounded-3xl bg-primary-100" />
        </div>
      </section>
    );
  }

  const banner = banners[activeIndex];
  const isExternal = /^https?:\/\//.test(banner.ctaLink || '');

  return (
    <section className="relative overflow-hidden border-b border-charcoal/10 bg-primary-50">
      <div className="container-tgs grid items-center gap-10 py-14 sm:py-20 md:grid-cols-2 md:py-28">
        <div>
          {banner.subtitle && (
            <p className="text-sm font-medium uppercase tracking-widest text-primary-600">{banner.subtitle}</p>
          )}
          {banner.title && (
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-charcoal sm:text-4xl md:text-5xl">
              {banner.title}
            </h1>
          )}
          {banner.description && <p className="mt-5 max-w-md text-base text-charcoal/70">{banner.description}</p>}
          {banner.ctaText && banner.ctaLink && (
            <div className="mt-8 flex flex-wrap gap-3">
              {isExternal ? (
                <a href={banner.ctaLink} className="btn-primary inline-flex" target="_blank" rel="noreferrer">
                  {banner.ctaText}
                </a>
              ) : (
                <Link to={banner.ctaLink} className="btn-primary inline-flex">
                  {banner.ctaText}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-primary-100">
          {banner.image?.url && (
            <img src={banner.image.url} alt={banner.title || ''} className="h-full w-full object-cover" />
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow hover:bg-white sm:flex"
          >
            <HiChevronLeft size={20} />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow hover:bg-white sm:flex"
          >
            <HiChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === activeIndex ? 'w-6 bg-primary-600' : 'bg-primary-600/30'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
