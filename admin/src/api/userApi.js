import axiosInstance from './axiosInstance.js';

export const getAllUsersApi = () => axiosInstance.get('/users');

export const getUserByIdApi = (id) => axiosInstance.get(`/users/${id}`);

export const updateUserStatusApi = (id, isActive) => axiosInstance.patch(`/users/${id}/status`, { isActive });

export const resetUserPasswordApi = (id, data) => axiosInstance.patch(`/users/${id}/reset-password`, data);
