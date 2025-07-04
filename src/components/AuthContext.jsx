import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchUser = async () => {
        setLoading(true);
        console.log("AuthContext: fetchUser called.");
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        console.log("AuthContext: Token from localStorage for fetchUser:", storedToken ? "Exists" : "Null/Undefined");

        if (!storedToken) {
            setUser(null);
            setLoading(false);
            console.log("AuthContext: No token found, setting user to null and loading to false.");
            return;
        }

        try {
            const response = await api.get('/profile');
            const fetchedUser = response.data.data; 

            console.log("AuthContext: API response for /profile:", response);
            console.log("AuthContext: Fetched user data (after destructuring):", fetchedUser);

            if (response.status === 200 && fetchedUser) {
                setUser(fetchedUser);
                console.log("AuthContext: User fetched successfully and set.");
            } else {
                console.error("AuthContext: Invalid user data or status, clearing token and user.");
                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            }
        } catch (err) {
            console.error("AuthContext fetchUser failed in catch block:", err);
            setUser(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                console.log("AuthContext: Error during fetch, clearing token and user.");
            }
        } finally {
            setLoading(false);
            console.log("AuthContext: fetchUser finished, loading set to false.");
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            console.log("AuthContext: Initial/Token-change check. Stored token:", token ? "Exists" : "Null/Undefined");
            if (token) {
                fetchUser();
            } else {
                setUser(null); 
                setLoading(false);
                console.log("AuthContext: No token, setting loading to false and user to null.");
            }
        }
    }, []); 

    const login = (token) => { 
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            fetchUser();
        }
    };

    const logout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setUser(null);
        console.log("AuthContext: User logged out and token cleared.");
        try {
            await api.post('/logout');
        } catch (err) {
            console.error("Error calling backend logout:", err);
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