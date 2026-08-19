import { Link } from 'react-router-dom';
import ProductCard from '../../product/ProductCard.jsx';
import { transitions } from '../design/tokens.js';

/**
 * ProductCarousel - Horizontal scrollable product carousel or grid
 * Supports both carousel (New Arrivals) and grid (Featured Products) layouts
 */
const ProductCarousel = ({ products, title, description, viewAllLink, viewAllText = 'View all', layout = 'carousel' }) => {
  if (!products || products.length === 0) return null;

  const isCarousel = layout === 'carousel';

  return (
    <div>
      <div className="mb-5 flex items-end justify-between sm:mb-6">
        <div>
          {title && <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">{title}</h2>}
          {description && <p className="mt-1.5 text-sm text-charcoal/60">{description}</p>}
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm font-medium text-primary-600 hover:underline">
            {viewAllText}
          </Link>
        )}
      </div>

      {isCarousel ? (
        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide sm:gap-6"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="shrink-0 snap-start w-[calc(50%-8px)] min-w-[160px] sm:w-[calc(25%-12px)] sm:min-w-[200px]"
            >
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} compact />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
