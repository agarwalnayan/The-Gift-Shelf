import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getPublicOrderRequestApi = async (token) => {
  const response = await axios.get(`${API_URL}/order-requests/public/${token}`);
  return response.data;
};

export const completeOrderRequestApi = async (token, data) => {
  const response = await axios.post(`${API_URL}/order-requests/public/${token}/complete`, data);
  return response.data;
};
