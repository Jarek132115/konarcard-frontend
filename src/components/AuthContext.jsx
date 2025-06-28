import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch user profile, now defined directly in AuthProvider
    // so it can be called reliably when token changes or upon explicit login
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
            const fetchedUser = response.data.data; // Backend returns { data: userObject }

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

    // This useEffect will run on mount AND whenever localStorage.getItem('token') changes
    // (though localStorage changes don't inherently trigger re-renders, a manual call will)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            console.log("AuthContext: Initial/Token-change check. Stored token:", token ? "Exists" : "Null/Undefined");
            if (token) {
                fetchUser();
            } else {
                setUser(null); // Ensure user is null if no token is present
                setLoading(false);
                console.log("AuthContext: No token, setting loading to false and user to null.");
            }
        }
    }, []); // Removed dependency on fetchUser as it's stable, rely on manual trigger or interceptor

    // Modify login to explicitly re-fetch user after setting token
    const login = (token) => { // Removed userData from parameters, we will fetch it
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            // After setting the token, immediately try to fetch the user
            // This will ensure the AuthContext user state is up-to-date
            // based on the new token.
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