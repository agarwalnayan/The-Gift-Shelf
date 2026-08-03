import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getCategoryBySlugApi } from '../api/categoryApi.js';
import { getProductsApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductDiscoveryFilters from '../components/product/ProductDiscoveryFilters.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = {
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const { data } = await getCategoryBySlugApi(slug);
        setCategory(data.data.category);
      } catch (err) {
        setError('Category not found');
        console.error('Failed to fetch category:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (!category) return;

    setIsLoading(true);
    const params = { 
      category: category._id, 
      limit: 24, 
      sort: filters.sort 
    };
    if (filters.search) params.search = filters.search;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    const isTextDriven = Boolean(filters.search);
    const timeoutId = setTimeout(() => {
      getProductsApi(params)
        .then(({ data }) => {
          setProducts(data.data.products);
          setTotal(data.data.total);
        })
        .catch((err) => {
          console.error('Failed to fetch products:', err);
          setProducts([]);
          setTotal(0);
        })
        .finally(() => setIsLoading(false));
    }, isTextDriven ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [category, searchParams]);

  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  if (isLoading && !category) {
    return <Loader fullScreen />;
  }

  if (error || !category) {
    return (
      <div className="container-tgs py-16">
        <EmptyState
          title="Category Not Found"
          description="This category may have been removed or is no longer available."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      {category.banner?.url ? (
        <div className="relative h-48 lg:h-64 bg-neutral-100">
          <img
            src={category.banner.url}
            alt={category.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
            <div className="container-tgs">
              <h1 className="font-display text-3xl font-semibold text-white lg:text-4xl">
                {category.name}
              </h1>
              {category.parentCategory && (
                <p className="mt-2 text-sm text-white/80">
                  {category.parentCategory.name}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#FAF7F2] to-white py-12 lg:py-16">
          <div className="container-tgs">
            <div className="mb-2">
              {category.parentCategory && (
                <p className="text-sm text-neutral-600">
                  {category.parentCategory.name}
                </p>
              )}
            </div>
            <h1 className="font-display text-3xl font-semibold text-charcoal lg:text-4xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 lg:text-base">
                {category.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container-tgs py-12 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-neutral-600">
              {total} {total === 1 ? 'product' : 'products'}
            </p>
          </div>
          <ProductDiscoveryFilters
            filters={filters}
            categories={[]}
            onChange={updateFilters}
            onClear={clearFilters}
            hasActiveFilters={Boolean(filters.search || filters.minPrice || filters.maxPrice)}
            showCategoryFilter={false}
          />
        </div>

        {isLoading ? (
          <Loader />
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="No products found"
            description="This category doesn't have any products yet. Check back later!"
          />
        )}
      </div>
    </div>
  );
};

export default CategoryDetailPage;
