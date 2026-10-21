import axios from "axios";
import { getToken, clearAuth } from "../utils/authStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

// Attach Bearer token to every request (covers all api modules).
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// On 401 the token is invalid/expired: clear auth and bounce to login.
// Login/register requests are excluded so their own 401/422 can surface.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthCall = url.includes('/login') || url.includes('/register');
        if (error.response?.status === 401 && !isAuthCall) {
            clearAuth();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
