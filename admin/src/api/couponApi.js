import axiosInstance from './axiosInstance.js';

export const getCouponsApi = () => axiosInstance.get('/coupons');

export const createCouponApi = (payload) => axiosInstance.post('/coupons', payload);

export const updateCouponApi = (id, payload) => axiosInstance.put(`/coupons/${id}`, payload);

export const deleteCouponApi = (id) => axiosInstance.delete(`/coupons/${id}`);