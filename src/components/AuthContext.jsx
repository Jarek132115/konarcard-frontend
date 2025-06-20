import { createContext, useEffect, useState } from 'react';
import { api } from '../services/api'; // Import the api utility

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        console.log('AuthContext fetchUser: Stored Token Status:', storedToken ? 'Token exists in localStorage' : 'No token found in localStorage'); // ADDED LOG

        // If no token is found, we can immediately set loading to false and exit, no API call needed.
        if (!storedToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            // The api utility now automatically adds the Authorization header from localStorage
            const response = await api('/profile', { method: 'GET' });
            const fetchedUser = response.data;

            if (fetchedUser && fetchedUser._id) {
                setUser(fetchedUser);
                console.log('AuthContext fetchUser: User data fetched successfully.'); // ADDED LOG
            } else {
                // If profile endpoint returns null or no _id, it means token might be invalid or user not found on backend.
                // Clear the token and user state.
                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    console.log('AuthContext fetchUser: Cleared invalid token from localStorage.'); // ADDED LOG
                }
            }
        } catch (err) {
            console.error("AuthContext fetchUser failed during API call:", err); // More specific error message
            setUser(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token'); // Clear token on any fetch error
                console.log('AuthContext fetchUser: Cleared token due to API error.'); // ADDED LOG
            }
        } finally {
            setLoading(false);
        }
    };

    const login = (token, userData) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token); // Store token in localStorage
            console.log('AuthContext login: Token saved to localStorage.'); // ADDED LOG
        }
        setUser(userData); // Set user state immediately based on login response
        // fetchUser will run on initial load and window focus anyway to validate this token.
    };

    const logout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token'); // Remove token from localStorage
            console.log('AuthContext logout: Token removed from localStorage.'); // ADDED LOG
        }
        setUser(null); // Clear user state
        try {
            await api('/logout', { method: 'POST' }); // Call backend logout endpoint (optional for stateless JWT)
        } catch (err) {
            console.error("Error calling backend logout:", err);
        }
    };

    useEffect(() => {
        // On initial component mount, always try to fetch user based on potential stored token
        fetchUser();

        // Re-fetch user profile when the window gains focus (e.g., tab switch, browser tab reactivated)
        const handleFocus = () => {
            const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (storedToken) { // Only attempt refetch if a token might exist
                fetchUser();
            } else {
                // If no token exists on focus, ensure user state is null and loading is false
                setUser(null);
                setLoading(false);
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus); // Cleanup listener
    }, []); // Empty dependency array: runs once on mount

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