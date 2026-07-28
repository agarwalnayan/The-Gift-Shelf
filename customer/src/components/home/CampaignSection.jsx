import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard.jsx';
import SectionHeader from './framework/SectionHeader.jsx';
import { transitions, shadows, borderRadius } from './design/tokens.js';

/**
 * CampaignSection - Reusable festival/campaign section for homepage
 * Renders only when an active festival has homepage visibility enabled
 * Uses the existing Festival system - never hardcoded to specific festivals
 */
const CampaignSection = ({ festival }) => {
  // Hide section if no festival or homepage visibility not enabled
  if (!festival || !festival.homepage?.showOnHomepage) {
    return null;
  }

  const {
    desktopBanner,
    mobileBanner,
    homepage,
    themeColor,
  } = festival;

  const banner = mobileBanner?.url || desktopBanner?.url;
  const title = homepage?.title || festival.name;
  const subtitle = homepage?.subtitle;
  const ctaText = homepage?.ctaText;
  const ctaLink = homepage?.ctaLink;
  const products = homepage?.products || [];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: themeColor || '#C8A46B',
      }}
    >
      {/* Banner */}
      {banner && (
        <div className="relative h-48 sm:h-64 lg:h-80">
          <img
            src={banner}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
        </div>
      )}

      {/* Content */}
      <div className="container-tgs py-8 sm:py-12">
        <div className="mb-6 text-center sm:mb-8">
          <h2
            className="font-display text-2xl font-semibold text-charcoal sm:text-3xl lg:text-4xl"
            style={{ color: 'inherit' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-charcoal/80 sm:text-base">
              {subtitle}
            </p>
          )}
          {ctaText && ctaLink && (
            <Link
              to={ctaLink}
              className="mt-4 inline-block rounded-full bg-cream px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-white sm:text-base"
              style={{
                boxShadow: shadows.card.hover,
                borderRadius: borderRadius.button.lg,
                transition: transitions.normal,
              }}
            >
              {ctaText}
            </Link>
          )}
        </div>

        {/* Product Carousel */}
        {products.length > 0 && (
          <div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="shrink-0 snap-start"
                style={{
                  width: 'calc(50% - 8px)',
                  minWidth: '160px',
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignSection;
