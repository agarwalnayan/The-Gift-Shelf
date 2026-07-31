import axiosInstance from './axiosInstance.js';

/* ---- Banners (Hero + Promo) ---- */
export const getBannersApi = (params = {}) => {
  if (typeof params === 'string') {
    params = { type: params };
  }
  return axiosInstance.get('/marketing/banners', { params });
};
export const createBannerApi = (formData) => axiosInstance.post('/marketing/banners', formData);
export const updateBannerApi = (id, formData) => axiosInstance.put(`/marketing/banners/${id}`, formData);
export const updateBannerStatusApi = (id, isActive) =>
  axiosInstance.patch(`/marketing/banners/${id}/status`, { isActive });
export const reorderBannersApi = (items) => axiosInstance.patch('/marketing/banners/reorder', { items });
export const deleteBannerApi = (id) => axiosInstance.delete(`/marketing/banners/${id}`);
export const permanentlyDeleteBannerApi = (id) => axiosInstance.delete(`/marketing/banners/${id}/permanent`);

/* ---- Featured Items (Recipient + Occasion) ---- */
/* MIGRATED: Now uses CatalogMaster with showOnHomepage and homepageDisplayOrder */
export const getFeaturedItemsApi = (type) => axiosInstance.get('/marketing/featured-items', { params: { type } });
export const updateFeaturedItemApi = (id, formData) => axiosInstance.put(`/marketing/featured-items/${id}`, formData);
export const updateFeaturedItemStatusApi = (id, isActive) =>
  axiosInstance.patch(`/marketing/featured-items/${id}/status`, { isActive });
export const reorderFeaturedItemsApi = (items) => axiosInstance.patch('/marketing/featured-items/reorder', { items });

/* ---- Budget Collections (fixed 3 tiers) ---- */
export const getBudgetCollectionsApi = () => axiosInstance.get('/marketing/budget-collections');
export const upsertBudgetCollectionApi = (tier, formData) =>
  axiosInstance.put(`/marketing/budget-collections/${tier}`, formData);

/* ---- Site Settings (Announcement Bar + Welcome Popup) ---- */
export const getSiteSettingsApi = () => axiosInstance.get('/marketing/settings');
export const updateSiteSettingsApi = (payload) => axiosInstance.put('/marketing/settings', payload);
export const updateAnnouncementBarApi = (payload) => axiosInstance.put('/marketing/settings/announcement-bar', payload);
export const updateWelcomePopupApi = (formData) => axiosInstance.put('/marketing/settings/welcome-popup', formData);
export const updateCommerceSettingsApi = (payload) => axiosInstance.put('/marketing/settings/commerce', payload);