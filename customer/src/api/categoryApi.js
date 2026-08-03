import axiosInstance from './axiosInstance.js';

export const getCategoryBySlugApi = (slug) => axiosInstance.get(`/categories/${slug}`);
