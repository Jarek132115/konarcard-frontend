import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, initialized, hydrating } = useContext(AuthContext);
    const location = useLocation();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Hold rendering while bootstrapping or while we’re hydrating a known token
    if (!initialized || hydrating || (token && !user)) {
        // Optional tiny placeholder to avoid black/white flash
        return <div style={{ minHeight: '40vh' }} />;
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
