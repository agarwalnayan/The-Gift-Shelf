import { Link } from 'react-router-dom';
import { transitions, shadows, borderRadius } from '../design/tokens.js';

/**
 * CategoryCard - Premium category card for featured categories
 * Image on top, category name below, with subtle hover effect
 */
const CategoryCard = ({ category, className = '' }) => {
  if (!category) return null;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className={`group flex flex-col gap-3 ${className}`}
      style={{
        transition: transitions.normal,
      }}
    >
      <div
        className="aspect-square overflow-hidden rounded-2xl bg-primary-50 shadow-sm transition-all duration-200 group-hover:shadow-lg"
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
          <div className="flex h-full w-full items-center justify-center bg-neutral-100 font-display text-3xl text-neutral-300">
            {category.name?.[0]}
          </div>
        )}
      </div>
      <p className="text-center text-sm font-medium text-charcoal sm:text-base">
        {category.name}
      </p>
    </Link>
  );
};

export default CategoryCard;
