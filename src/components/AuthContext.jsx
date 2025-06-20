import { createContext, useEffect, useState } from 'react';
import { api } from '../services/api'; // Import the api utility we just modified

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Added a loading state for user fetch

    // Function to fetch user profile, now using the centralized api utility
    const fetchUser = async () => {
        setLoading(true); // Start loading
        try {
            // The api utility now automatically adds the Authorization header from localStorage
            const response = await api('/profile', { method: 'GET' });
            const fetchedUser = response.data; // api utility returns { data, status, ok }

            if (fetchedUser && fetchedUser._id) {
                setUser(fetchedUser);
            } else {
                // If profile endpoint returns null or no _id, it means token is invalid or user not found
                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token'); // Clear potentially bad token
                }
            }
        } catch (err) {
            console.error("AuthContext fetchUser failed:", err);
            setUser(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token'); // Clear token on any fetch error
            }
        } finally {
            setLoading(false); // End loading regardless of success or failure
        }
    };

    // New login function to be called by your Login component
    // It takes the JWT token and user data received from the backend after successful login
    const login = (token, userData) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token); // Store token in localStorage
        }
        setUser(userData); // Set user state immediately based on login response
        // No need to call fetchUser here immediately unless userData is incomplete
        // fetchUser will run on initial load and window focus anyway.
    };

    // New logout function to be called by your Logout button/component
    const logout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token'); // Remove token from localStorage
        }
        setUser(null); // Clear user state
        // Optionally, make an API call to the backend for explicit logout if needed
        // (For stateless JWTs, clearing client-side token is often enough, but backend might log/invalidate)
        try {
            await api('/logout', { method: 'POST' }); // Call backend logout endpoint (optional for stateless JWT)
        } catch (err) {
            console.error("Error calling backend logout:", err);
        }
    };

    useEffect(() => {
        // On initial component mount, check localStorage for a token
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                fetchUser(); // If token exists, try to fetch user data
            } else {
                setLoading(false); // No token found, so not loading user, set loading to false
            }

            // Re-fetch user profile when the window gains focus (e.g., tab switch)
            window.addEventListener('focus', fetchUser);
            return () => window.removeEventListener('focus', fetchUser); // Cleanup
        }
    }, []); // Empty dependency array: runs once on mount

    // The value provided to components using this context
    const contextValue = {
        user,
        setUser, // Allows direct setting of user if needed
        fetchUser, // Allows manual re-fetching of user
        login,     // New: function to handle login after backend response
        logout,    // New: function to handle logout
        loading    // New: loading state for user data
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};