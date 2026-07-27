import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard.jsx';

/**
 * Reusable horizontal product section for homepage
 * Displays products in a responsive grid with optional "View all" link
 */
const HorizontalProductSection = ({ title, description, products, viewAllLink, viewAllText = 'View all' }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="container-tgs py-8 sm:py-10">
      <div className="mb-5 flex items-end justify-between sm:mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">{title}</h2>
          {description && <p className="mt-1.5 text-sm text-charcoal/60">{description}</p>}
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm font-medium text-primary-600 hover:underline">
            {viewAllText}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default HorizontalProductSection;
