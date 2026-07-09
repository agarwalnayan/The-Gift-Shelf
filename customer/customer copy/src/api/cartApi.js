import axiosInstance from './axiosInstance.js';

export const getCartApi = () => axiosInstance.get('/cart');

export const addToCartApi = (payload) => axiosInstance.post('/cart', payload);

export const updateCartItemApi = (payload) => axiosInstance.patch('/cart', payload);

export const removeFromCartApi = (itemId) => axiosInstance.delete(`/cart/${itemId}`);

export const clearCartApi = () => axiosInstance.delete('/cart');
