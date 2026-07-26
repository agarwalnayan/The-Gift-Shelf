import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductsApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Loader from '../components/common/Loader.jsx';

const RakshaBandhanPage = () => {
  const [personalisedRakhi, setPersonalisedRakhi] = useState([]);
  const [rakhiCombos, setRakhiCombos] = useState([]);
  const [hampers, setHampers] = useState([]);
  const [under499, setUnder499] = useState([]);
  const [under999, setUnder999] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const [personalised, combos, hamper, price499, price999, best] = await Promise.all([
          getProductsApi({ occasion: 'Raksha Bandhan', tags: 'Personalised', limit: 8 }),
          getProductsApi({ occasion: 'Raksha Bandhan', tags: 'Combo', limit: 8 }),
          getProductsApi({ occasion: 'Raksha Bandhan', tags: 'Hamper', limit: 8 }),
          getProductsApi({ occasion: 'Raksha Bandhan', maxPrice: 499, limit: 8 }),
          getProductsApi({ occasion: 'Raksha Bandhan', maxPrice: 999, limit: 8 }),
          getProductsApi({ occasion: 'Raksha Bandhan', sort: 'rating', limit: 8 }),
        ]);

        setPersonalisedRakhi(personalised.data.data.products);
        setRakhiCombos(combos.data.data.products);
        setHampers(hamper.data.data.products);
        setUnder499(price499.data.data.products);
        setUnder999(price999.data.data.products);
        setBestSellers(best.data.data.products);
      } catch (error) {
        console.error('[RakshaBandhanPage] Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const Section = ({ title, description, products, link }) => {
    if (isLoading) return <Loader fullScreen />;
    if (!products || products.length === 0) return null;

    return (
      <section className="container-tgs py-10 sm:py-12">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">{title}</h2>
            <p className="mt-1.5 text-sm text-charcoal/60">{description}</p>
          </div>
          {link && (
            <Link to={link} className="text-sm font-medium text-primary-600 hover:underline">
              View all
            </Link>
          )}
        </div>
        <ProductGrid products={products} />
      </section>
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-cream">
        <div className="container-tgs py-16 sm:py-24 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl mb-4">
            Raksha Bandhan Collection
          </h1>
          <p className="text-lg sm:text-xl text-cream/90 max-w-2xl mx-auto mb-8">
            Celebrate the bond of love with our exclusive Rakhi gifts
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="#personalised" className="btn-secondary">
              Personalised Rakhis
            </Link>
            <Link to="#combos" className="btn-secondary">
              Rakhi Combos
            </Link>
            <Link to="#hampers" className="btn-secondary">
              Hampers
            </Link>
          </div>
        </div>
      </section>

      {/* Delivery Banner */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="container-tgs py-4 text-center">
          <p className="text-amber-800 font-medium">
            🎁 Order before 31st July for Raksha Bandhan delivery
          </p>
        </div>
      </section>

      {isLoading ? (
        <Loader fullScreen />
      ) : (
        <div className="bg-[#FAF7F3]">
          <Section
            id="personalised"
            title="Personalised Rakhi"
            description="Custom rakhis with names and photos"
            products={personalisedRakhi}
            link="/products?occasion=Raksha%20Bandhan&tags=Personalised"
          />

          <Section
            id="combos"
            title="Rakhi + Gift Combos"
            description="Perfect pairings for your sibling"
            products={rakhiCombos}
            link="/products?occasion=Raksha%20Bandhan&tags=Combo"
          />

          <Section
            id="hampers"
            title="Hampers"
            description="Complete gift sets for the celebration"
            products={hampers}
            link="/products?occasion=Raksha%20Bandhan&tags=Hamper"
          />

          <Section
            title="Gifts Under ₹499"
            description="Affordable gifts that don't compromise on quality"
            products={under499}
            link="/products?occasion=Raksha%20Bandhan&maxPrice=499"
          />

          <Section
            title="Gifts Under ₹999"
            description="Premium gifts at great prices"
            products={under999}
            link="/products?occasion=Raksha%20Bandhan&maxPrice=999"
          />

          <Section
            title="Best Sellers"
            description="Most loved Raksha Bandhan gifts"
            products={bestSellers}
            link="/products?occasion=Raksha%20Bandhan&sort=rating"
          />
        </div>
      )}
    </div>
  );
};

export default RakshaBandhanPage;
