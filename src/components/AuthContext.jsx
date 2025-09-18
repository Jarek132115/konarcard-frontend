import React, { createContext, useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const attachToken = (token) => {
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common.Authorization;
        }
    };

    const fetchUser = async () => {
        setLoading(true);
        try {
            const res = await api.get('/profile');
            const fetchedUser = res.data?.data;
            setUser(fetchedUser || null);
            if (!fetchedUser) {
                localStorage.removeItem('token');
                attachToken(null);
            }
        } catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem('token');
                attachToken(null);
            }
            setUser(null);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    };

    useEffect(() => {
        // 1) Reattach token to API before first request
        const token = localStorage.getItem('token');
        attachToken(token);

        // 2) If there’s a token, verify it with /profile
        if (token) {
            fetchUser();
        } else {
            // No token → we’re initialized immediately
            setInitialized(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        attachToken(token);
        setUser(userData || null);
        setLoading(false);
        setInitialized(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        attachToken(null);
        setUser(null);
        toast.success('You have been logged out!');
    };

    const value = useMemo(
        () => ({ user, setUser, fetchUser, login, logout, loading, initialized }),
        [user, loading, initialized]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
