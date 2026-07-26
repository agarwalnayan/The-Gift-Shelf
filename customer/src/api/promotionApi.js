import axiosInstance from './axiosInstance.js';

export const evaluatePromotionsApi = (cartData) => 
  axiosInstance.post('/promotions/evaluate', cartData);

export const getApplicablePromotionsApi = (params) => 
  axiosInstance.get('/promotions', { params });
