import api from './axiosClient';

export const featuredAdsApi = {
    list: async () => {
        const response = await api.get('/featured-ads');
        return response.data;
    },

    add: async (encryptedId, position) => {
        const payload = { encrypted_id: encryptedId };
        if (position) payload.position = position;

        const response = await api.post('/featured-ads', payload);
        return response.data;
    },

    remove: async (adEncryptedId) => {
        const response = await api.delete(`/featured-ads/${encodeURIComponent(adEncryptedId)}`);
        return response.data;
    },
};

export default featuredAdsApi;
