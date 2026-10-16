import api from "./axiosClient";

export const sizeRangeApi = {
    // Get all size ranges with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/size-ranges', { params });
        return response.data;
    },

    // Get single size range by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/size-ranges/${encryptedId}`);
        return response.data;
    },

    // Create new size range
    create: async (data) => {
        const response = await api.post('/size-ranges', data);
        return response.data;
    },

    // Update size range by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/size-ranges/${encryptedId}`, data);
        return response.data;
    },

    // Delete size range by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/size-ranges/${encryptedId}`);
        return response.data;
    },
};

export default sizeRangeApi;
