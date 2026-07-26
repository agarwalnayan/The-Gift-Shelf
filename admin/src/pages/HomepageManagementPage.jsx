import { useEffect, useState } from 'react';
import { HiOutlinePhoto, HiOutlineMegaphone, HiOutlineUsers, HiOutlineTag, HiOutlineCube, HiOutlineSparkles, HiOutlineCog6Tooth, HiOutlineTicket, HiOutlineTruck, HiOutlineGift, HiOutlineSquares2X2 } from 'react-icons/hi2';
import { getSiteSettingsApi, updateSiteSettingsApi } from '../api/marketingApi.js';
import { getActiveFestivalApi } from '../api/festivalApi.js';
import HomepageBuilder from '../components/marketing/HomepageBuilder.jsx';
import SiteSettingsForm from '../components/marketing/SiteSettingsForm.jsx';
import StoreCheckoutSettingsForm from '../components/marketing/StoreCheckoutSettingsForm.jsx';
import CouponManager from '../components/marketing/CouponManager.jsx';
import BannerManagement from '../components/marketing/BannerManagement.jsx';
import FeaturedManagement from '../components/marketing/FeaturedManagement.jsx';
import BudgetManagement from '../components/marketing/BudgetManagement.jsx';
import ManagementOverview from '../components/marketing/ManagementOverview.jsx';
import FestivalManagement from '../components/marketing/FestivalManagement.jsx';

const TABS = [
  { key: 'general', label: 'General', icon: HiOutlineSquares2X2 },
  { key: 'hero', label: 'Hero Banners', icon: HiOutlinePhoto },
  { key: 'promo', label: 'Promo Banners', icon: HiOutlineMegaphone },
  { key: 'recipient', label: 'Featured Recipients', icon: HiOutlineUsers },
  { key: 'occasion', label: 'Featured Occasions', icon: HiOutlineTag },
  { key: 'budget', label: 'Budget Collections', icon: HiOutlineCube },
  { key: 'sections', label: 'Homepage Sections', icon: HiOutlineSparkles },
  { key: 'announcement', label: 'Announcement & Popup', icon: HiOutlineCog6Tooth },
  { key: 'coupons', label: 'Coupons', icon: HiOutlineTicket },
  { key: 'checkout', label: 'Checkout', icon: HiOutlineTruck },
  { key: 'festival', label: 'Festival', icon: HiOutlineGift },
];

const HomepageManagementPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);

  const loadSettings = async () => {
    try {
      const { data } = await getSiteSettingsApi();
      setSettings(data.data.settings || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingsUpdate = (updatedSettings) => {
    setSettings(updatedSettings);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <ManagementOverview settings={settings} onRefresh={loadSettings} />;
      case 'hero':
        return <BannerManagement type="hero" />;
      case 'promo':
        return <BannerManagement type="promo" />;
      case 'recipient':
        return <FeaturedManagement type="recipient" />;
      case 'occasion':
        return <FeaturedManagement type="occasion" />;
      case 'budget':
        return <BudgetManagement />;
      case 'sections':
        return <HomepageBuilder />;
      case 'announcement':
        return <SiteSettingsForm settings={settings} onSaved={handleSettingsUpdate} />;
      case 'coupons':
        return <CouponManager />;
      case 'checkout':
        return <StoreCheckoutSettingsForm settings={settings} onSaved={handleSettingsUpdate} />;
      case 'festival':
        return <FestivalManagement />;
      default:
        return <ManagementOverview settings={settings} onRefresh={loadSettings} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Homepage Management</h1>
        <p className="mt-1 text-sm text-ink/60">
          Complete control panel for homepage content and marketing
        </p>
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-ink/10">
        <div className="flex gap-1 overflow-x-auto pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-700 bg-primary-50'
                  : 'border-transparent text-ink/60 hover:text-ink hover:bg-ink/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default HomepageManagementPage;
