import api from "./axiosClient";

export const diamondApi = {
    // Get all diamonds with pagination, search, and filters
    list: async (params = {}, options = {}) => {
        const response = await api.get('/diamonds', { params, ...options });
        return response.data;
    },

    // Get single diamond by ID
    get: async (id) => {
        const response = await api.get(`/diamonds/${id}`);
        return response.data;
    },

    // Create new diamond
    create: async (data) => {
        const response = await api.post('/diamonds', data);
        return response.data;
    },

    // Update diamond by ID
    update: async (id, data) => {
        const response = await api.put(`/diamonds/${id}`, data);
        return response.data;
    },

    // Delete diamond by ID
    remove: async (id) => {
        const response = await api.delete(`/diamonds/${id}`);
        return response.data;
    },

    // Sync diamonds from external API
    sync: async () => {
        const response = await api.post('/diamonds/sync');
        return response.data;
    },
};

export default diamondApi;