import { Link } from 'react-router-dom';
import { getProductsApi } from '../../api/productApi.js';
import { useEffect, useState } from 'react';
import ProductGrid from '../product/ProductGrid.jsx';
import Loader from '../common/Loader.jsx';

const RakshaBandhanSection = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProductsApi({ occasion: 'Raksha Bandhan', limit: 8 });
        setProducts(data.data.products);
      } catch (error) {
        console.error('[RakshaBandhanSection] Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) return <Loader fullScreen />;
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-10 sm:py-12">
      <div className="container-tgs">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
              Raksha Bandhan Collection
            </h2>
            <p className="mt-1.5 text-sm text-charcoal/60">
              Celebrate the bond of love with exclusive gifts
            </p>
          </div>
          <Link
            to="/raksha-bandhan"
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
};

export default RakshaBandhanSection;
