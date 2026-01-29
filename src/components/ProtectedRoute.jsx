// src/components/ProtectedRoute.jsx
import React, { useContext, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, initialized, hydrating, fetchUser } = useContext(AuthContext);
    const location = useLocation();

    const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const attemptedHydrateRef = useRef(false);

    // If we have a token but no user yet, try to fetch once.
    useEffect(() => {
        if (!initialized) return;
        if (!token) return;
        if (user) return;
        if (hydrating) return;
        if (attemptedHydrateRef.current) return;

        attemptedHydrateRef.current = true;
        void fetchUser();
    }, [initialized, token, user, hydrating, fetchUser]);

    // While bootstrapping or hydrating, hold render
    if (!initialized || hydrating) {
        return <div style={{ minHeight: '40vh' }} />;
    }

    // If no token, go login immediately
    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
    }

    // Token exists but user not loaded (and we've already tried)
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
