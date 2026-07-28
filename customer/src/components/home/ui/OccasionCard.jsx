import { Link } from 'react-router-dom';
import { transitions, shadows, borderRadius } from '../design/tokens.js';

/**
 * OccasionCard - Premium grid card for occasions
 * Full-bleed image with gradient overlay and hover lift
 */
const OccasionCard = ({ item, className = '' }) => {
  if (!item) return null;

  return (
    <Link
      to={`/products?occasion=${encodeURIComponent(item.slug)}`}
      className={`group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 group-hover:shadow-lg ${className}`}
      style={{
        borderRadius: borderRadius.card.lg,
        boxShadow: shadows.card.default,
        transition: transitions.normal,
      }}
    >
      {item.image?.url ? (
        <img
          src={item.image.url}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary-50 font-display text-2xl text-primary-300">
          {item.name?.[0]}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/5 to-transparent" />
      <p className="absolute bottom-4 left-4 font-display text-base font-semibold text-cream sm:text-lg">
        {item.name}
      </p>
    </Link>
  );
};

export default OccasionCard;
