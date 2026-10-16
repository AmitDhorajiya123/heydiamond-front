import api from "./axiosClient";

export const finishGradeApi = {
    // Get all finish grades with pagination and search
    list: async (params = {}) => {
        const response = await api.get('/finish-grades', { params });
        return response.data;
    },

    // Get single finish grade by encrypted ID
    get: async (encryptedId) => {
        const response = await api.get(`/finish-grades/${encryptedId}`);
        return response.data;
    },

    // Create new finish grade
    create: async (data) => {
        const response = await api.post('/finish-grades', data);
        return response.data;
    },

    // Update finish grade by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/finish-grades/${encryptedId}`, data);
        return response.data;
    },

    // Delete finish grade by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/finish-grades/${encryptedId}`);
        return response.data;
    },
};

export default finishGradeApi;
