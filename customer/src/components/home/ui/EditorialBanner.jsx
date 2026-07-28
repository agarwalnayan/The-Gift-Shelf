import { Link } from 'react-router-dom';
import { transitions, shadows, borderRadius } from '../design/tokens.js';

/**
 * EditorialBanner - Full-width promotional banner with image and CTA
 * Used for marketing announcements, seasonal campaigns, and featured promotions
 */
const EditorialBanner = ({ title, subtitle, image, ctaText, ctaLink, className = '' }) => {
  if (!image?.url) return null;

  return (
    <Link
      to={ctaLink || '#'}
      className={`group relative block overflow-hidden rounded-2xl ${borderRadius.card.xl} ${className}`}
      style={{
        transition: `transform ${transitions.normal}, box-shadow ${transitions.normal}`,
      }}
    >
      <img
        src={image.url}
        alt={title || 'Editorial Banner'}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        {title && (
          <h3 className="font-display text-2xl font-semibold text-cream sm:text-3xl">{title}</h3>
        )}
        {subtitle && <p className="mt-2 text-sm text-cream/80">{subtitle}</p>}
        {ctaText && (
          <span className="mt-4 inline-block rounded-full bg-cream px-4 py-2 text-sm font-medium text-charcoal transition-colors group-hover:bg-primary-600 group-hover:text-cream">
            {ctaText}
          </span>
        )}
      </div>
    </Link>
  );
};

export default EditorialBanner;
