import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false); // <-- start false

    const fetchUser = async () => {
        try {
            const response = await api.get('/profile');
            const fetchedUser = response.data?.data;
            if (response.status === 200 && fetchedUser) {
                setUser(fetchedUser);
            } else {
                setUser(null);
                localStorage.removeItem('token');
            }
        } catch (err) {
            if (err.response?.status === 401) localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            // loading stays false → no flash anywhere
            return;
        }
        setLoading(true);      // <-- only if token exists
        fetchUser();           // <-- will set loading false in finally
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.success('You have been logged out!');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, fetchUser, login, logout, loading }}>
            {children} {/* no global "Loading..." here */}
        </AuthContext.Provider>
    );
};
