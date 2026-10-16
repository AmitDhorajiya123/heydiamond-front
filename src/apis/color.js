import api from "./axiosClient";

export const colorApi = {
    // Get all colors with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/colors', { params });
        return response.data;
    },

    // Get single color by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/colors/${encryptedId}`);
        return response.data;
    },

    // Create new color
    create: async (data) => {
        const response = await api.post('/colors', data);
        return response.data;
    },

    // Update color by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/colors/${encryptedId}`, data);
        return response.data;
    },

    // Delete color by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/colors/${encryptedId}`);
        return response.data;
    },
};

export default colorApi;
