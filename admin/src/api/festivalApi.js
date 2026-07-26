import axiosInstance from './axiosInstance.js';

export const getFestivalsApi = () => axiosInstance.get('/festivals');
export const getFestivalByIdApi = (id) => axiosInstance.get(`/festivals/${id}`);
export const createFestivalApi = (formData) => axiosInstance.post('/festivals', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateFestivalApi = (id, formData) => axiosInstance.put(`/festivals/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteFestivalApi = (id) => axiosInstance.delete(`/festivals/${id}`);
export const getActiveFestivalApi = () => axiosInstance.get('/festivals/active');
