import api from './axiosInstance';

export const getSiteSettings = async () => {
    const { data } = await api.get('/site-settings');
    return data.data;
};

export const updateSiteSettings = async (payload) => {
    const { data } = await api.put('/site-settings', payload);
    return data.data;
};