import axiosInstance from './axiosInstance.js';

export const getCouponsApi = () => axiosInstance.get('/coupons');

export const getActiveCouponsApi = () => axiosInstance.get('/coupons?active=true');

export const createCouponApi = (payload) => axiosInstance.post('/coupons', payload);

export const updateCouponApi = (id, payload) => axiosInstance.put(`/coupons/${id}`, payload);

export const deleteCouponApi = (id) => axiosInstance.delete(`/coupons/${id}`);

export const validateCouponApi = (code, subtotal) => 
  axiosInstance.post('/coupons/validate', { code, subtotal });