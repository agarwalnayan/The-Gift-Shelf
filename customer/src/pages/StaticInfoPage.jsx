import { useEffect, useState } from 'react';
import Loader from '../components/common/Loader';
import { getSiteSettings } from '../api/siteSettingsApi';

const StaticInfoPage = ({ slug }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    setLoading(true);

    let title = '';
    let content = '';

    try {
      const settings = await getSiteSettings();

      switch (slug) {
        case 'about':
          title = 'About Us';
          content = settings.policies?.aboutUs || '';
          break;

        case 'privacy-policy':
          title = 'Privacy Policy';
          content = settings.policies?.privacyPolicy || '';
          break;

        case 'shipping-policy':
          title = 'Shipping Policy';
          content = settings.policies?.shippingPolicy || '';
          break;

        case 'returns':
          title = 'Returns & Refund Policy';
          content = settings.policies?.returnPolicy || '';
          break;

        case 'terms-of-service':
          title = 'Terms & Conditions';
          content = settings.policies?.termsAndConditions || '';
          break;

        default:
          title = 'About Us';
          content = settings.policies?.aboutUs || '';
      }

      setPage({
        title,
        content,
      });
    } catch (error) {
      console.error(error);

      setPage({
        title: 'Error',
        content: '<p>Unable to load content.</p>',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container-tgs max-w-2xl py-14 sm:py-16">
      <h1 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
        {page?.title}
      </h1>

      <div className="mt-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: page?.content || '<p>No content available.</p>',
          }}
        />
      </div>
    </div>
  );
};

export default StaticInfoPage;