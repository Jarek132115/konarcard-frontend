import React, { useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, initialized, hydrating } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const redirectedRef = useRef(false);

    // Don’t decide until the app finished booting and any background hydration is done
    if (!initialized || hydrating) return null; // (optional) render a tiny skeleton here

    // One-shot redirect to avoid ping-pong / StrictMode double effects
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

    if (!user) return null; // redirect already triggered
    return children;
}
