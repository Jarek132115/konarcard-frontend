import React, { useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, initialized, hydrating } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const redirectedRef = useRef(false);

    // Wait for app bootstrap + any in-flight hydration before deciding
    if (!initialized || hydrating) return null; // could render a small skeleton

    // One-shot redirect to avoid ping-pong / flashing
    useEffect(() => {
        if (redirectedRef.current) return;
        if (!user) {
            redirectedRef.current = true;
            navigate('/login', {
                replace: true,
                state: { from: location.pathname + location.search },
            });
        }
    }, [user, navigate, location]);

    if (!user) return null; // we triggered a redirect already
    return children;
}
