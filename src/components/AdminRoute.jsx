import React, { useContext, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ADMIN_EMAILS = new Set([
    "supportteam@konarcard.com",
]);

function cleanEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function cleanRole(value) {
    return String(value || "").trim().toLowerCase();
}

export default function AdminRoute({ children }) {
    const { user, initialized, hydrating, fetchUser } = useContext(AuthContext);
    const location = useLocation();

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const attemptedHydrateRef = useRef(false);

    useEffect(() => {
        if (!initialized) return;
        if (!token) return;
        if (user) return;
        if (hydrating) return;
        if (attemptedHydrateRef.current) return;

        attemptedHydrateRef.current = true;
        void fetchUser();
    }, [initialized, token, user, hydrating, fetchUser]);

    if (!initialized || hydrating) {
        return <div style={{ minHeight: "40vh" }} />;
    }

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
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

    const email = cleanEmail(user?.email);
    const role = cleanRole(user?.role);

    const isAdmin = role === "admin" || ADMIN_EMAILS.has(email);

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}