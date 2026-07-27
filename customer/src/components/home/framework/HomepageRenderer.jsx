import { useEffect, useState, useMemo } from 'react';
import { useMarketing } from '../../../context/MarketingContext.jsx';
import { getSiteSettings } from '../../../api/siteSettingsApi.js';
import SectionContainer from './SectionContainer.jsx';
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
import HorizontalProductSection from '../HorizontalProductSection.jsx';

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
    activeFestival,
    isLoading: isMarketingLoading,
  } = useMarketing();

  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [error, setError] = useState(null);

  // Fetch site settings for homepage configuration
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (err) {
        console.error('[HomepageRenderer] Failed to fetch site settings:', err);
        setError(err);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  // Get homepage configuration from site settings
  const homepageConfig = useMemo(() => {
    return siteSettings?.homepageConfig || {};
  }, [siteSettings]);

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

  // Festival banner overrides marketing banners
  const homepageBanners =
    activeFestival?.desktopBanner?.url
      ? [
        {
          _id: activeFestival._id,
          title: activeFestival.name,
          image: activeFestival.desktopBanner,
          mobileImage: activeFestival.mobileBanner,
          ctaText: "Shop Now",
          ctaLink: "/shop",
        },
      ]
      : heroBanners;

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
        <SectionContainer>
          <ProductGridSkeleton count={4} />
        </SectionContainer>
        <SectionContainer background="cream">
          <CategoryGridSkeleton count={4} />
        </SectionContainer>
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
     
      {/* Trust Strip - If enabled */}
      {isSectionEnabled('trustStrip') && <TrustStrip />}

      {/* Featured Categories - If enabled and has data */}
      {shouldRenderSection('featuredCategories', featuredCategories) && (
        <SectionContainer>
          <FeaturedCategories categories={featuredCategories} />
        </SectionContainer>
      )}

      {/* Featured Products - If enabled and has data */}
      {shouldRenderSection('featuredProducts', featuredProducts) && (
        <SectionContainer background="cream">
          <HorizontalProductSection
            title="Featured Products"
            description="Handpicked favorites loved by our customers"
            products={featuredProducts}
            viewAllLink="/products?featured=true"
          />
        </SectionContainer>
      )}

      {/* New Arrivals - If enabled and has data */}
      {shouldRenderSection('newArrivals', newArrivals) && (
        <SectionContainer>
          <HorizontalProductSection
            title="New Arrivals"
            description="Fresh additions to our collection"
            products={newArrivals}
            viewAllLink="/products?sort=newest"
          />
        </SectionContainer>
      )}

      {/* Featured Recipients - If enabled and has data */}
      {shouldRenderSection('featuredRecipients', featuredRecipients) && (
        <SectionContainer background="cream">
          <FeaturedRecipients items={featuredRecipients} />
        </SectionContainer>
      )}

      {/* Featured Occasions - If enabled and has data */}
      {shouldRenderSection('featuredOccasions', featuredOccasions) && (
        <SectionContainer>
          <FeaturedOccasions items={featuredOccasions} />
        </SectionContainer>
      )}

      {/* Budget Collections - If enabled and has data */}
      {shouldRenderSection('budgetCollections', budgetCollections) && (
        <SectionContainer background="cream">
          <BudgetCollections collections={budgetCollections} />
        </SectionContainer>
      )}

      {/* Promo Banner - If enabled and has data */}
      {shouldRenderSection('promoBanner', promoBanners) && (
        <SectionContainer>
          <PromoBannerSection banners={promoBanners} startIndex={0} />
        </SectionContainer>
      )}

      {/* Promo Banner - If enabled and has data */}
      {shouldRenderSection('promoBanner', promoBanners) && (
        <SectionContainer>
          <PromoBannerSection banners={promoBanners} startIndex={2} />
        </SectionContainer>
      )}

      {/* Promo Banner - If enabled and has data */}
      {shouldRenderSection('promoBanner', promoBanners) && (
        <SectionContainer>
          <PromoBannerSection banners={promoBanners} startIndex={1} />
        </SectionContainer>
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