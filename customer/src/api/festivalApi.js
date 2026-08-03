import axiosInstance from './axiosInstance.js';

export const getActiveFestivalApi = () => axiosInstance.get('/festivals/active');

export const getFeaturedSectionBySlugApi = (slug) => axiosInstance.get(`/festivals/featured/${slug}`);
