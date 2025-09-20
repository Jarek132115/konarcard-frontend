// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, initialized, loading } = useContext(AuthContext);
    const location = useLocation();
    const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // While bootstrapping (or we have a token but user not rehydrated yet), render nothing
    if (!initialized || loading || (token && !user)) return null;

    // No session -> redirect declaratively (no useNavigate, no effects)
    if (!user)
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );

    return children;
}
