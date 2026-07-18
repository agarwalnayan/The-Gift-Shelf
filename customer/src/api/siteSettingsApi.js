import api from './axiosinstance';

export const getSiteSettings = async () => {
    const { data } = await api.get('/site-settings');
    return data.data;
};