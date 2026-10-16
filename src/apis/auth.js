import api from "./axiosClient";

export const authApi = {
    // POST /login -> { success, message, data: { token_type, access_token, user } }
    login: async (credentials) => {
        const response = await api.post('/login', credentials);
        return response.data;
    },

    // POST /logout (revokes current token)
    logout: async () => {
        const response = await api.post('/logout');
        return response.data;
    },

    // GET /profile -> { success, message, data: user }
    profile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },
};

export default authApi;
