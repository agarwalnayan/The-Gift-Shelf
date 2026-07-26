import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineGift, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { getSiteSettingsApi, updateSiteSettingsApi } from '../../api/marketingApi.js';
import { getActiveFestivalApi } from '../../api/festivalApi.js';
import Toggle from '../common/Toggle.jsx';
import { HOMEPAGE_SECTIONS as SECTIONS } from '../../utils/homepageSections.js';

const ManagementOverview = ({ settings, onRefresh }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeFestival, setActiveFestival] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    loadActiveFestival();
  }, []);

  const loadActiveFestival = async () => {
    try {
      const { data } = await getActiveFestivalApi().catch(() => ({ data: { data: { festival: null } } }));
      setActiveFestival(data.data.festival);
    } catch (error) {
      console.error('Failed to load festival:', error);
    }
  };

  const handleToggleSection = async (sectionKey) => {
    if (!localSettings) return;
    
    const homepageConfig = localSettings.homepageConfig || {};
    const newConfig = {
      ...homepageConfig,
      [sectionKey]: !homepageConfig[sectionKey],
    };

    setIsSaving(true);
    try {
      await updateSiteSettingsApi({ homepageConfig: newConfig });
      setLocalSettings(prev => ({ ...prev, homepageConfig: newConfig }));
      onRefresh?.();
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isSectionVisible = (sectionKey) => {
    return localSettings?.homepageConfig?.[sectionKey] !== false;
  };

  return (
    <div className="space-y-6">
      {/* Active Festival Status */}
      {activeFestival && (
        <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlineGift size={24} className="text-primary-600" />
              <div>
                <p className="font-semibold text-ink">Active Festival: {activeFestival.name}</p>
                <p className="text-sm text-ink/60">
                  {new Date(activeFestival.startDate).toLocaleDateString()} - {new Date(activeFestival.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Link to={`/festivals/${activeFestival._id}`} className="btn-primary text-sm">
              Edit Festival
            </Link>
          </div>
        </div>
      )}

      {/* Section Visibility */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-ink mb-2">Section Visibility</h3>
        <p className="text-sm text-ink/60 mb-6">
          Toggle sections on or off to control what appears on the homepage
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

      {/* Tips */}
      <div className="card p-6">
        <h4 className="text-sm font-semibold text-ink mb-3">Tips</h4>
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
            Use Festival configuration to automatically switch homepage content for seasonal campaigns
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600">•</span>
            All marketing changes are synchronized instantly across the customer website
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ManagementOverview;