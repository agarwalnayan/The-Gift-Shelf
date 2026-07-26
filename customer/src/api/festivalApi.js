import axiosInstance from './axiosInstance.js';

export const getActiveFestivalApi = () => axiosInstance.get('/festivals/active');
