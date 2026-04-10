import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";

function SidebarLink({ to, children, end = false }) {
    return (
        <NavLink to={to} end={end}>
            {({ isActive }) => (
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 46,
                        width: "100%",
                        borderRadius: 14,
                        border: isActive
                            ? "1px solid #0f172a"
                            : "1px solid rgba(15,23,42,0.08)",
                        background: isActive ? "#0f172a" : "#ffffff",
                        color: isActive ? "#ffffff" : "#0f172a",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                        boxSizing: "border-box",
                    }}
                >
                    {children}
                </span>
            )}
        </NavLink>
    );
}

export default function AdminLayout() {
    const navigate = useNavigate();

    async function handleLogout() {
        try {
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
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
                color: "#0f172a",
                display: "grid",
                gridTemplateColumns: "88px minmax(0,1fr)",
            }}
        >
            <aside
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    background: "#ffffff",
                    borderRight: "1px solid rgba(15,23,42,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "18px 12px",
                    gap: 12,
                    boxSizing: "border-box",
                }}
            >
                <button
                    type="button"
                    onClick={() => navigate("/admin")}
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "#fff",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        padding: 0,
                    }}
                    aria-label="Open admin dashboard"
                >
                    <img
                        src={LogoIcon}
                        alt="KonarCard"
                        style={{ width: 28, height: 28, display: "block" }}
                    />
                </button>

                <div
                    style={{
                        width: "100%",
                        marginTop: 18,
                        display: "grid",
                        gap: 10,
                    }}
                >
                    <SidebarLink to="/admin" end>
                        Overview
                    </SidebarLink>

                    <SidebarLink to="/admin/users">
                        Users
                    </SidebarLink>

                    <SidebarLink to="/admin/orders">
                        Orders
                    </SidebarLink>

                    <SidebarLink to="/admin/analytics">
                        Analytics
                    </SidebarLink>
                </div>

                <div style={{ flex: 1 }} />

                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        minHeight: 44,
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Logout
                </button>
            </aside>

            <main
                style={{
                    minWidth: 0,
                    padding: 28,
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        maxWidth: 1480,
                        margin: "0 auto",
                        display: "grid",
                        gap: 22,
                    }}
                >
                    <Outlet />
                </div>
            </main>
        </div>
    );
}