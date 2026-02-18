// src/components/Dashboard/Sidebar.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext.jsx";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import DashboardIcon from "../../assets/icons/Home-Interface.svg";
import ProfileIcon from "../../assets/icons/Card-Interface.svg";
import CardsIcon from "../../assets/icons/MyOrder-Icon.svg";
import AnalyticsIcon from "../../assets/icons/Card-Interface.svg";
import ContactsIcon from "../../assets/icons/Contact-Interface.svg";
import SettingsIcon from "../../assets/icons/Settings-Interface.svg";
import HelpIcon from "../../assets/icons/Help-Interface.svg";
import LogoutIcon from "../../assets/icons/Logout-Interface.svg";

import "../../styling/dashboard/sidebar.css";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth <= 1000 : false
    );

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 1000);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const closeSidebar = () => setSidebarOpen(false);

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const NAV_ITEMS = useMemo(
        () => [
            { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
            { to: "/profiles", label: "Profiles", icon: ProfileIcon },
            { to: "/cards", label: "Cards", icon: CardsIcon },
            { to: "/analytics", label: "Analytics", icon: AnalyticsIcon },
            { to: "/contact-book", label: "Contact Book", icon: ContactsIcon },
            { to: "/helpcentreinterface", label: "Help & Support", icon: HelpIcon },
        ],
        []
    );

    return (
        <>
            <div
                className={`sidebar-overlay ${isMobile && sidebarOpen ? "active" : ""}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${isMobile ? "mobile" : ""} ${sidebarOpen ? "open" : ""}`} aria-label="Sidebar">
                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-logo">
                            <img src={LogoIcon} alt="KonarCard" />
                        </div>
                        <div className="sidebar-brand-text">
                            <div className="sidebar-logo-text">KonarCard</div>
                            <div className="sidebar-tagline">Your digital business card</div>
                        </div>
                    </div>

                    {isMobile ? (
                        <button
                            className="sidebar-close"
                            aria-label="Close menu"
                            onClick={closeSidebar}
                            type="button"
                        >
                            ✕
                        </button>
                    ) : null}
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    <div className="sidebar-nav-label">Menu</div>

                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeSidebar}
                            className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}
                        >
                            <span className="sidebar-icon">
                                <img src={item.icon} alt="" aria-hidden="true" />
                            </span>
                            <span className="sidebar-link-text">{item.label}</span>
                            <span className="sidebar-chevron" aria-hidden="true">
                                ›
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <Link
                        to="/settings"
                        onClick={closeSidebar}
                        className={`sidebar-link sidebar-link-footer ${isActive("/settings") ? "active" : ""}`}
                    >
                        <span className="sidebar-icon">
                            <img src={SettingsIcon} alt="" aria-hidden="true" />
                        </span>
                        <span className="sidebar-link-text">Settings</span>
                        <span className="sidebar-chevron" aria-hidden="true">
                            ›
                        </span>
                    </Link>

                    <button className="sidebar-logout" onClick={handleLogout} aria-label="Logout" type="button">
                        <span className="sidebar-logout-inner">
                            <img src={LogoutIcon} alt="" aria-hidden="true" />
                            <span>Logout</span>
                        </span>
                    </button>

                    <div className="sidebar-footnote">© {new Date().getFullYear()} KonarCard</div>
                </div>
            </aside>
        </>
    );
}
