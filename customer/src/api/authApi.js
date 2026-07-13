import axiosInstance from './axiosInstance.js';

export const registerApi = (payload) => axiosInstance.post('/auth/register', payload);

export const loginApi = (payload) => axiosInstance.post('/auth/login', payload);

export const logoutApi = () => axiosInstance.post('/auth/logout');

export const getCurrentUserApi = () => axiosInstance.get('/auth/me');

export const updateProfileApi = (payload) => axiosInstance.patch('/users/profile', payload);

export const addAddressApi = (payload) => axiosInstance.post('/users/addresses', payload);

export const updateAddressApi = (addressId, payload) => axiosInstance.put(`/users/addresses/${addressId}`, payload);

export const deleteAddressApi = (addressId) => axiosInstance.delete(`/users/addresses/${addressId}`);

export const toggleWishlistApi = (productId) => axiosInstance.patch(`/users/wishlist/${productId}`);