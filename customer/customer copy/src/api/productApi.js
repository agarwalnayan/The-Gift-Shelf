import axiosInstance from './axiosInstance.js';

export const getProductsApi = (params) => axiosInstance.get('/products', { params });

export const getProductBySlugApi = (slug) => axiosInstance.get(`/products/${slug}`);

export const uploadCustomizationImageApi = (productId, formData) =>
  axiosInstance.post(`/products/${productId}/customization-image`, formData);

export const getCategoriesApi = () => axiosInstance.get('/categories');

export const getCategoryBySlugApi = (slug) => axiosInstance.get(`/categories/${slug}`);
