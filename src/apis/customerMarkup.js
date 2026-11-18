import api from "./axiosClient";

export const customerMarkupApi = {
    // Paginated customers (role: user) with search/sort support
    list: async (params = {}) => {
        const response = await api.get('/customer-markups', { params });
        return response.data;
    },

    // Lightweight searchable customer options for the picker
    options: async (params = {}) => {
        const response = await api.get('/customer-markups/options', { params });
        return response.data;
    },

    // Single customer markup configuration
    get: async (encryptedId) => {
        const response = await api.get(`/customer-markups/${encodeURIComponent(encryptedId)}`);
        return response.data;
    },

    // Replace the default markup and range slabs for a customer
    update: async (encryptedId, payload) => {
        const response = await api.put(`/customer-markups/${encodeURIComponent(encryptedId)}`, payload);
        return response.data;
    },
};

export default customerMarkupApi;
