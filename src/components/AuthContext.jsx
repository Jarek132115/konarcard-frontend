import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const TOKEN_KEY = 'token';
const USER_KEY = 'authUser';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Flags
    const [initialized, setInitialized] = useState(false); // app boot complete
    const [loading, setLoading] = useState(true);          // optional (legacy consumers)
    const [hydrating, setHydrating] = useState(false);     // actively refreshing session

    const bootstrappedRef = useRef(false);

    const attachAuthHeader = (token) => {
        if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
        else delete api.defaults.headers.common.Authorization;
    };

    // Exposed method to force-refresh session
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
                if (fresh) localStorage.setItem(USER_KEY, JSON.stringify(fresh));
                else localStorage.removeItem(USER_KEY);
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

        // 1) Read token + cached user synchronously (no UI flash)
        const token = localStorage.getItem(TOKEN_KEY);
        let cachedUser = null;
        try { cachedUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { }

        if (token) attachAuthHeader(token);
        if (cachedUser) setUser(cachedUser);

        // Ready to render app immediately with cached state
        setInitialized(true);
        setLoading(false);

        // 2) Background refresh (don’t block paint)
        if (token) {
            // fetchUser() will toggle hydrating true→false around the request
            fetchUser();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const login = (token, userData) => {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData || {}));
        } catch { }
        attachAuthHeader(token);
        setUser(userData || null);
        setInitialized(true);
        setLoading(false);
        setHydrating(false);
    };

    const logout = () => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } catch { }
        attachAuthHeader(null);
        setUser(null);
        setHydrating(false);
    };

    const value = useMemo(
        () => ({
            user,
            setUser,
            login,
            logout,
            initialized, // “app booted” flag
            loading,     // legacy optional
            hydrating,   // refreshing session in background
            fetchUser,   // allow screens to revalidate on demand
        }),
        [user, initialized, loading, hydrating]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
