import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductsApi, getCategoriesApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Loader from '../components/common/Loader.jsx';
import HeroSlider from '../components/home/HeroSlider.jsx';
import CollectionsSection from '../components/home/CollectionsSection.jsx';
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
      {/* Announcement Bar + Navbar render above this via MainLayout */}
      <HeroSlider />
      <CollectionsSection />
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
