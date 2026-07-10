import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsApi, getCategoriesApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductDiscoveryFilters from '../components/product/ProductDiscoveryFilters.jsx';
import Loader from '../components/common/Loader.jsx';

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const filters = {
    category: searchParams.get('category') || '',
    occasion: searchParams.get('occasion') || '',
    recipient: searchParams.get('recipient') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') || '',
    sort: searchParams.get('sort') || 'newest',
  };

  useEffect(() => {
    getCategoriesApi().then(({ data }) => setCategories(data.data.categories));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = { limit: 24, sort: filters.sort };
    if (filters.category) params.category = filters.category;
    if (filters.occasion) params.occasion = filters.occasion;
    if (filters.recipient) params.recipient = filters.recipient;
    if (filters.search) params.search = filters.search;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.featured) params.featured = filters.featured;

    // Debounce text-driven filters so we don't fire a request per keystroke;
    // dropdown/checkbox changes apply immediately.
    const isTextDriven = Boolean(filters.search || filters.occasion || filters.recipient);
    const timeoutId = setTimeout(() => {
      getProductsApi(params)
        .then(({ data }) => {
          setProducts(data.data.products);
          setTotal(data.data.total);
        })
        .finally(() => setIsLoading(false));
    }, isTextDriven ? 300 : 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const hasActiveFilters = Boolean(
    filters.category ||
      filters.occasion ||
      filters.recipient ||
      filters.search ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.featured
  );

  return (
    <div className="container-tgs py-12">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          {filters.search ? `Results for "${filters.search}"` : 'Shop All Gifts'}
        </h1>
        {!isLoading && (
          <p className="text-sm text-charcoal/50">
            {total} gift{total === 1 ? '' : 's'} found
          </p>
        )}
      </div>

      <ProductDiscoveryFilters
        filters={filters}
        categories={categories}
        onChange={updateFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading ? <Loader fullScreen /> : <ProductGrid products={products} />}
    </div>
  );
};

export default ProductListingPage;
