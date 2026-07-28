import { Link } from 'react-router-dom';
import { transitions, shadows, borderRadius } from '../design/tokens.js';

/**
 * CategoryCard - Square category card with image and label
 * Used in Featured Categories section
 */
const CategoryCard = ({ category, className = '' }) => {
  if (!category) return null;

  return (
    <Link
      to={`/products?category=${category._id}`}
      className={`group block ${className}`}
      style={{
        transition: `transform ${transitions.normal}, box-shadow ${transitions.normal}`,
      }}
    >
      <div
        className="aspect-square overflow-hidden rounded-2xl bg-primary-50"
        style={{
          borderRadius: borderRadius.card.lg,
          boxShadow: shadows.card.default,
        }}
      >
        {category.image?.url ? (
          <img
            src={category.image.url}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-primary-300">
            {category.name?.[0]}
          </div>
        )}
      </div>
      <p className="mt-2.5 truncate text-center text-sm font-medium text-charcoal">{category.name}</p>
    </Link>
  );
};

export default CategoryCard;
