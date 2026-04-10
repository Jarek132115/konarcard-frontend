import React from "react";
import { Navigate } from "react-router-dom";

/*
    AdminDashboard is now ONLY a redirect entry point.

    Old behavior:
    - Sidebar
    - Tabs
    - Page switching inside one file

    New architecture:
    - AdminLayout.jsx → handles sidebar + layout
    - AdminOverview.jsx → /admin/overview
    - AdminUsers.jsx → /admin/users
    - AdminOrders.jsx → /admin/orders
    - AdminAnalytics.jsx → /admin/analytics

    So this file simply redirects:
    /admin → /admin/overview
*/

export default function AdminDashboard() {
    return <Navigate to="/admin/overview" replace />;
}