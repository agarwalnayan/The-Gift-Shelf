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

      {/* Trust Strip — immediate reassurance after hero */}
      {isSectionEnabled('trustStrip') && <TrustStrip />}

      {/* Featured Categories — primary discovery paths */}
      {shouldRenderSection('featuredCategories', featuredCategories) && (
        <HomeSection background="white">
          <FeaturedCategories categories={featuredCategories} />
        </HomeSection>
      )}

      {/* Best-loved gifts — highest-intent merchandise */}
      {shouldRenderSection('featuredProducts', featuredProducts) && (
        <HomeSection background="warm">
          <ProductCarousel
            title="Best Loved Gifts"
            description="Handpicked favorites our customers adore"
            products={featuredProducts}
            viewAllLink="/products?featured=true"
            layout="grid"
          />
        </HomeSection>
      )}

      {/* Seasonal campaign — when an active festival is configured */}
      <CampaignSection festival={activeFestival} />

      {/* Festival curated collections */}
      {featuredSections && featuredSections.length > 0 && (
        <ShoppingIntentSection featuredSections={featuredSections} festival={activeFestival} />
      )}

      {/* New Arrivals */}
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

      {/* Shop by recipient & occasion */}
      {shouldRenderSection('featuredRecipients', featuredRecipients) && (
        <HomeSection background="warm">
          <FeaturedRecipients items={featuredRecipients} />
        </HomeSection>
      )}

      {shouldRenderSection('featuredOccasions', featuredOccasions) && (
        <HomeSection background="white">
          <FeaturedOccasions items={featuredOccasions} />
        </HomeSection>
      )}

      {/* Budget tiers */}
      {shouldRenderSection('budgetCollections', budgetCollections) && (
        <HomeSection background="warm">
          <BudgetCollections collections={budgetCollections} />
        </HomeSection>
      )}

      {/* Single promo banner — avoid scroll fatigue from repeated interruptions */}
      {shouldRenderSection('promoBanner', shuffledPromoBanners) && shuffledPromoBanners[0] && (
        <HomeSection background="white">
          <PromoBannerSection banners={shuffledPromoBanners} startIndex={0} />
        </HomeSection>
      )}

      {isSectionEnabled('instagramFeed') && <InstagramGallery />}
      {isSectionEnabled('whyChoose') && <WhyChooseSection />}
      {isSectionEnabled('trustSection') && <TrustSection />}
    </div>
  );
};

export default HomepageRenderer;