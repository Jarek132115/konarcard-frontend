// src/components/AuthContext.jsx
import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const TOKEN_KEY = 'token';
const USER_KEY = 'authUser';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);  // app bootstrapped
    const [hydrating, setHydrating] = useState(false);      // in-flight /profile fetch
    const bootstrappedRef = useRef(false);

    const attachAuthHeader = (token) => {
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common.Authorization;
        }
    };

    const fetchUser = async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setUser(null);
            try { localStorage.removeItem(USER_KEY); } catch { }
            attachAuthHeader(null);
            return null;
        }

        attachAuthHeader(token);
        setHydrating(true);
        try {
            const res = await api.get('/profile');
            const fresh = res?.data?.data || null;
            setUser(fresh);

            try {
                if (fresh) {
                    localStorage.setItem(USER_KEY, JSON.stringify(fresh));
                } else {
                    localStorage.removeItem(USER_KEY);
                }
            } catch { }
            return fresh;
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                try {
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USER_KEY);
                } catch { }
                attachAuthHeader(null);
                setUser(null);
            }
            return null;
        } finally {
            setHydrating(false);
        }
    };

    useEffect(() => {
        if (bootstrappedRef.current) return;
        bootstrappedRef.current = true;

        const token = localStorage.getItem(TOKEN_KEY);
        let cached = null;
        try {
            cached = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        } catch { }

        if (token) attachAuthHeader(token);
        if (cached) setUser(cached);

        // app ready to render immediately
        setInitialized(true);

        // background refresh
        if (token) void fetchUser();
    }, []);

    const login = (token, userData) => {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            if (userData) {
                localStorage.setItem(USER_KEY, JSON.stringify(userData));
            } else {
                localStorage.removeItem(USER_KEY);
            }
        } catch { }
        attachAuthHeader(token);
        setUser(userData || null);
        setInitialized(true);
    };


    const logout = () => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } catch { }
        attachAuthHeader(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            fetchUser,
            initialized,
            hydrating,
        }),
        [user, initialized, hydrating]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
