// src/components/AuthContext.jsx
import React, { createContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const TOKEN_KEY = 'token';
const USER_KEY = 'authUser';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [hydrating, setHydrating] = useState(false);
    const bootstrappedRef = useRef(false);

    const attachAuthHeader = useCallback((token) => {
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common.Authorization;
        }
    }, []);

    const readCachedUser = useCallback(() => {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        } catch {
            return null;
        }
    }, []);

    const writeCachedUser = useCallback((fresh) => {
        try {
            if (fresh) localStorage.setItem(USER_KEY, JSON.stringify(fresh));
            else localStorage.removeItem(USER_KEY);
        } catch { }
    }, []);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            setUser(null);
            writeCachedUser(null);
            attachAuthHeader(null);
            return null;
        }

        attachAuthHeader(token);
        setHydrating(true);

        try {
            const res = await api.get('/profile');
            const fresh = res?.data?.data || null;

            setUser(fresh);
            writeCachedUser(fresh);
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
    }, [attachAuthHeader, writeCachedUser]);

    useEffect(() => {
        if (bootstrappedRef.current) return;
        bootstrappedRef.current = true;

        const token = localStorage.getItem(TOKEN_KEY);
        const cached = readCachedUser();

        if (token) attachAuthHeader(token);
        if (cached) setUser(cached);

        setInitialized(true);

        if (token) void fetchUser();
    }, [attachAuthHeader, fetchUser, readCachedUser]);

    /**
     * ✅ OAuth uses login(token, null) then fetchUser()
     * Do NOT wipe authUser when userData is null.
     */
    const login = useCallback(
        (token, userData) => {
            try {
                localStorage.setItem(TOKEN_KEY, token);

                if (userData) {
                    localStorage.setItem(USER_KEY, JSON.stringify(userData));
                } else {
                    // keep any existing cached user (don’t wipe)
                    const cached = readCachedUser();
                    if (!cached) localStorage.removeItem(USER_KEY);
                }
            } catch { }

            attachAuthHeader(token);

            if (userData) setUser(userData);
            else {
                const cached = readCachedUser();
                if (cached) setUser(cached);
            }

            setInitialized(true);
        },
        [attachAuthHeader, readCachedUser]
    );

    const logout = useCallback(() => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } catch { }
        attachAuthHeader(null);
        setUser(null);
    }, [attachAuthHeader]);

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            fetchUser,
            initialized,
            hydrating,
        }),
        [user, login, logout, fetchUser, initialized, hydrating]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
