// src/components/AuthContext.jsx
import React, { createContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import api from "../services/api";

export const AuthContext = createContext();

const TOKEN_KEY = "token";
const USER_KEY = "authUser";

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
            return JSON.parse(localStorage.getItem(USER_KEY) || "null");
        } catch {
            return null;
        }
    }, []);

    const writeCachedUser = useCallback((fresh) => {
        try {
            if (fresh) localStorage.setItem(USER_KEY, JSON.stringify(fresh));
            else localStorage.removeItem(USER_KEY);
        } catch {
            // ignore storage issues
        }
    }, []);

    const clearAuth = useCallback(() => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } catch {
            // ignore
        }
        attachAuthHeader(null);
        setUser(null);
    }, [attachAuthHeader]);

    const fetchUser = useCallback(async () => {
        let token = "";
        try {
            token = localStorage.getItem(TOKEN_KEY) || "";
        } catch {
            token = "";
        }

        if (!token) {
            clearAuth();
            return null;
        }

        attachAuthHeader(token);
        setHydrating(true);

        try {
            const res = await api.get("/profile");
            const status = Number(res?.status || 0);

            if (status === 401 || status === 403) {
                clearAuth();
                return null;
            }

            if (status >= 400) {
                return null;
            }

            const fresh = res?.data?.data || null;

            if (!fresh) {
                return null;
            }

            setUser(fresh);
            writeCachedUser(fresh);
            return fresh;
        } catch {
            return null;
        } finally {
            setHydrating(false);
        }
    }, [attachAuthHeader, clearAuth, writeCachedUser]);

    useEffect(() => {
        if (bootstrappedRef.current) return;
        bootstrappedRef.current = true;

        let token = "";
        try {
            token = localStorage.getItem(TOKEN_KEY) || "";
        } catch {
            token = "";
        }

        const cached = readCachedUser();

        if (token) attachAuthHeader(token);
        if (cached) setUser(cached);

        setInitialized(true);

        if (token) void fetchUser();
    }, [attachAuthHeader, fetchUser, readCachedUser]);

    const login = useCallback(
        (token, userData) => {
            try {
                localStorage.setItem(TOKEN_KEY, token);

                if (userData) {
                    localStorage.setItem(USER_KEY, JSON.stringify(userData));
                } else {
                    const cached = readCachedUser();
                    if (!cached) localStorage.removeItem(USER_KEY);
                }
            } catch {
                // ignore
            }

            attachAuthHeader(token);

            if (userData) {
                setUser(userData);
            } else {
                const cached = readCachedUser();
                if (cached) setUser(cached);
            }

            setInitialized(true);
        },
        [attachAuthHeader, readCachedUser]
    );

    const logout = useCallback(() => {
        clearAuth();
    }, [clearAuth]);

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