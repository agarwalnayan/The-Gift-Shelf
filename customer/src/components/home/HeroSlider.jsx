import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

/**
 * Full-width ecommerce hero banner slider (premium gifting site style).
 * - No split left/right layout: every slide is a single edge-to-edge image.
 * - Only admin-uploaded images are ever shown (desktop `image`, optional
 *   mobile `mobileImage` via <picture>) — no illustrative/stock fallback.
 * - `isLoading` (from MarketingContext, true until the homepage bundle has
 *   actually returned) gates everything: while loading, only a skeleton is
 *   shown. The old bug rendered a fallback hero immediately, then swapped
 *   to real banners once the fetch resolved, causing a visible flicker.
 *   Now nothing "final" renders until data is ready, so there's exactly one
 *   paint of the real content and no flicker.
 */
const HeroSlider = ({ banners, isLoading }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [banners]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const heightClasses = 'h-[220px] sm:h-[340px] md:h-[440px] lg:h-[520px]';

  if (isLoading) {
    return (
      <section className={`relative w-full overflow-hidden bg-primary-50 ${heightClasses}`}>
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-primary-100 via-primary-50 to-primary-100" />
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const goTo = (index) => setActiveIndex((index + banners.length) % banners.length);

  return (
    <section className={`relative w-full overflow-hidden bg-charcoal/5 ${heightClasses}`}>
      {banners.map((banner, index) => {
        const isExternal = /^https?:\/\//.test(banner.ctaLink || '');
        const isActive = index === activeIndex;

        return (
          <div
            key={banner._id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <picture>
              {banner.mobileImage?.url && <source media="(max-width: 767px)" srcSet={banner.mobileImage.url} />}
              {banner.image?.url && (
                <img
                  src={banner.image.url}
                  alt={banner.title || 'Promotional banner'}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              )}
            </picture>

            {banner.ctaText && banner.ctaLink && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:bottom-10 sm:left-10 sm:translate-x-0">
                {isExternal ? (
                  <a href={banner.ctaLink} target="_blank" rel="noreferrer" className="btn-primary inline-flex shadow-lg">
                    {banner.ctaText}
                  </a>
                ) : (
                  <Link to={banner.ctaLink} className="btn-primary inline-flex shadow-lg">
                    {banner.ctaText}
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow hover:bg-white sm:left-4 sm:h-10 sm:w-10"
          >
            <HiChevronLeft size={18} />
          </button>
          <button
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal shadow hover:bg-white sm:right-4 sm:h-10 sm:w-10"
          >
            <HiChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-4">
            {banners.map((banner, index) => (
              <button
                key={banner._id}
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
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
