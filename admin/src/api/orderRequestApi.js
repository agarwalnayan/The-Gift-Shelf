import axiosInstance from './axiosInstance.js';

export const createOrderRequestApi = (data) => axiosInstance.post('/order-requests', data);

export const getOrderRequestsApi = (params) => axiosInstance.get('/order-requests', { params });

export const getOrderRequestByIdApi = (id) => axiosInstance.get(`/order-requests/${id}`);

export const cancelOrderRequestApi = (id) => axiosInstance.patch(`/order-requests/${id}/cancel`);
