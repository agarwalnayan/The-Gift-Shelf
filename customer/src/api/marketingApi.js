import axiosInstance from './axiosInstance.js';

// Single aggregated call powering the entire homepage marketing surface
// (hero slider, promo banners, featured recipients/occasions, budget
// collections, announcement bar, welcome popup) — one request instead of
// the 6-7 separate ones each section would otherwise need on mount.
export const getHomepageContentApi = () => axiosInstance.get('/marketing/homepage');
