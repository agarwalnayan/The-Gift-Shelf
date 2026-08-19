import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProductsApi, getCategoriesApi } from '../api/productApi.js';
import { useMarketing } from '../context/MarketingContext.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductDiscoveryFilters from '../components/product/ProductDiscoveryFilters.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';

const PAGE_SIZE = 24;

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { featuredOccasions = [], featuredRecipients = [] } = useMarketing();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    const isInitialLoad = products.length === 0;
    if (isInitialLoad) setIsLoading(true);
    else setIsFetching(true);

    const params = { limit: PAGE_SIZE, page, sort: filters.sort };
    if (filters.category) params.category = filters.category;
    if (filters.occasion) params.occasion = filters.occasion;
    if (filters.recipient) params.recipient = filters.recipient;
    if (filters.search) params.search = filters.search;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.featured) params.featured = filters.featured;

    const isTextDriven = Boolean(filters.search);
    const timeoutId = setTimeout(() => {
      getProductsApi(params)
        .then(({ data }) => {
          setProducts(data.data.products);
          setTotal(data.data.total);
          setTotalPages(data.data.totalPages || 1);
        })
        .finally(() => {
          setIsLoading(false);
          setIsFetching(false);
        });
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
    if (!Object.prototype.hasOwnProperty.call(patch, 'page')) {
      next.delete('page');
    }
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

  const occasionName = featuredOccasions.find((o) => o.slug === filters.occasion)?.name;
  const recipientName = featuredRecipients.find((r) => r.slug === filters.recipient)?.name;
  const categoryName = categories.find((c) => c._id === filters.category)?.name;

  const pageTitle = (() => {
    if (filters.search) return `Results for "${filters.search}"`;
    if (filters.featured === 'true') return 'Staff Picks';
    if (occasionName) return `Gifts for ${occasionName}`;
    if (recipientName) return `Gifts for ${recipientName}`;
    if (categoryName) return categoryName;
    return 'Shop All Gifts';
  })();

  return (
    <div className="container-tgs py-8 sm:py-12">
      <div className="mb-6 flex flex-col gap-1 sm:mb-8">
        <h1 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">{pageTitle}</h1>
        {!isLoading && (
          <p className="text-sm text-charcoal/50">
            {total} gift{total === 1 ? '' : 's'}
            {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
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

      {isLoading ? (
        <Loader fullScreen />
      ) : products.length === 0 ? (
        <EmptyState
          title="No gifts found"
          description={
            hasActiveFilters
              ? 'Try adjusting your filters — or explore our full collection.'
              : 'Check back soon — we are always adding thoughtful new gifts.'
          }
          action={
            hasActiveFilters ? (
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={clearFilters}>Clear filters</Button>
                <Link to="/categories" className="btn-secondary inline-flex items-center px-5 py-2.5">
                  Browse categories
                </Link>
              </div>
            ) : (
              <Link to="/categories" className="btn-primary inline-flex items-center px-5 py-2.5">
                Browse categories
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className={isFetching ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
            <ProductGrid products={products} />
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })} />
        </>
      )}
    </div>
  );
};

export default ProductListingPage;
