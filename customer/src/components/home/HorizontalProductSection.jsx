import ProductCard from '../product/ProductCard.jsx';
import SectionHeader from './framework/SectionHeader.jsx';

/**
 * Reusable horizontal product section for homepage
 * Displays products in a responsive grid with optional "View all" link
 */
const HorizontalProductSection = ({ title, description, products, viewAllLink, viewAllText = 'View all' }) => {
  if (!products || products.length === 0) return null;

  return (
    <>
      <SectionHeader
        title={title}
        subtitle={description}
        ctaText={viewAllLink ? viewAllText : undefined}
        ctaLink={viewAllLink}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </>
  );
};

export default HorizontalProductSection;
