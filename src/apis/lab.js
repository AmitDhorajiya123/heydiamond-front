import api from "./axiosClient";

export const labApi = {
    // Get all labs with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/labs', { params });
        return response.data;
    },

    // Get single lab by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/labs/${encryptedId}`);
        return response.data;
    },

    // Create new lab
    create: async (data) => {
        const response = await api.post('/labs', data);
        return response.data;
    },

    // Update lab by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/labs/${encryptedId}`, data);
        return response.data;
    },

    // Delete lab by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/labs/${encryptedId}`);
        return response.data;
    },
};

export default labApi;
