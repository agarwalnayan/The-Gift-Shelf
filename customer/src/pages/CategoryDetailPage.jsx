import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getCategoryBySlugApi } from '../api/categoryApi.js';
import { getProductsApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductDiscoveryFilters from '../components/product/ProductDiscoveryFilters.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';

const PAGE_SIZE = 24;

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, category]);

  useEffect(() => {
    if (!category) return;

    const isInitialLoad = products.length === 0;
    if (isInitialLoad) setIsLoading(true);
    else setIsFetching(true);

    const params = {
      category: category._id,
      limit: PAGE_SIZE,
      page,
      sort: filters.sort,
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
          setTotalPages(data.data.totalPages || 1);
        })
        .catch((err) => {
          console.error('Failed to fetch products:', err);
          setProducts([]);
          setTotal(0);
          setTotalPages(1);
        })
        .finally(() => {
          setIsLoading(false);
          setIsFetching(false);
        });
    }, isTextDriven ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [category, searchParams]);

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

  const hasActiveFilters = Boolean(filters.search || filters.minPrice || filters.maxPrice);

  if (isLoading && !category) {
    return <Loader fullScreen />;
  }

  if (error || !category) {
    return (
      <div className="container-tgs py-16">
        <EmptyState
          title="Category not found"
          description="This collection may have moved. Browse our categories to find the perfect gift."
          action={
            <Link to="/categories" className="btn-primary inline-flex items-center px-5 py-2.5">
              Browse categories
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {category.banner?.url ? (
        <div className="relative h-48 bg-neutral-100 lg:h-64">
          <img src={category.banner.url} alt={category.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
            <div className="container-tgs">
              <h1 className="font-display text-3xl font-semibold text-white lg:text-4xl">{category.name}</h1>
              {category.parentCategory && (
                <p className="mt-2 text-sm text-white/80">{category.parentCategory.name}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#FAF7F2] to-white py-10 lg:py-14">
          <div className="container-tgs">
            {category.parentCategory && (
              <p className="text-sm text-neutral-600">{category.parentCategory.name}</p>
            )}
            <h1 className="font-display text-3xl font-semibold text-charcoal lg:text-4xl">{category.name}</h1>
            {category.description && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 lg:text-base">
                {category.description}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="container-tgs py-8 sm:py-12">
        {!isLoading && (
          <p className="mb-6 text-sm text-charcoal/50">
            {total} gift{total === 1 ? '' : 's'}
            {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
          </p>
        )}

        <ProductDiscoveryFilters
          filters={filters}
          categories={[]}
          onChange={updateFilters}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
          showCategoryFilter={false}
        />

        {isLoading ? (
          <Loader />
        ) : products.length > 0 ? (
          <>
            <div className={isFetching ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
              <ProductGrid products={products} />
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })} />
          </>
        ) : (
          <EmptyState
            title="No gifts in this collection yet"
            description={
              hasActiveFilters
                ? 'Try adjusting your filters within this collection.'
                : 'We are curating new gifts for this collection. Explore other categories in the meantime.'
            }
            action={
              <div className="flex flex-wrap justify-center gap-3">
                {hasActiveFilters && <Button onClick={clearFilters}>Clear filters</Button>}
                <Link to="/categories" className="btn-primary inline-flex items-center px-5 py-2.5">
                  Browse all categories
                </Link>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default CategoryDetailPage;
