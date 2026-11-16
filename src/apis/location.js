import api from "./axiosClient";

export const locationApi = {
    // Get all locations with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/locations', { params });
        return response.data;
    },

    // Get single location by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/locations/${encodeURIComponent(encryptedId)}`);
        return response.data;
    },

    // Create new location
    create: async (data) => {
        const response = await api.post('/locations', data);
        return response.data;
    },

    // Update location by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/locations/${encodeURIComponent(encryptedId)}`, data);
        return response.data;
    },

    // Delete location by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/locations/${encodeURIComponent(encryptedId)}`);
        return response.data;
    },
};

export default locationApi;
