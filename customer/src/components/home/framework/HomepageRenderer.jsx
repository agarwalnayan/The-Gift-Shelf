import { useEffect, useState, useMemo } from 'react';
import { useMarketing } from '../../../context/MarketingContext.jsx';
import { getSiteSettings } from '../../../api/siteSettingsApi.js';
import EmptyState from './EmptyState.jsx';
import HeroSkeleton from './skeletons/HeroSkeleton.jsx';
import ProductGridSkeleton from './skeletons/ProductGridSkeleton.jsx';
import CategoryGridSkeleton from './skeletons/CategoryGridSkeleton.jsx';
import CollectionGridSkeleton from './skeletons/CollectionGridSkeleton.jsx';

// Import existing production components
import HeroSlider from '../HeroSlider.jsx';
import TrustStrip from '../TrustStrip.jsx';
import FeaturedCategories from '../FeaturedCategories.jsx';
import FeaturedRecipients from '../FeaturedRecipients.jsx';
import FeaturedOccasions from '../FeaturedOccasions.jsx';
import BudgetCollections from '../BudgetCollections.jsx';
import PromoBannerSection from '../PromoBannerSection.jsx';
import InstagramGallery from '../InstagramGallery.jsx';
import WhyChooseSection from '../WhyChooseSection.jsx';
import TrustSection from '../TrustSection.jsx';
import ShoppingIntentSection from '../ShoppingIntentSection.jsx';
import ProductCarousel from '../ui/ProductCarousel.jsx';
import CampaignSection from '../CampaignSection.jsx';
import HomeSection from './HomeSection.jsx';

/**
 * Homepage Renderer
 * Main homepage page that fetches configuration and renders sections dynamically
 * Respects Homepage Builder visibility, skips hidden/empty sections, never crashes
 */
const HomepageRenderer = () => {
  const {
    heroBanners,
    promoBanners,
    featuredRecipients,
    featuredOccasions,
    budgetCollections,
    featuredCategories,
    featuredProducts,
    newArrivals,
    featuredSections,
    activeFestival,
    isLoading: isMarketingLoading,
  } = useMarketing();

  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [error, setError] = useState(null);

  // Fetch site settings for homepage configuration
  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const settings = await getSiteSettings();

        if (isMounted) {
          setSiteSettings(settings);
        }
      } catch (err) {
        console.error(
          "[HomepageRenderer] Failed to fetch site settings:",
          err
        );

        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSettings(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get homepage configuration from site settings
  const homepageConfig = useMemo(() => {
    return siteSettings?.homepageConfig || {};
  }, [siteSettings]);

  const [shuffledPromoBanners, setShuffledPromoBanners] = useState([]);

  useEffect(() => {
    if (!promoBanners?.length) {
      setShuffledPromoBanners([]);
      return;
    }

    const shuffled = [...promoBanners];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setShuffledPromoBanners(shuffled);
  }, [promoBanners]);

  // Check if a section is enabled in Homepage Builder
  const isSectionEnabled = (sectionKey) => {
    return homepageConfig[sectionKey] !== false;
  };

  // Check if section has data
  const hasData = (data) => {
    return data && Array.isArray(data) && data.length > 0;
  };

  // Render section only if enabled and has data
  const shouldRenderSection = (sectionKey, data) => {
    return isSectionEnabled(sectionKey) && hasData(data);
  };

  // Overall loading state
  const isLoading = isMarketingLoading || isLoadingSettings;

  // Homepage API already handles Festival hero banner override
  // heroBanners from context will be Festival heroBanners when festival is active
  // otherwise it will be Marketing heroBanners
  const homepageBanners = heroBanners;

  // Error state - render gracefully
  if (error) {
    return (
      <div className="container-tgs py-12">
        <EmptyState message="Unable to load homepage content. Please try again later." />
      </div>
    );
  }

  // Initial loading state
  if (isLoading) {
    return (
      <div>
        <HeroSkeleton />
        <HomeSection>
          <ProductGridSkeleton count={4} />
        </HomeSection>
        <HomeSection background="warm">
          <CategoryGridSkeleton count={4} />
        </HomeSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      {hasData(homepageBanners) && (
        <HeroSlider
          banners={homepageBanners}
          isLoading={isMarketingLoading}
        />
      )}

      {/* Shopping Intent Section - Festival Featured Sections */}
      {featuredSections && featuredSections.length > 0 && (
        <ShoppingIntentSection featuredSections={featuredSections} />
      )}

      {/* Trust Strip - If enabled */}
      {isSectionEnabled('trustStrip') && <TrustStrip />}

      {/* Campaign Section - Festival/Campaign with homepage visibility */}
      <CampaignSection festival={activeFestival} />

      {/* Featured Categories - If enabled and has data */}
      {shouldRenderSection('featuredCategories', featuredCategories) && (
        <HomeSection background="white">
          <FeaturedCategories categories={featuredCategories} />
        </HomeSection>
      )}

      {/* Promo Banner 1 */}
      {shouldRenderSection("promoBanner", shuffledPromoBanners) &&
        shuffledPromoBanners[0] && (
          <HomeSection background="white">
            <PromoBannerSection
              banners={shuffledPromoBanners}
              startIndex={0}
            />
          </HomeSection>
        )}

      {/* Featured Products - If enabled and has data */}
      {shouldRenderSection('featuredProducts', featuredProducts) && (
        <HomeSection background="warm">
          <ProductCarousel
            title="Featured Products"
            description="Handpicked favorites loved by our customers"
            products={featuredProducts}
            viewAllLink="/products?featured=true"
            layout="grid"
          />
        </HomeSection>
      )}



      {/* New Arrivals - If enabled and has data */}
      {shouldRenderSection('newArrivals', newArrivals) && (
        <HomeSection background="white">
          <ProductCarousel
            title="New Arrivals"
            description="Fresh additions to our collection"
            products={newArrivals}
            viewAllLink="/products?sort=newest"
            layout="carousel"
          />
        </HomeSection>
      )}

      {/* Promo Banner 2 */}
      {shouldRenderSection("promoBanner", shuffledPromoBanners) &&
        shuffledPromoBanners[1] && (
          <HomeSection background="white">
            <PromoBannerSection
              banners={shuffledPromoBanners}
              startIndex={1}
            />
          </HomeSection>
        )}

      {/* Featured Recipients - If enabled and has data */}
      {shouldRenderSection('featuredRecipients', featuredRecipients) && (
        <HomeSection background="warm">
          <FeaturedRecipients items={featuredRecipients} />
        </HomeSection>
      )}

      {/* Featured Occasions - If enabled and has data */}
      {shouldRenderSection('featuredOccasions', featuredOccasions) && (
        <HomeSection background="white">
          <FeaturedOccasions items={featuredOccasions} />
        </HomeSection>
      )}



      {/* Budget Collections - If enabled and has data */}
      {shouldRenderSection('budgetCollections', budgetCollections) && (
        <HomeSection background="warm">
          <BudgetCollections collections={budgetCollections} />
        </HomeSection>
      )}

      {/* Promo Banner 3 */}
      {shouldRenderSection("promoBanner", shuffledPromoBanners) &&
        shuffledPromoBanners[2] && (
          <HomeSection background="white">
            <PromoBannerSection
              banners={shuffledPromoBanners}
              startIndex={2}
            />
          </HomeSection>
        )}

      {/* Instagram Feed - If enabled */}
      {isSectionEnabled('instagramFeed') && <InstagramGallery />}

      {/* Why Choose Section - If enabled */}
      {isSectionEnabled('whyChoose') && <WhyChooseSection />}

      {/* Trust Section - If enabled */}
      {isSectionEnabled('trustSection') && <TrustSection />}
    </div>
  );
};

export default HomepageRenderer;