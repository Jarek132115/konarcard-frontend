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
                className={`sb-overlay ${isMobile && sidebarOpen ? "active" : ""}`}
                onClick={closeSidebar}
            />

            <aside
                className={`sb ${isMobile ? "mobile" : ""} ${sidebarOpen ? "open" : ""}`}
                aria-label="Sidebar"
            >
                {/* Brand */}
                <div className="sb-brandRow">
                    <Link to="/dashboard" className="sb-brand" onClick={closeSidebar}>
                        <span className="sb-logoWrap" aria-hidden="true">
                            <img src={LogoIcon} alt="" />
                        </span>

                        <span className="sb-brandText">
                            <span className="sb-brandName">KonarCard</span>
                            <span className="sb-brandTag">Your digital business card</span>
                        </span>
                    </Link>

                    {isMobile ? (
                        <button
                            className="sb-close"
                            aria-label="Close menu"
                            onClick={closeSidebar}
                            type="button"
                        >
                            ✕
                        </button>
                    ) : null}
                </div>

                <div className="sb-divider" />

                {/* Nav */}
                <nav className="sb-nav" aria-label="Main navigation">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeSidebar}
                            className={`sb-link ${isActive(item.to) ? "active" : ""}`}
                        >
                            <span className="sb-ico" aria-hidden="true">
                                <img src={item.icon} alt="" />
                            </span>
                            <span className="sb-text">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="sb-bottom">
                    <div className="sb-divider" />

                    <Link
                        to="/settings"
                        onClick={closeSidebar}
                        className={`sb-link sb-linkBottom ${isActive("/settings") ? "active" : ""}`}
                    >
                        <span className="sb-ico" aria-hidden="true">
                            <img src={SettingsIcon} alt="" />
                        </span>
                        <span className="sb-text">Settings</span>
                    </Link>

                    <button className="sb-logout" onClick={handleLogout} type="button">
                        <span className="sb-logoutInner">
                            <span className="sb-ico" aria-hidden="true">
                                <img src={LogoutIcon} alt="" />
                            </span>
                            <span>Logout</span>
                        </span>
                    </button>

                    <div className="sb-footnote">© {new Date().getFullYear()} KonarCard</div>
                </div>
            </aside>
        </>
    );
}