import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { initialized, loading } = useContext(AuthContext);
    const location = useLocation();

    // Before we know anything, render nothing (avoid premature redirect)
    if (!initialized || loading) return null;

    // Only redirect if there is truly NO token at all.
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Token exists -> allow route (even if user is still being refreshed)
    return children;
};

export default ProtectedRoute;
