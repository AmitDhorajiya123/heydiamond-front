// Simple localStorage-backed auth persistence.
// Kept separate from axiosClient/auth api modules to avoid import cycles.

const TOKEN_KEY = 'hd_token';
const USER_KEY = 'hd_user';

export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const getStoredUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setAuth = (token, user) => {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        }
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    } catch {
        // storage unavailable (private mode) - session still works in memory
    }
};

export const clearAuth = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch {
        // ignore
    }
};

export const isAdmin = (user) => {
    return !!user && String(user.role || '').toLowerCase() === 'admin';
};
