import axiosInstance from './axiosInstance.js';

export const getDashboardStatsApi = () => axiosInstance.get('/stats/dashboard');