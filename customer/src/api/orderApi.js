import axiosInstance from './axiosInstance.js';

export const createOrderApi = (payload) => axiosInstance.post('/orders', payload);

export const verifyPaymentApi = (payload) => axiosInstance.post('/orders/verify-payment', payload);

export const getMyOrdersApi = () => axiosInstance.get('/orders/my-orders');

export const getOrderByIdApi = (id) => axiosInstance.get(`/orders/${id}`);
