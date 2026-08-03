import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFeaturedSectionBySlugApi } from '../api/festivalApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';

const FeaturedSectionPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        setIsLoading(true);
        const { data } = await getFeaturedSectionBySlugApi(slug);
        setSection(data.data.featuredSection);
      } catch (err) {
        setError('Featured section not found');
        console.error('Failed to fetch featured section:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSection();
  }, [slug]);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (error || !section) {
    return (
      <div className="container-tgs py-16">
        <EmptyState
          title="Section Not Found"
          description="This featured section may have been removed or is no longer available."
          actionLabel="Back to Home"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#FAF7F2] to-white py-12 lg:py-16">
        <div className="container-tgs">
          <div className="text-center">
            <h1 className="mb-4 font-display text-4xl font-semibold leading-tight text-charcoal lg:text-5xl">
              {section.title}
            </h1>
            {section.description && (
              <p className="mx-auto max-w-[600px] text-sm leading-relaxed text-neutral-600 lg:text-base">
                {section.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container-tgs py-12 lg:py-16">
        {section.products && section.products.length > 0 ? (
          <ProductGrid products={section.products} />
        ) : (
          <EmptyState
            title="No products available"
            description="This section doesn't have any products yet. Check back later!"
          />
        )}
      </div>
    </div>
  );
};

export default FeaturedSectionPage;
