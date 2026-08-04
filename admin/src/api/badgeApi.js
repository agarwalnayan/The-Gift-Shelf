import axiosInstance from './axiosInstance.js';

export const getBadgesApi = (params) => axiosInstance.get('/badges', { params });
export const getBadgeByIdApi = (id) => axiosInstance.get(`/badges/${id}`);
export const createBadgeApi = (data) => axiosInstance.post('/badges', data);
export const updateBadgeApi = (id, data) => axiosInstance.put(`/badges/${id}`, data);
export const updateBadgeStatusApi = (id, data) => axiosInstance.patch(`/badges/${id}/status`, data);
export const deleteBadgeApi = (id) => axiosInstance.delete(`/badges/${id}`);
export const getActiveBadgesApi = () => axiosInstance.get('/badges/active');
