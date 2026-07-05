import axiosInstance from './axiosInstance.js';

export const getCartApi = () => axiosInstance.get('/cart');

export const addToCartApi = (payload) => axiosInstance.post('/cart', payload);

export const updateCartItemApi = (payload) => axiosInstance.patch('/cart', payload);

export const removeFromCartApi = (productId) => axiosInstance.delete(`/cart/${productId}`);

export const clearCartApi = () => axiosInstance.delete('/cart');
