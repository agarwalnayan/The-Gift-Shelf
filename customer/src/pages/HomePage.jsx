import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductsApi, getCategoriesApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Loader from '../components/common/Loader.jsx';
import FeaturedCategories from '../components/home/FeaturedCategories.jsx';
import PersonalizationProcess from '../components/home/PersonalizationProcess.jsx';
import WhyChooseSection from '../components/home/WhyChooseSection.jsx';
import TrustSection from '../components/home/TrustSection.jsx';
import HeroSlider from '../components/home/HeroSlider.jsx';
import PromoBannerSection from '../components/home/PromoBannerSection.jsx';
import FeaturedRecipients from '../components/home/FeaturedRecipients.jsx';
import FeaturedOccasions from '../components/home/FeaturedOccasions.jsx';
import BudgetCollections from '../components/home/BudgetCollections.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import { useMarketing } from '../context/MarketingContext.jsx';


const HomePage = () => {
  const {
    heroBanners,
    promoBanners,
    featuredRecipients,
    featuredOccasions,
    budgetCollections,
    isLoading: isMarketingLoading,
  } = useMarketing();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await getProductsApi({ featured: true, limit: 8 });
        setFeaturedProducts(data.data.products);
      } catch (error) {
        console.error('[HomePage] Error fetching featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchNewArrivals = async () => {
      try {
        const { data } = await getProductsApi({ sort: 'newest', limit: 8 });
        setNewArrivals(data.data.products);
      } catch (error) {
        // secondary homepage section; fail silently
      }
    };
    const fetchBestSellers = async () => {
      try {
        const { data } = await getProductsApi({ sort: 'rating', limit: 8 });
        setBestSellers(data.data.products);
      } catch (error) {
        // secondary homepage section; fail silently
      }
    };
    const fetchCategories = async () => {
      try {
        // Business rule: homepage shows ONLY active, showOnHomepage=true, root
        // (parentCategory=null) categories. Subcategories must never appear
        // here. These are existing backend query params on getAllCategories -
        // no new API was added.
        const { data } = await getCategoriesApi({
          showOnHomepage: true,
          parentCategory: 'null',
          isActive: true,
        });
        setCategories(data.data.categories);
      } catch (error) {
        // categories are a nice-to-have on the homepage; fail silently
      }
    };
    fetchFeatured();
    fetchNewArrivals();
    fetchBestSellers();
    fetchCategories();
  }, []);

  return (
    <div>
      <HeroSlider banners={heroBanners} isLoading={isMarketingLoading} />

      <FeaturedCategories categories={categories} />

      <FeaturedRecipients items={featuredRecipients} />
      <FeaturedOccasions items={featuredOccasions} />
      <BudgetCollections collections={budgetCollections} />

      {promoBanners?.length > 0 && <PromoBannerSection banners={[promoBanners[0]]} />}

      <section className="container-tgs py-14 sm:py-16">
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Featured Gifts</h2>
          <Link to="/products?featured=true" className="text-sm font-medium text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? <Loader fullScreen /> : <ProductGrid products={featuredProducts} />}
      </section>

      {newArrivals.length > 0 && (
        <section className="container-tgs py-14 sm:py-16">
          <div className="mb-8 flex items-end justify-between sm:mb-10">
            <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">New Arrivals</h2>
            <Link to="/products?sort=newest" className="text-sm font-medium text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </section>
      )}

      {promoBanners?.length > 1 && <PromoBannerSection banners={promoBanners.slice(1)} />}

      {bestSellers.length > 0 && (
        <section className="border-t border-charcoal/10 bg-primary-50/40">
          <div className="container-tgs py-14 sm:py-16">
            <div className="mb-8 flex items-end justify-between sm:mb-10">
              <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Best Sellers</h2>
              <Link to="/products?sort=rating" className="text-sm font-medium text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {bestSellers.map((product) => (
                <div key={product._id} className="w-[calc(50%-0.5rem)] min-w-[160px] shrink-0 snap-start sm:w-48 lg:w-56">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <PersonalizationProcess />
      <WhyChooseSection />
      <TrustSection />
    </div>
  );
};

export default HomePage;
