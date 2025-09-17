import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return null; // silent while checking auth
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    return children;
};

export default ProtectedRoute;
