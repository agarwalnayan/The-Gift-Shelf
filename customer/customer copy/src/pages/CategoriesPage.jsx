import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoriesApi } from '../api/productApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategoriesApi()
      .then(({ data }) => setCategories(data.data.categories))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader fullScreen />;

  if (categories.length === 0) {
    return (
      <div className="container-tgs py-16">
        <EmptyState
          title="Categories coming soon"
          description="We're organizing our collection into categories. In the meantime, browse everything we have."
          action={
            <Link to="/products">
              <Button>Shop All Gifts</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isLowCount = categories.length <= 2;

  return (
    <div className="container-tgs py-8 sm:py-12">
      <h1 className="mb-8 font-display text-2xl font-semibold text-charcoal sm:text-3xl">Shop by Category</h1>

      <div
        className={
          isLowCount
            ? 'flex flex-wrap justify-center gap-5 sm:justify-start'
            : 'grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4'
        }
      >
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/products?category=${category._id}`}
            className={`group overflow-hidden rounded-2xl bg-white ${isLowCount ? 'w-40 sm:w-56' : ''}`}
          >
            <div className="aspect-square overflow-hidden bg-primary-50">
              {category.image?.url ? (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-3xl text-primary-300">
                  {category.name?.[0]}
                </div>
              )}
            </div>
            <p className="p-4 text-sm font-medium text-charcoal">{category.name}</p>
          </Link>
        ))}

        {isLowCount && (
          <Link
            to="/products"
            className="flex w-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-charcoal/15 p-4 text-center sm:w-56"
          >
            <p className="text-sm font-medium text-charcoal/60">More collections coming soon</p>
            <p className="mt-1 text-xs text-primary-600">Shop all gifts</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
