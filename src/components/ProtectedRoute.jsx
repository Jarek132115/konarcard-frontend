// frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, initialized } = useContext(AuthContext);
    const location = useLocation();

    // Still booting auth? render nothing (no redirect yet)
    if (!initialized || loading) return null;

    // If there is no token at all, we truly are logged out
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // We DO have a token, but `user` may not be filled yet (or briefly null on refresh).
    // Do NOT redirect — let the protected page render (or show its own skeleton).
    return children;
};

export default ProtectedRoute;
