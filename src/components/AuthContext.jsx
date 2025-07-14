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
            // Backend /profile returns { data: userObject }, so response.data.data is correct
            const fetchedUser = response.data.data;

            console.log("AuthContext: API response for /profile:", response);
            console.log("AuthContext: Fetched user data (after destructuring):", fetchedUser);

            if (response.status === 200 && fetchedUser) {
                setUser(fetchedUser);
                console.log("AuthContext: User fetched successfully and set from /profile.");
            } else {
                console.error("AuthContext: Invalid user data or status from /profile, clearing token and user.");
                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            }
        } catch (err) {
            console.error("AuthContext fetchUser failed in catch block:", err);
            // If the error is 401 Unauthorized, clear token
            if (err.response && err.response.status === 401) {
                console.warn("AuthContext: 401 Unauthorized during profile fetch, token likely invalid/expired. Clearing token.");
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            }
            setUser(null);
        } finally {
            setLoading(false);
            console.log("AuthContext: fetchUser finished, loading set to false.");
        }
    };

    // Initial fetch on component mount
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
    }, []); // Empty dependency array means this runs once on mount

    // Modified login function to accept and immediately set the user object
    const login = (token, userData) => { // <-- Added userData parameter
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            setUser(userData); // <-- Immediately set user data
            setLoading(false); // Assume loaded if login succeeded
            console.log("AuthContext: User logged in and set immediately.");
        }
    };

    const logout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setUser(null);
        console.log("AuthContext: User logged out and token cleared.");
        try {
            await api.post('/logout'); // Inform backend about logout
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