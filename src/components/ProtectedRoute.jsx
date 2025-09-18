// frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, initialized, loading } = useContext(AuthContext);
    const location = useLocation();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Don’t redirect if: app not initialized yet, a validation is in-flight,
    // or we have a token but haven't rehydrated user yet.
    if (!initialized || loading || (token && !user)) return null;

    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    return children;
}
