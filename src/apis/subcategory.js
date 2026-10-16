import api from "./axiosClient";

export const subcategoryApi = {
    // Get all subcategories with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/subcategories', { params });
        return response.data;
    },

    // Get single subcategory by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/subcategories/${encryptedId}`);
        return response.data;
    },

    // Create new subcategory
    create: async (data) => {
        const response = await api.post('/subcategories', data);
        return response.data;
    },

    // Update subcategory by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/subcategories/${encryptedId}`, data);
        return response.data;
    },

    // Delete subcategory by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/subcategories/${encryptedId}`);
        return response.data;
    },
};

export default subcategoryApi;
