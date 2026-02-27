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
                className={`sb2-overlay ${isMobile && sidebarOpen ? "active" : ""}`}
                onClick={closeSidebar}
            />

            <aside
                className={`sb2 ${isMobile ? "mobile" : ""} ${sidebarOpen ? "open" : ""}`}
                aria-label="Sidebar"
            >
                {/* Top brand */}
                <div className="sb2-top">
                    <Link to="/dashboard" className="sb2-brand" onClick={closeSidebar}>
                        <span className="sb2-logoPlain" aria-hidden="true">
                            <img src={LogoIcon} alt="" />
                        </span>

                        <span className="sb2-brandText">
                            <span className="kc-title">KonarCard</span>
                            <span className="kc-body">Your digital business card</span>
                        </span>
                    </Link>

                    {isMobile ? (
                        <button
                            className="sb2-close"
                            aria-label="Close menu"
                            onClick={closeSidebar}
                            type="button"
                        >
                            ✕
                        </button>
                    ) : null}
                </div>

                <div className="sb2-divider sb2-divider--top" />

                {/* Menu */}
                <div className="sb2-menuWrap">
                    <div className="sb2-menuLabel">MENU</div>

                    <nav className="sb2-nav" aria-label="Main navigation">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={closeSidebar}
                                className={`sb2-link ${isActive(item.to) ? "active" : ""}`}
                            >
                                <span className="sb2-ico" aria-hidden="true">
                                    <img src={item.icon} alt="" />
                                </span>
                                <span className="sb2-text">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Bottom */}
                <div className="sb2-bottom">
                    <div className="sb2-divider sb2-divider--bottom" />

                    <Link
                        to="/settings"
                        onClick={closeSidebar}
                        className={`sb2-link sb2-linkBottom ${isActive("/settings") ? "active" : ""}`}
                    >
                        <span className="sb2-ico" aria-hidden="true">
                            <img src={SettingsIcon} alt="" />
                        </span>
                        <span className="sb2-text">Settings</span>
                    </Link>

                    <button className="sb2-logout" onClick={handleLogout} type="button">
                        <span className="sb2-logoutInner">
                            <span className="sb2-ico" aria-hidden="true">
                                <img src={LogoutIcon} alt="" />
                            </span>
                            <span className="sb2-logoutText">Logout</span>
                        </span>
                    </button>

                    <div className="sb2-footnote">© {new Date().getFullYear()} KonarCard</div>
                </div>
            </aside>
        </>
    );
}