import React, { createContext, useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const fetchUser = async () => {
        setLoading(true);
        try {
            // 🚫 add cache-buster & force no-cache
            const res = await api.get(`/profile?ts=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-store',
                    'Pragma': 'no-cache',
                },
            });

            const fetchedUser = res.data?.data;
            setUser(fetchedUser || null);
            if (!fetchedUser) {
                localStorage.removeItem('token');
            }
        } catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem('token');
            }
            setUser(null);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setInitialized(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData || null);
        setLoading(false);
        setInitialized(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
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
