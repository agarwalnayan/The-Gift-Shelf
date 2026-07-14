import ProductCard from './ProductCard.jsx';
import EmptyState from '../common/EmptyState.jsx';

const ProductGrid = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try adjusting your filters, or check back soon — we're always adding new gifts."
      />
    );
  }

  // With very few results a full 4-column grid leaves awkward empty space.
  // Center a capped-width row instead so the page still feels intentional.
  if (products.length <= 3) {
    return (
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 sm:justify-start">
        {products.map((product) => (
          <div key={product._id} className="w-[calc(50%-0.75rem)] sm:w-48 lg:w-56">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product._id} className="min-w-0">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
