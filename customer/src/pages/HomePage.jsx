import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductsApi, getCategoriesApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Loader from '../components/common/Loader.jsx';
import FeaturedCategories from '../components/home/FeaturedCategories.jsx';
import PersonalizationProcess from '../components/home/PersonalizationProcess.jsx';
import WhyChooseSection from '../components/home/WhyChooseSection.jsx';
import TrustSection from '../components/home/TrustSection.jsx';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await getProductsApi({ featured: true, limit: 8 });
        setFeaturedProducts(data.data.products);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchCategories = async () => {
      try {
        const { data } = await getCategoriesApi();
        setCategories(data.data.categories);
      } catch (error) {
        // categories are a nice-to-have on the homepage; fail silently
      }
    };
    fetchFeatured();
    fetchCategories();
  }, []);

  return (
    <div>
      <section className="border-b border-charcoal/10 bg-primary-50">
        <div className="container-tgs grid items-center gap-10 py-14 sm:py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary-600">Curated with care</p>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-charcoal sm:text-4xl md:text-5xl">
              Gifts that say what words can't.
            </h1>
            <p className="mt-5 max-w-md text-base text-charcoal/70">
              Discover thoughtfully sourced gifts for every relationship, milestone, and moment worth celebrating.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary inline-flex">
                Shop the collection
              </Link>
              <Link to="/categories" className="btn-secondary inline-flex">
                Browse categories
              </Link>
            </div>
          </div>
          <div className="aspect-[4/3] w-full rounded-3xl bg-primary-100" />
        </div>
      </section>

      <FeaturedCategories categories={categories} />

      <section className="container-tgs py-14 sm:py-16">
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Featured Gifts</h2>
          <Link to="/products" className="text-sm font-medium text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? <Loader fullScreen /> : <ProductGrid products={featuredProducts} />}
      </section>

      <PersonalizationProcess />
      <WhyChooseSection />
      <TrustSection />
    </div>
  );
};

export default HomePage;
