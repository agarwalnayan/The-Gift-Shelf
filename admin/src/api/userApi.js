import axiosInstance from './axiosInstance.js';

export const getAllUsersApi = () => axiosInstance.get('/users');

export const getCustomersApi = () => axiosInstance.get('/users/customers');

export const getUserByIdApi = (id) => axiosInstance.get(`/users/${id}`);

export const updateUserStatusApi = (id, isActive) => axiosInstance.patch(`/users/${id}/status`, { isActive });

export const resetUserPasswordApi = (id, data) => axiosInstance.patch(`/users/${id}/reset-password`, data);

export const searchUsersApi = (query) => axiosInstance.get('/users/search', { params: { q: query } });
