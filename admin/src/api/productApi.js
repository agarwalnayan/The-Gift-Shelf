import axiosInstance from './axiosInstance.js';

export const getProductsApi = (params) => axiosInstance.get('/products', { params });

export const getProductBySlugApi = (slug) => axiosInstance.get(`/products/${slug}`);

export const createProductApi = (formData) =>
  axiosInstance.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateProductApi = (id, formData) =>
  axiosInstance.patch(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteProductApi = (id) => axiosInstance.delete(`/products/${id}`);
