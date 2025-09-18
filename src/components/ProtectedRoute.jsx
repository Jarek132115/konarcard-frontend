import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, initialized } = useContext(AuthContext);
    const location = useLocation();

    // Don’t decide until the first auth check is complete
    if (!initialized || loading) {
        return <div style={{ padding: 16 }}>Loading…</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
