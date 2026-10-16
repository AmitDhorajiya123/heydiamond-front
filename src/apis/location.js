import api from "./axiosClient";

export const locationApi = {
    // Get all locations with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/locations', { params });
        return response.data;
    },

    // Get single location by plain numeric ID (locations API uses plain IDs)
    get: async (id) => {
        const response = await api.get(`/locations/${id}`);
        return response.data;
    },

    // Create new location
    create: async (data) => {
        const response = await api.post('/locations', data);
        return response.data;
    },

    // Update location by plain numeric ID
    update: async (id, data) => {
        const response = await api.put(`/locations/${id}`, data);
        return response.data;
    },

    // Delete location by plain numeric ID
    remove: async (id) => {
        const response = await api.delete(`/locations/${id}`);
        return response.data;
    },
};

export default locationApi;
