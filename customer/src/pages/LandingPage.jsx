import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsApi, getCategoriesApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Loader from '../components/common/Loader.jsx';
import FeaturedCategories from '../components/home/FeaturedCategories.jsx';

const LANDING_PAGE_CONFIGS = {
  'raksha-bandhan-gifts': {
    title: 'Raksha Bandhan Gifts',
    description: 'Celebrate the bond of love with exclusive Rakhi gifts for your brother and sister',
    metaTitle: 'Raksha Bandhan Gifts 2024 | Send Rakhi Online',
    metaDescription: 'Find the perfect Raksha Bandhan gifts for brother and sister. Personalized Rakhi hampers, chocolates, and more with free delivery.',
    filters: { occasion: 'Raksha Bandhan' },
    showCategories: true,
  },
  'gifts-for-brother': {
    title: 'Gifts for Brother',
    description: 'Find the perfect gift for your brother - from personalized items to trendy accessories',
    metaTitle: 'Gifts for Brother | Unique & Personalized Gift Ideas',
    metaDescription: 'Discover unique gifts for your brother. Personalized mugs, custom photo frames, accessories and more with free delivery.',
    filters: { recipient: 'Brother' },
    showCategories: false,
  },
  'gifts-for-sister': {
    title: 'Gifts for Sister',
    description: 'Surprise your sister with thoughtful gifts she will love',
    metaTitle: 'Gifts for Sister | Unique & Personalized Gift Ideas',
    metaDescription: 'Find the perfect gifts for your sister. Personalized jewelry, custom gifts, accessories and more with free delivery.',
    filters: { recipient: 'Sister' },
    showCategories: false,
  },
  'personalized-gifts': {
    title: 'Personalized Gifts',
    description: 'Make it special with custom personalization - names, photos, messages and more',
    metaTitle: 'Personalized Gifts | Custom Gifts with Name & Photo',
    metaDescription: 'Create unique personalized gifts with names, photos and custom messages. Mugs, cushions, frames and more.',
    filters: { personalization: true },
    showCategories: true,
  },
  'birthday-gifts': {
    title: 'Birthday Gifts',
    description: 'Make their birthday special with thoughtful and unique gift ideas',
    metaTitle: 'Birthday Gifts | Unique Gift Ideas for Everyone',
    metaDescription: 'Find the perfect birthday gifts for friends and family. Personalized gifts, hampers, accessories and more.',
    filters: { occasion: 'Birthday' },
    showCategories: false,
  },
  'anniversary-gifts': {
    title: 'Anniversary Gifts',
    description: 'Celebrate your special day with romantic and thoughtful gifts',
    metaTitle: 'Anniversary Gifts | Romantic Gift Ideas for Couples',
    metaDescription: 'Discover romantic anniversary gifts for your partner. Personalized gifts, hampers, accessories and more.',
    filters: { occasion: 'Anniversary' },
    showCategories: false,
  },
  'teachers-day-gifts': {
    title: "Teachers' Day Gifts",
    description: 'Thank your teachers with meaningful gifts they will appreciate',
    metaTitle: "Teachers' Day Gifts | Thank Your Teacher",
    metaDescription: "Find the perfect Teachers Day gifts. Personalized mugs, pens, accessories and thoughtful gifts for teachers.",
    filters: { occasion: "Teachers' Day" },
    showCategories: false,
  },
  'best-sellers': {
    title: 'Best Sellers',
    description: 'Most loved gifts by our customers',
    metaTitle: 'Best Sellers | Top Rated Gifts',
    metaDescription: 'Shop our best-selling gifts. Top-rated and most loved gifts by customers with free delivery.',
    filters: { sort: 'rating' },
    showCategories: false,
  },
  'premium-gifts': {
    title: 'Premium Gifts',
    description: 'Luxury gifts for special occasions',
    metaTitle: 'Premium Gifts | Luxury Gift Ideas',
    metaDescription: 'Discover premium luxury gifts for special occasions. High-quality exclusive gifts with free delivery.',
    filters: { minPrice: 999 },
    showCategories: false,
  },
  'gifts-under-499': {
    title: 'Gifts Under ₹499',
    description: 'Affordable gifts that don\'t compromise on quality',
    metaTitle: 'Gifts Under ₹499 | Budget Friendly Gifts',
    metaDescription: 'Find amazing gifts under ₹499. Budget-friendly gifts with free delivery.',
    filters: { maxPrice: 499 },
    showCategories: false,
  },
  'gifts-under-999': {
    title: 'Gifts Under ₹999',
    description: 'Great gifts at great prices',
    metaTitle: 'Gifts Under ₹999 | Affordable Gift Ideas',
    metaDescription: 'Shop gifts under ₹999. Affordable gifts with free delivery.',
    filters: { maxPrice: 999 },
    showCategories: false,
  },
};

const LandingPage = () => {
  const { slug } = useParams();
  const config = LANDING_PAGE_CONFIGS[slug];
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProductsApi({ ...config.filters, limit: 24 }).catch(() => ({ data: { data: { products: [] } } })),
          config.showCategories
            ? getCategoriesApi({
                showOnHomepage: true,
                parentCategory: 'null',
                isActive: true,
              }).catch(() => ({ data: { data: { categories: [] } } }))
            : Promise.resolve({ data: { data: { categories: [] } } }),
        ]);

        setProducts(productsRes.data.data.products);
        setCategories(categoriesRes.data.data.categories);
      } catch (error) {
        console.error('[LandingPage] Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [slug, config]);

  useEffect(() => {
    if (config?.metaTitle) {
      document.title = config.metaTitle;
    }
    if (config?.metaDescription) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', config.metaDescription);
      }
    }

    // OG Image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', 'https://thegiftshelf.com/og-image.jpg');
    }

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://thegiftshelf.com/${slug}`);
    }

    // Schema.org structured data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: config.title,
      description: config.metaDescription,
      url: `https://thegiftshelf.com/${slug}`,
    };

    const existingSchema = document.getElementById('structured-data');
    if (existingSchema) {
      existingSchema.remove();
    }

    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    // Breadcrumb schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://thegiftshelf.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: config.title,
          item: `https://thegiftshelf.com/${slug}`,
        },
      ],
    };

    const existingBreadcrumb = document.getElementById('breadcrumb-schema');
    if (existingBreadcrumb) {
      existingBreadcrumb.remove();
    }

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = 'breadcrumb-schema';
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);
  }, [config, slug]);

  if (!config) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-ink/60">Page not found</p>
      </div>
    );
  }

  if (isLoading) return <Loader fullScreen />;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-12 sm:py-16">
        <div className="container-tgs text-center">
          <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl">
            {config.title}
          </h1>
          <p className="mt-4 text-lg text-charcoal/70 sm:text-xl">
            {config.description}
          </p>
        </div>
      </section>

      {/* Categories */}
      {config.showCategories && categories.length > 0 && (
        <section className="container-tgs py-10 sm:py-12">
          <FeaturedCategories categories={categories} />
        </section>
      )}

      {/* Products */}
      <section className="container-tgs py-10 sm:py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink/60">No products found</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between sm:mb-8">
              <p className="text-sm text-ink/60">{products.length} products</p>
            </div>
            <ProductGrid products={products} />
          </>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
