import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

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

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setUser(null);
        toast.success('You have been logged out!');
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