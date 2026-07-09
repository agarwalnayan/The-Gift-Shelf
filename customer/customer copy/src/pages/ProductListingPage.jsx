import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsApi, getCategoriesApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Loader from '../components/common/Loader.jsx';

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' },
  { label: 'Top Rated', value: 'rating' },
];

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    getCategoriesApi().then(({ data }) => setCategories(data.data.categories));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = {};
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (search) params.search = search;

    getProductsApi(params)
      .then(({ data }) => setProducts(data.data.products))
      .finally(() => setIsLoading(false));
  }, [category, sort, search]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="container-tgs py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
            {search ? `Results for "${search}"` : 'Shop All Gifts'}
          </h1>
          {!isLoading && <p className="mt-1 text-sm text-charcoal/50">{products.length} product{products.length !== 1 ? 's' : ''}</p>}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
            className="input-field w-auto flex-1 sm:flex-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="input-field w-auto flex-1 sm:flex-none">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? <Loader fullScreen /> : <ProductGrid products={products} />}
    </div>
  );
};

export default ProductListingPage;
