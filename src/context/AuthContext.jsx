import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import authApi from '../apis/auth';
import { getToken, getStoredUser, setAuth, clearAuth, isAdmin as checkIsAdmin } from '../utils/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredUser());
    const [token, setToken] = useState(() => getToken());
    const [booting, setBooting] = useState(true);

    // Validate any persisted session against the backend on app start.
    useEffect(() => {
        let active = true;
        const boot = async () => {
            const storedToken = getToken();
            if (!storedToken) {
                if (active) setBooting(false);
                return;
            }
            try {
                const res = await authApi.profile();
                if (active) {
                    if (res?.success && res?.data) {
                        setUser(res.data);
                        setAuth(storedToken, res.data);
                    } else {
                        clearAuth();
                        setUser(null);
                        setToken(null);
                    }
                }
            } catch {
                // 401 interceptor already cleared storage; just sync state.
                if (active) {
                    setUser(getStoredUser());
                    setToken(getToken());
                }
            } finally {
                if (active) setBooting(false);
            }
        };
        boot();
        return () => { active = false; };
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await authApi.login({ email, password });
        if (res?.success && res?.data?.access_token) {
            setAuth(res.data.access_token, res.data.user || null);
            setToken(res.data.access_token);
            setUser(res.data.user || null);
        }
        return res;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // Token may already be invalid - still clear local session.
        } finally {
            clearAuth();
            setUser(null);
            setToken(null);
        }
    }, []);

    const value = {
        user,
        token,
        booting,
        isAuthenticated: !!token && !!user,
        isAdmin: checkIsAdmin(user),
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
};

export default AuthContext;
