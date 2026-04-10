import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export default function AdminRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Not admin
    if (user.email !== "supportteam@konarcard.com" && user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}