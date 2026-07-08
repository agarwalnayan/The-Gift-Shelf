import axiosInstance from './axiosInstance.js';

export const getProductsApi = (params) => axiosInstance.get('/products', { params });

export const getProductByIdApi = (id) => axiosInstance.get(`/products/${id}`);

export const createProductApi = (formData) =>
  axiosInstance.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateProductApi = (id, formData) =>
  axiosInstance.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateProductImagesApi = (id, formData) =>
  axiosInstance.patch(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateProductStatusApi = (id, isActive) => axiosInstance.patch(`/products/${id}/status`, { isActive });

export const updateProductPublishStatusApi = (id, publishStatus) =>
  axiosInstance.patch(`/products/${id}/publish`, { publishStatus });

export const updateProductFeatureApi = (id, isFeatured) => axiosInstance.patch(`/products/${id}/feature`, { isFeatured });

export const bulkProductActionApi = (ids, action) => axiosInstance.patch('/products/bulk', { ids, action });

export const softDeleteProductApi = (id) => axiosInstance.delete(`/products/${id}`);

export const restoreProductApi = (id) => axiosInstance.patch(`/products/${id}/restore`);

export const permanentlyDeleteProductApi = (id) => axiosInstance.delete(`/products/${id}/permanent`);
