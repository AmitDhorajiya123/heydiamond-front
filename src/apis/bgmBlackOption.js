import api from "./axiosClient";

export const bgmBlackOptionApi = {
    // Get all BGM/Black options with pagination and search
    getOptions: async (params = {}) => {
        const response = await api.get('/bgm-black-options', { params });
        return response.data;
    },

    // Get single option by encrypted ID
    getOption: async (encryptedId) => {
        const response = await api.get(`/bgm-black-options/${encryptedId}`);
        return response.data;
    },

    // Create new option
    createOption: async (data) => {
        const response = await api.post('/bgm-black-options', data);
        return response.data;
    },

    // Update option by encrypted ID
    updateOption: async (encryptedId, data) => {
        const response = await api.put(`/bgm-black-options/${encryptedId}`, data);
        return response.data;
    },

    // Delete option by encrypted ID
    deleteOption: async (encryptedId) => {
        const response = await api.delete(`/bgm-black-options/${encryptedId}`);
        return response.data;
    },
};

export default bgmBlackOptionApi;
