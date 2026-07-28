import { Link } from 'react-router-dom';
import { transitions, shadows, borderRadius } from '../design/tokens.js';

/**
 * BudgetCard - Square card for budget collections
 * Links to product listing with price range filter
 */
const BudgetCard = ({ collection, className = '' }) => {
  if (!collection) return null;

  const buildLink = (collection) => {
    const params = new URLSearchParams();
    if (collection.minPrice) params.set('minPrice', collection.minPrice);
    if (collection.maxPrice) params.set('maxPrice', collection.maxPrice);
    const query = params.toString();
    return query ? `/products?${query}` : '/products';
  };

  return (
    <Link
      to={buildLink(collection)}
      className={`group flex flex-col items-center ${className}`}
      style={{
        transition: transitions.normal,
      }}
    >
      <div
        className="aspect-square w-full overflow-hidden rounded-2xl bg-primary-50 shadow-sm transition-all duration-200 group-hover:shadow-lg"
        style={{
          borderRadius: borderRadius.card.lg,
          boxShadow: shadows.card.default,
        }}
      >
        {collection.image?.url ? (
          <img
            src={collection.image.url}
            alt={collection.label}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-primary-300">
            {collection.label?.[0]}
          </div>
        )}
      </div>
      <p className="mt-2.5 truncate text-center text-sm font-medium text-charcoal">{collection.label}</p>
      {collection.productCount !== undefined && (
        <p className="mt-1 text-center text-xs text-charcoal/60">{collection.productCount} products</p>
      )}
    </Link>
  );
};

export default BudgetCard;
