import axiosInstance from './axiosInstance.js';

export const getCategoriesApi = (params) => axiosInstance.get('/categories', { params });

export const getCategoryTreeApi = () => axiosInstance.get('/categories/tree');

export const getCategoryByIdApi = (id) => axiosInstance.get(`/categories/${id}`);

export const createCategoryApi = (formData) =>
  axiosInstance.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateCategoryApi = (id, formData) =>
  axiosInstance.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateCategoryStatusApi = (id, isActive) => axiosInstance.patch(`/categories/${id}/status`, { isActive });

export const updateCategoryFeatureApi = (id, payload) => axiosInstance.patch(`/categories/${id}/feature`, payload);

export const reorderCategoriesApi = (items) => axiosInstance.patch('/categories/reorder', { items });

export const softDeleteCategoryApi = (id) => axiosInstance.delete(`/categories/${id}`);

export const restoreCategoryApi = (id) => axiosInstance.patch(`/categories/${id}/restore`);

export const permanentlyDeleteCategoryApi = (id) => axiosInstance.delete(`/categories/${id}/permanent`);
