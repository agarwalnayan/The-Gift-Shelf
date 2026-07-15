import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineBuildingOffice, HiOutlineCurrencyRupee, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlineTag } from 'react-icons/hi2';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Toggle from '../components/common/Toggle.jsx';
import { getSiteSettingsApi, updateSiteSettingsApi } from '../api/marketingApi.js';
import Loader from '../components/common/Loader.jsx';

const GlobalSettingsPage = () => {
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

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSiteSettingsApi(settings);
      toast.success('Global settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;

  const globalConfig = settings?.globalConfig || {};

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Global Site Settings</h1>
        <p className="mt-1 text-sm text-ink/60">
          Manage business information, store details, and SEO settings across the entire site.
        </p>
      </div>

      <div className="card space-y-6 p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-ink/10">
          <HiOutlineBuildingOffice size={20} className="text-primary-600" />
          <h3 className="text-base font-semibold text-ink">Business Information</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Store Name"
            value={globalConfig.storeName || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, storeName: e.target.value } }))}
            placeholder="The Gift Shelf"
          />
          <Input
            label="Legal Business Name"
            value={globalConfig.legalName || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, legalName: e.target.value } }))}
            placeholder="Your Company Pvt Ltd"
          />
          <Input
            label="Contact Email"
            type="email"
            value={globalConfig.contactEmail || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, contactEmail: e.target.value } }))}
            placeholder="support@thegiftshelf.shop"
          />
          <Input
            label="Contact Phone"
            value={globalConfig.contactPhone || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, contactPhone: e.target.value } }))}
            placeholder="+91 7872030408"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Business Address</label>
          <textarea
            rows={3}
            className="input-field"
            value={globalConfig.businessAddress || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, businessAddress: e.target.value } }))}
            placeholder="123 Gift Street, Mumbai, Maharashtra 400001, India"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="GSTIN (optional)"
            value={globalConfig.gstin || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, gstin: e.target.value } }))}
            placeholder="27ABCDE1234F1Z5"
          />
          <Input
            label="PAN (optional)"
            value={globalConfig.pan || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, pan: e.target.value } }))}
            placeholder="ABCDE1234F"
          />
        </div>
      </div>

      <div className="card space-y-6 p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-ink/10">
          <HiOutlineTag size={20} className="text-primary-600" />
          <h3 className="text-base font-semibold text-ink">SEO & Metadata</h3>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Site Title</label>
          <input
            type="text"
            className="input-field"
            value={globalConfig.siteTitle || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, siteTitle: e.target.value } }))}
            placeholder="The Gift Shelf - Premium Gift Shop"
            maxLength={60}
          />
          <p className="mt-1 text-xs text-ink/50">Recommended: 50-60 characters</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Meta Description</label>
          <textarea
            rows={3}
            className="input-field"
            value={globalConfig.metaDescription || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, metaDescription: e.target.value } }))}
            placeholder="Discover premium gifts for every occasion at The Gift Shelf. Personalized gifts, hampers, and more with free shipping across India."
            maxLength={160}
          />
          <p className="mt-1 text-xs text-ink/50">Recommended: 150-160 characters</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Meta Keywords</label>
          <input
            type="text"
            className="input-field"
            value={globalConfig.metaKeywords || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, metaKeywords: e.target.value } }))}
            placeholder="gifts, personalized gifts, hampers, birthday gifts, anniversary gifts"
          />
          <p className="mt-1 text-xs text-ink/50">Separate keywords with commas</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Facebook Page URL"
            value={globalConfig.facebookUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, facebookUrl: e.target.value } }))}
            placeholder="https://facebook.com/thegiftshelf"
          />
          <Input
            label="Instagram URL"
            value={globalConfig.instagramUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, instagramUrl: e.target.value } }))}
            placeholder="https://instagram.com/thegiftshelf.shop"
          />
          <Input
            label="Twitter/X URL"
            value={globalConfig.twitterUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, twitterUrl: e.target.value } }))}
            placeholder="https://twitter.com/thegiftshelf"
          />
          <Input
            label="YouTube URL"
            value={globalConfig.youtubeUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, youtubeUrl: e.target.value } }))}
            placeholder="https://youtube.com/@thegiftshelf"
          />
        </div>
      </div>

      <div className="card space-y-6 p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-ink/10">
          <HiOutlineCurrencyRupee size={20} className="text-primary-600" />
          <h3 className="text-base font-semibold text-ink">Currency & Regional</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Currency Code</label>
            <select
              className="input-field"
              value={globalConfig.currency || 'INR'}
              onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, currency: e.target.value } }))}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Timezone</label>
            <select
              className="input-field"
              value={globalConfig.timezone || 'Asia/Kolkata'}
              onChange={(e) => setSettings(prev => ({ ...prev, globalConfig: { ...prev.globalConfig, timezone: e.target.value } }))}
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={loadSettings}>
          Reset Changes
        </Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default GlobalSettingsPage;
