// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, initialized, hydrating } = useContext(AuthContext);
    const location = useLocation();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // While bootstrapping or hydrating a token, hold render
    if (!initialized || hydrating || (token && !user)) {
        return <div style={{ minHeight: '40vh' }} />; // tiny placeholder avoids flash
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
    }

    return children;
}
