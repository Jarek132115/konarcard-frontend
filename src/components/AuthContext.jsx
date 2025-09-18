// frontend/src/components/AuthContext.jsx
import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const TOKEN_KEY = 'token';
const USER_KEY = 'authUser';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(false);
    const bootstrappedRef = useRef(false);

    const attachAuthHeader = (token) => {
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common.Authorization;
        }
    };

    useEffect(() => {
        if (bootstrappedRef.current) return;
        bootstrappedRef.current = true;

        // 1) Read token + cached user synchronously
        const token = localStorage.getItem(TOKEN_KEY);
        let cachedUser = null;
        try {
            cachedUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        } catch {
            cachedUser = null;
        }

        if (token) attachAuthHeader(token);
        if (cachedUser) setUser(cachedUser);

        // 2) If no token, mark initialized right away
        if (!token) {
            setInitialized(true);
            return;
        }

        // 3) Validate token + refresh user
        setLoading(true);
        api
            .get('/profile')
            .then((res) => {
                const fresh = res?.data?.data || null;
                setUser(fresh);
                try {
                    if (fresh) {
                        localStorage.setItem(USER_KEY, JSON.stringify(fresh));
                    } else {
                        localStorage.removeItem(USER_KEY);
                    }
                } catch { }
            })
            .catch(() => {
                // Bad token → clear everything
                try {
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USER_KEY);
                } catch { }
                attachAuthHeader(null);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
                setInitialized(true);
            });
    }, []);

    const login = (token, userData) => {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData || {}));
        } catch { }
        attachAuthHeader(token);
        setUser(userData || null);
        setLoading(false);
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
            setUser,
            login,
            logout,
            loading,
            initialized,
        }),
        [user, loading, initialized]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
