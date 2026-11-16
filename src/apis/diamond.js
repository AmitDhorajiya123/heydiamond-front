import api from "./axiosClient";

export const diamondApi = {
    // Get all diamonds with pagination, search, and filters
    list: async (params = {}, options = {}) => {
        const response = await api.get('/diamonds', { params, ...options });
        return response.data;
    },

    // Same as list, but the filters travel in the request body (not the URL)
    search: async (payload = {}, options = {}) => {
        const response = await api.post('/diamonds/search', payload, options);
        return response.data;
    },

    // Distinct country / state / city values for the filter page
    locationOptions: async () => {
        const response = await api.get('/diamonds/location-options');
        return response.data;
    },

    // Get single diamond by ID
    get: async (id) => {
        const response = await api.get(`/diamonds/${id}`);
        return response.data;
    },

    // Get single diamond by its encrypted ID (DNA page URL)
    getByEncryptedId: async (encryptedId) => {
        const response = await api.get(`/diamonds/${encodeURIComponent(encryptedId)}`);
        return response.data;
    },

    // Create new diamond
    create: async (data) => {
        const response = await api.post('/diamonds', data);
        return response.data;
    },

    // Update diamond by encrypted ID
    update: async (encryptedId, data) => {
        const response = await api.put(`/diamonds/${encodeURIComponent(encryptedId)}`, data);
        return response.data;
    },

    // Delete diamond by encrypted ID
    remove: async (encryptedId) => {
        const response = await api.delete(`/diamonds/${encodeURIComponent(encryptedId)}`);
        return response.data;
    },

    // Sync diamonds from external API
    sync: async (data = {}, options = {}) => {
        const response = await api.post('/diamonds/sync', data, options);
        return response.data;
    },

    // List all configured external API clients (DB driven source list)
    apiClients: async () => {
        const response = await api.get('/diamonds/api-clients');
        return response.data;
    },

    // Create a new external API client
    createApiClient: async (data = {}) => {
        const response = await api.post('/diamonds/api-clients', data);
        return response.data;
    },

    // Update an existing external API client (encrypted ID)
    updateApiClient: async (encryptedId, data = {}) => {
        const response = await api.put(`/diamonds/api-clients/${encodeURIComponent(encryptedId)}`, data);
        return response.data;
    },

    // Remove an external API client (encrypted ID)
    deleteApiClient: async (encryptedId) => {
        const response = await api.delete(`/diamonds/api-clients/${encodeURIComponent(encryptedId)}`);
        return response.data;
    },
};

export default diamondApi;