import { Link } from 'react-router-dom';
import { HiOutlineCalendar } from 'react-icons/hi2';
import { getProductsApi } from '../../api/productApi.js';
import { useEffect, useState } from 'react';
import ProductGrid from '../product/ProductGrid.jsx';
import Loader from '../common/Loader.jsx';

const UpcomingOccasions = ({ festival }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!festival?.featuredProducts || festival.featuredProducts.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await getProductsApi({ 
          ids: festival.featuredProducts.join(','), 
          limit: 8 
        });
        setProducts(data.data.products);
      } catch (error) {
        console.error('[UpcomingOccasions] Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [festival]);

  if (!festival) return null;
  if (isLoading) return <Loader fullScreen />;
  if (products.length === 0) return null;

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <section className="bg-gradient-to-br from-ink/5 to-ink/10 py-10 sm:py-12">
      <div className="container-tgs">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary-600">
              <HiOutlineCalendar size={16} />
              <span>Upcoming Celebration</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
              {festival.name}
            </h2>
            {festival.startDate && festival.endDate && (
              <p className="mt-1.5 text-sm text-charcoal/60">
                {formatDate(festival.startDate)} - {formatDate(festival.endDate)}
              </p>
            )}
          </div>
          {festival.landingPage && (
            <Link
              to={`/${festival.landingPage}`}
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              View all
            </Link>
          )}
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
};

export default UpcomingOccasions;
