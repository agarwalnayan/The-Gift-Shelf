import ProductCard from './ProductCard.jsx';
import EmptyState from '../common/EmptyState.jsx';

const ProductGrid = ({ products }) => {
  if (!products || products.length === 0) {
    return <EmptyState title="No products found" description="Try adjusting your filters or check back soon." />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
