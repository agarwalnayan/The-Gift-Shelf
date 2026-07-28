import { Link } from 'react-router-dom';
import { transitions, shadows, borderRadius } from '../design/tokens.js';

/**
 * RecipientCard - Circular recipient icon with label
 * Used in Featured Recipients section
 * Uses CatalogMaster slug for filtering
 */
const RecipientCard = ({ item, className = '' }) => {
  if (!item) return null;

  return (
    <Link
      to={`/products?recipient=${encodeURIComponent(item.slug)}`}
      className={`group flex shrink-0 flex-col items-center gap-3 text-center ${className}`}
      style={{
        transition: `transform ${transitions.normal}`,
      }}
    >
      <div
        className="h-20 w-20 overflow-hidden rounded-full bg-primary-100 ring-1 ring-charcoal/5"
        style={{
          borderRadius: borderRadius.card.full,
          boxShadow: shadows.card.default,
        }}
      >
        {item.image?.url ? (
          <img
            src={item.image.url}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-primary-300">
            {item.name?.[0]}
          </div>
        )}
      </div>
      <p className="w-20 text-sm font-medium text-charcoal sm:w-24">{item.name}</p>
    </Link>
  );
};

export default RecipientCard;
