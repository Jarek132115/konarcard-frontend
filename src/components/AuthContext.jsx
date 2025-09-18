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
        if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
        else delete api.defaults.headers.common.Authorization;
    };

    // ---- Immediate, synchronous hydrate so `user` isn't null on first render
    useEffect(() => {
        if (bootstrappedRef.current) return;
        bootstrappedRef.current = true;

        const token = localStorage.getItem(TOKEN_KEY);
        const cachedUser = (() => {
            try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
            catch { return null; }
        })();

        if (token) attachAuthHeader(token);
        if (cachedUser) setUser(cachedUser);

        // Background validate token & refresh user
        if (token) {
            setLoading(true);
            api.get('/profile')
                .then(res => {
                    const fresh = res?.data?.data || null;
                    setUser(fresh);
                    try {
                        if (fresh) localStorage.setItem(USER_KEY, JSON.stringify(fresh));
                        else localStorage.removeItem(USER_KEY);
                    } catch { }
                })
                .catch(() => {
                    // token bad; clear everything
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
        } else {
            // no token at all
            setInitialized(true);
        }
    }, []);

    const login = (token, userData) => {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData || {}));
        } catch { }
        attachAuthHeader(token);
        setUser(userData || null);
        setInitialized(true);
        setLoading(false);
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
        () => ({ user, setUser, login, logout, loading, initialized }),
        [user, loading, initialized]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
