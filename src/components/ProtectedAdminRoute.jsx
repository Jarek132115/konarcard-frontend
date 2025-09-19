// src/components/ProtectedAdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

// Keep this list in sync with your Cloud Run ADMIN_EMAILS (UI-only convenience).
const ADMIN_EMAILS_UI = ['supportteam@konarcard.com'];

export default function ProtectedAdminRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null; // or a tiny spinner if you like

    const email = (user?.email || '').toLowerCase();
    const isAdmin = ADMIN_EMAILS_UI.includes(email);

    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/myprofile" replace />;

    return children;
}
