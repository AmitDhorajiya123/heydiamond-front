import api from "./axiosClient";

export const dashboardApi = {
    // Get aggregated counts from all master tables
    getCounts: async () => {
        const response = await api.get('/dashboard/counts');
        return response.data;
    },
};

export default dashboardApi;