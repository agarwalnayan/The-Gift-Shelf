import axiosInstance from './axiosInstance.js';

export const getPromotionsApi = (params) => axiosInstance.get('/promotions', { params });

export const getPromotionByIdApi = (id) => axiosInstance.get(`/promotions/${id}`);

export const createPromotionApi = (formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return axiosInstance.post('/promotions', formData, config);
};

export const updatePromotionApi = (id, formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return axiosInstance.patch(`/promotions/${id}`, formData, config);
};

export const updatePromotionStatusApi = (id, status) => 
  axiosInstance.patch(`/promotions/${id}/status`, { status });

export const deletePromotionApi = (id) => axiosInstance.delete(`/promotions/${id}`);
