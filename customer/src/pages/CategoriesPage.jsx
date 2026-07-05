import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoriesApi } from '../api/productApi.js';
import Loader from '../components/common/Loader.jsx';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategoriesApi()
      .then(({ data }) => setCategories(data.data.categories))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="container-tgs py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-charcoal">Shop by Category</h1>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/products?category=${category._id}`}
            className="group overflow-hidden rounded-2xl bg-white"
          >
            <div className="aspect-square overflow-hidden bg-primary-50">
              {category.image?.url && (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <p className="p-4 text-sm font-medium text-charcoal">{category.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
