import { createContext, useContext, useEffect, useState } from 'react';
import { getHomepageContentApi } from '../api/marketingApi.js';

const MarketingContext = createContext(null);

const emptyContent = {
  heroBanners: [],
  promoBanners: [],
  featuredRecipients: [],
  featuredOccasions: [],
  budgetCollections: [],
  announcementBar: { enabled: false },
  welcomePopup: { enabled: false },
};

// Module-level (not component-level) cache + in-flight promise. This is the
// key fix for the duplicate-request / 429 problem: previously every
// homepage section fetched its own data independently, and React.StrictMode
// double-invoking effects in development doubled that again. Here, no
// matter how many components mount/remount or how many times the effect
// re-fires, only ONE network request is ever made per page load — every
// consumer awaits the same shared promise.
let cachedContent = null;
let inFlightRequest = null;

const fetchHomepageContentOnce = async () => {
  if (cachedContent) return cachedContent;
  if (!inFlightRequest) {
    inFlightRequest = getHomepageContentApi()
      .then(({ data }) => {
        cachedContent = data.data;
        return cachedContent;
      })
      .finally(() => {
        inFlightRequest = null;
      });
  }
  return inFlightRequest;
};

export const MarketingProvider = ({ children }) => {
  const [content, setContent] = useState(cachedContent || emptyContent);
  const [isLoading, setIsLoading] = useState(!cachedContent);

  useEffect(() => {
    let isMounted = true;

    fetchHomepageContentOnce()
      .then((data) => {
        if (isMounted) setContent(data);
      })
      .catch(() => {
        // Marketing content is a storefront enhancement, not core
        // functionality — fail silently and keep static fallbacks.
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return <MarketingContext.Provider value={{ ...content, isLoading }}>{children}</MarketingContext.Provider>;
};

export const useMarketing = () => {
  const context = useContext(MarketingContext);
  if (!context) throw new Error('useMarketing must be used within a MarketingProvider');
  return context;
};
