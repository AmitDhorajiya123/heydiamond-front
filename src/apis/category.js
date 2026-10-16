import api from "./axiosClient";

export const categoryApi = {
    // Get all categories with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/categories', { params });
        return response.data;
    },

    // Get single category by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/categories/${encryptedId}`);
        return response.data;
    },

    // Create new category
    create: async (data) => {
        const response = await api.post('/categories', data);
        return response.data;
    },

    // Update category by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/categories/${encryptedId}`, data);
        return response.data;
    },

    // Delete category by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/categories/${encryptedId}`);
        return response.data;
    },
};

export default categoryApi;
