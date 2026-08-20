import axiosInstance from './axiosInstance.js';

export const getPublicOrderRequestApi = async (token) => {
  const response = await axiosInstance.get(`/order-requests/public/${token}`);
  return response.data;
};

export const completeOrderRequestApi = async (token, data) => {
  const response = await axiosInstance.post(`/order-requests/public/${token}/complete`, data);
  return response.data;
};
