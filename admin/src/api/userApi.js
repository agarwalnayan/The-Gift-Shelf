import axiosInstance from './axiosInstance.js';

export const getAllUsersApi = () => axiosInstance.get('/users');

export const updateUserStatusApi = (id, isActive) => axiosInstance.patch(`/users/${id}/status`, { isActive });
