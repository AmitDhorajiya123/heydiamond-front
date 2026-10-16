import api from "./axiosClient";

export const fluorescenceApi = {
    // Get all fluorescences with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/fluorescences', { params });
        return response.data;
    },

    // Get single fluorescence by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/fluorescences/${encryptedId}`);
        return response.data;
    },

    // Create new fluorescence
    create: async (data) => {
        const response = await api.post('/fluorescences', data);
        return response.data;
    },

    // Update fluorescence by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/fluorescences/${encryptedId}`, data);
        return response.data;
    },

    // Delete fluorescence by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/fluorescences/${encryptedId}`);
        return response.data;
    },
};

export default fluorescenceApi;
