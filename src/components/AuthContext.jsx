import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!storedToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/profile');
            const fetchedUser = response.data.data;

            if (response.status === 200 && fetchedUser) {
                setUser(fetchedUser);
            } else {
                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                fetchUser();
            } else {
                setUser(null);
                setLoading(false);
            }
        }
    }, []);

    const login = (token, userData) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            setUser(userData);
            setLoading(false);
        }
    };

    const logout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setUser(null);
        try {
            await api.post('/logout');
        } catch (err) {
            // Error calling backend logout can be ignored or handled silently in production
        }
    };

    const contextValue = {
        user,
        setUser,
        fetchUser,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};