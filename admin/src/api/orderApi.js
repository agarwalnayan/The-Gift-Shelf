import axiosInstance from './axiosInstance.js';

export const getAllOrdersApi = (params) => axiosInstance.get('/orders', { params });

export const getOrderByIdApi = (id) => axiosInstance.get(`/orders/${id}`);

export const updateOrderStatusApi = (id, orderStatus) => axiosInstance.patch(`/orders/${id}/status`, { orderStatus });

export const updatePaymentStatusApi = (id, paymentStatus) =>
    axiosInstance.patch(`/orders/${id}/payment-status`, { paymentStatus });

export const updateOrderTrackingApi = (id, payload) => axiosInstance.patch(`/orders/${id}/tracking`, payload);

export const deleteOrderApi = (id) => axiosInstance.delete(`/orders/${id}`);