import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, initialized } = useContext(AuthContext);
    const location = useLocation();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // While app bootstraps, or we have a token but haven’t rehydrated user yet, render nothing
    if (!initialized || (token && !user)) return null;

    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    return children;
}
