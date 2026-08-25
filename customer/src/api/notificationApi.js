import axiosInstance from './axiosInstance.js';

export const getNotificationsApi = () => axiosInstance.get('/notifications');

export const getUnreadCountApi = () => axiosInstance.get('/notifications/unread-count');

export const markAsReadApi = (id) => axiosInstance.patch(`/notifications/${id}/read`);

export const markAllAsReadApi = () => axiosInstance.patch('/notifications/read-all');

export const deleteNotificationApi = (id) => axiosInstance.delete(`/notifications/${id}`);
