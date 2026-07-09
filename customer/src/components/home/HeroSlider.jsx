import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const slides = [
  { caption: 'Birthday Gifts', gradient: 'from-primary-200 to-primary-50' },
  { caption: 'Anniversary Gifts', gradient: 'from-rose-200 to-primary-50' },
  { caption: 'Wedding Gifts', gradient: 'from-amber-200 to-primary-50' },
  { caption: 'For Him & For Her', gradient: 'from-primary-300 to-primary-50' },
  { caption: 'Premium Collection', gradient: 'from-charcoal/20 to-primary-50' },
];

const AUTOPLAY_MS = 4500;

const HeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  const goTo = (index) => setActiveIndex((index + slides.length) % slides.length);
  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  const pauseAutoplay = () => clearInterval(timerRef.current);
  const resumeAutoplay = () => {
    pauseAutoplay();
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  return (
    <section className="border-b border-charcoal/10 bg-primary-50">
      <div
        className="container-tgs grid items-center gap-8 py-14 sm:py-20 md:grid-cols-2 md:gap-10 md:py-24"
        onMouseEnter={pauseAutoplay}
        onMouseLeave={resumeAutoplay}
      >
        {/* Fixed left copy */}
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

        {/* Rotating right visual */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
            {slides.map((slide, index) => (
              <div
                key={slide.caption}
                className={`absolute inset-0 flex items-end bg-gradient-to-br ${slide.gradient} p-6 transition-opacity duration-700 ease-in-out ${
                  index === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={index !== activeIndex}
              >
                <span className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-charcoal backdrop-blur">
                  {slide.caption}
                </span>
              </div>
            ))}

            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal transition-colors hover:bg-white"
            >
              <HiChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-charcoal transition-colors hover:bg-white"
            >
              <HiChevronRight size={18} />
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.caption}
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex ? 'w-6 bg-primary-600' : 'w-2 bg-charcoal/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
