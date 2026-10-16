import api from "./axiosClient";

export const clarityApi = {
    // Get all clarities with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/clarities', { params });
        return response.data;
    },

    // Get single clarity by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/clarities/${encryptedId}`);
        return response.data;
    },

    // Create new clarity
    create: async (data) => {
        const response = await api.post('/clarities', data);
        return response.data;
    },

    // Update clarity by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/clarities/${encryptedId}`, data);
        return response.data;
    },

    // Delete clarity by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/clarities/${encryptedId}`);
        return response.data;
    },
};

export default clarityApi;
