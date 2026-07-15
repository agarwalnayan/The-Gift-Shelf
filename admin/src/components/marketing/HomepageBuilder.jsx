import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import Toggle from '../common/Toggle.jsx';
import { getSiteSettingsApi, updateSiteSettingsApi } from '../../api/marketingApi.js';

const SECTIONS = [
  { key: 'heroSlider', label: 'Hero Slider', description: 'Main image carousel at the top' },
  { key: 'launchOffer', label: 'Launch Offer Banner', description: 'Promotional banner below hero' },
  { key: 'featuredRecipients', label: 'Featured Recipients', description: 'Gift ideas by recipient' },
  { key: 'featuredOccasions', label: 'Featured Occasions', description: 'Gift ideas by occasion' },
  { key: 'budgetCollections', label: 'Budget Collections', description: 'Shop by price range' },
  { key: 'newArrivals', label: 'New Arrivals', description: 'Recently added products' },
  { key: 'bestSellers', label: 'Best Sellers', description: 'Top selling products' },
  { key: 'instagramFeed', label: 'Instagram Feed', description: 'Social media integration' },
];

const HomepageBuilder = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data } = await getSiteSettingsApi();
      setSettings(data.data.settings || {});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSection = async (sectionKey) => {
    if (!settings) return;
    
    const homepageConfig = settings.homepageConfig || {};
    const newConfig = {
      ...homepageConfig,
      [sectionKey]: !homepageConfig[sectionKey],
    };

    setIsSaving(true);
    try {
      await updateSiteSettingsApi({ homepageConfig: newConfig });
      setSettings(prev => ({ ...prev, homepageConfig: newConfig }));
      toast.success('Section visibility updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const isSectionVisible = (sectionKey) => {
    return settings?.homepageConfig?.[sectionKey] !== false;
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <p className="text-sm text-ink/50">Loading homepage settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-ink mb-2">Homepage Builder</h3>
        <p className="text-sm text-ink/60 mb-6">
          Toggle sections on or off to control what appears on the homepage. Disabled sections will be hidden from customers.
        </p>

        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <div
              key={section.key}
              className="flex items-center justify-between rounded-lg border border-ink/10 bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                {isSectionVisible(section.key) ? (
                  <HiOutlineEye size={20} className="text-green-600" />
                ) : (
                  <HiOutlineEyeSlash size={20} className="text-ink/40" />
                )}
                <div>
                  <p className="font-medium text-ink">{section.label}</p>
                  <p className="text-xs text-ink/60">{section.description}</p>
                </div>
              </div>
              <Toggle
                checked={isSectionVisible(section.key)}
                onChange={() => handleToggleSection(section.key)}
                label=""
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-sm font-semibold text-ink mb-3">Preview Tips</h4>
        <ul className="space-y-2 text-sm text-ink/70">
          <li className="flex items-start gap-2">
            <span className="text-primary-600">•</span>
            Changes are reflected immediately on the live site
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600">•</span>
            Hidden sections retain their content and can be re-enabled anytime
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600">•</span>
            Use this to temporarily hide sections during maintenance or promotions
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomepageBuilder;
