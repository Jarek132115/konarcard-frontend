// src/pages/admin/AdminLayout.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import AdminErrorBoundary from "./AdminErrorBoundary";
import "../../styling/admin/admin.css";

const NAV_ITEMS = [
    { key: "overview", label: "Overview", path: "/admin/overview" },
    { key: "users", label: "Users", path: "/admin/users" },
    { key: "orders", label: "Orders", path: "/admin/orders" },
    { key: "analytics", label: "Analytics", path: "/admin/analytics" },
];

function isActivePath(pathname, itemPath) {
    if (pathname === itemPath) return true;
    return pathname.startsWith(`${itemPath}/`);
}

function NavButton({ active = false, children, className = "", ...props }) {
    return (
        <button
            {...props}
            type="button"
            className={`admin-nav-button ${active ? "is-active" : ""} ${className}`.trim()}
        >
            {children}
        </button>
    );
}

function ActionButton({ children, tone = "ghost", className = "", ...props }) {
    return (
        <button
            {...props}
            type="button"
            className={`admin-btn admin-btn--${tone} ${className}`.trim()}
        >
            {children}
        </button>
    );
}

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    async function logout() {
        try {
            const { default: api } = await import("../../services/api");
            await api.post("/logout");
        } catch {
            // ignore
        }

        try {
            localStorage.removeItem("token");
            localStorage.removeItem("authUser");
        } catch {
            // ignore
        }

        navigate("/login", { replace: true });
    }

    return (
        <div className="admin-root admin-page">
            <div className="admin-shell">
                <aside className="admin-sidebar">
                    <button
                        type="button"
                        className="admin-logo-button"
                        onClick={() => navigate("/admin/overview")}
                        aria-label="Open admin overview"
                        title="Admin overview"
                    >
                        <img src={LogoIcon} alt="KonarCard" />
                    </button>

                    <div className="admin-sidebar-nav">
                        {NAV_ITEMS.map((item) => (
                            <NavButton
                                key={item.key}
                                active={isActivePath(location.pathname, item.path)}
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </NavButton>
                        ))}
                    </div>

                    <div className="admin-sidebar-spacer" />

                    <NavButton onClick={() => navigate("/dashboard")}>User app</NavButton>
                    <NavButton onClick={logout}>Logout</NavButton>
                </aside>

                <div className="admin-mobile-topbar">
                    <div className="admin-mobile-topbar-inner">
                        <div className="admin-mobile-brand">
                            <button
                                type="button"
                                className="admin-mobile-brand-button"
                                onClick={() => navigate("/admin/overview")}
                                aria-label="Open admin overview"
                                title="Admin overview"
                            >
                                <img src={LogoIcon} alt="KonarCard" />
                            </button>

                            <div>
                                <div className="admin-mobile-title">KonarCard Admin</div>
                                <div className="admin-mobile-subtitle">
                                    Manage users, orders and analytics
                                </div>
                            </div>
                        </div>

                        <div className="admin-mobile-nav">
                            {NAV_ITEMS.map((item) => (
                                <NavButton
                                    key={item.key}
                                    active={isActivePath(location.pathname, item.path)}
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.label}
                                </NavButton>
                            ))}
                        </div>

                        <div className="admin-row">
                            <ActionButton onClick={() => navigate("/dashboard")}>
                                User app
                            </ActionButton>

                            <ActionButton onClick={logout}>Logout</ActionButton>
                        </div>
                    </div>
                </div>

                <main className="admin-main">
                    <div className="admin-main-inner">
                        <AdminErrorBoundary key={location.pathname}>
                            {children}
                        </AdminErrorBoundary>
                    </div>
                </main>
            </div>
        </div>
    );
}