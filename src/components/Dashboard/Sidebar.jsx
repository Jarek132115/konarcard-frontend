import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import DashboardIcon from "../../assets/icons/Home-Interface.svg";
import ProfileIcon from "../../assets/icons/Card-Interface.svg";
import CardsIcon from "../../assets/icons/MyOrder-Icon.svg";
import AnalyticsIcon from "../../assets/icons/Card-Interface.svg";
import ContactsIcon from "../../assets/icons/Contact-Interface.svg";
import SettingsIcon from "../../assets/icons/Settings-Interface.svg";
import HelpIcon from "../../assets/icons/Help-Interface.svg";
import LogoutIcon from "../../assets/icons/Logout-Interface.svg";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 1000);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const closeSidebar = () => setSidebarOpen(false);

    const isActive = (path) =>
        location.pathname === path ||
        location.pathname.startsWith(path + "/");

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const NAV_ITEMS = [
        { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
        { to: "/profiles", label: "Profiles", icon: ProfileIcon },
        { to: "/cards", label: "Cards", icon: CardsIcon },
        { to: "/analytics", label: "Analytics", icon: AnalyticsIcon },
        { to: "/contact-book", label: "Contact Book", icon: ContactsIcon },
        { to: "/settings", label: "Settings", icon: SettingsIcon },
    ];

    return (
        <>
            <div
                className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <span className="sidebar-logo-text">KonarCard</span>
                    <img src={LogoIcon} alt="KonarCard" className="sidebar-logo-icon" />

                    {isMobile && (
                        <button
                            className="sidebar-close"
                            aria-label="Close menu"
                            onClick={closeSidebar}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeSidebar}
                            className={`sidebar-link ${isActive(item.to) ? "active" : ""
                                }`}
                        >
                            <img src={item.icon} alt="" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link
                        to="/helpcentreinterface"
                        onClick={closeSidebar}
                        className={`sidebar-link ${isActive("/helpcentreinterface") ? "active" : ""
                            }`}
                    >
                        <img src={HelpIcon} alt="" />
                        <span>Help & Support</span>
                    </Link>

                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        <img src={LogoutIcon} alt="" />
                    </button>
                </div>
            </aside>
        </>
    );
}
