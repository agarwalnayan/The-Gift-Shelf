import axiosInstance from './axiosInstance.js';

export const loginApi = (payload) => axiosInstance.post('/auth/login', payload);

export const logoutApi = () => axiosInstance.post('/auth/logout');

export const getCurrentUserApi = () => axiosInstance.get('/auth/me');
