import api from "./axiosClient";

export const shapeApi = {
    // Get all shapes with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/shapes', { params });
        return response.data;
    },

    // Get single shape by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/shapes/${encryptedId}`);
        return response.data;
    },

    // Create new shape
    create: async (data) => {
        const response = await api.post('/shapes', data);
        return response.data;
    },

    // Update shape by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/shapes/${encryptedId}`, data);
        return response.data;
    },

    // Delete shape by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/shapes/${encryptedId}`);
        return response.data;
    },
};

export default shapeApi;
