import axiosInstance from './axiosInstance.js';

export const getAllOrdersApi = (params) => axiosInstance.get('/orders', { params });

export const getOrderByIdApi = (id) => axiosInstance.get(`/orders/${id}`);

export const updateOrderStatusApi = (id, orderStatus) => axiosInstance.patch(`/orders/${id}/status`, { orderStatus });
