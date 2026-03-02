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
import UpgradeIcon from "../../assets/icons/Upgrade-Interface.svg";
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

    const MAIN_ITEMS = useMemo(
        () => [
            { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
            { to: "/profiles", label: "Profiles", icon: ProfileIcon },
            { to: "/cards", label: "Cards", icon: CardsIcon },
            { to: "/analytics", label: "Analytics", icon: AnalyticsIcon },
            { to: "/contact-book", label: "Contact Book", icon: ContactsIcon },
        ],
        []
    );

    return (
        <>
            <div
                className={`sb3-overlay ${isMobile && sidebarOpen ? "active" : ""}`}
                onClick={closeSidebar}
            />

            <aside
                className={`sb3 ${isMobile ? "mobile" : ""} ${sidebarOpen ? "open" : ""}`}
                aria-label="Sidebar"
            >
                {/* Top */}
                <div className="sb3-top">
                    <Link to="/dashboard" className="sb3-brand" onClick={closeSidebar}>
                        <span className="sb3-logo" aria-hidden="true">
                            <img src={LogoIcon} alt="" />
                        </span>
                        <span className="sb3-brandName">KonarCard</span>
                    </Link>

                    {isMobile ? (
                        <button
                            className="sb3-close"
                            aria-label="Close menu"
                            onClick={closeSidebar}
                            type="button"
                        >
                            ✕
                        </button>
                    ) : null}
                </div>

                {/* 24px gap under brand, then divider */}
                <div className="sb3-topGap" />
                <div className="sb3-divider" />

                {/* 36px gap before first link */}
                <div className="sb3-sectionGap" />

                {/* Main links */}
                <nav className="sb3-nav" aria-label="Main navigation">
                    {MAIN_ITEMS.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeSidebar}
                            className={`sb3-link ${isActive(item.to) ? "active" : ""}`}
                        >
                            <span className="sb3-icoWrap" aria-hidden="true">
                                <img className="sb3-ico" src={item.icon} alt="" />
                            </span>
                            <span className="sb3-text">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Divider + Upgrade */}
                <div className="sb3-divider sb3-divider--full" />
                <div className="sb3-sectionGap" />

                <Link
                    to="/upgrade"
                    onClick={closeSidebar}
                    className={`sb3-link ${isActive("/upgrade") ? "active" : ""}`}
                >
                    <span className="sb3-icoWrap" aria-hidden="true">
                        <img className="sb3-ico" src={UpgradeIcon} alt="" />
                    </span>
                    <span className="sb3-text">Upgrade Plan</span>
                </Link>

                {/* Divider + Help */}
                <div className="sb3-divider sb3-divider--full" />
                <div className="sb3-sectionGap" />

                <Link
                    to="/helpcentreinterface"
                    onClick={closeSidebar}
                    className={`sb3-link ${isActive("/helpcentreinterface") ? "active" : ""}`}
                >
                    <span className="sb3-icoWrap" aria-hidden="true">
                        <img className="sb3-ico" src={HelpIcon} alt="" />
                    </span>
                    <span className="sb3-text">Help &amp; Support</span>
                </Link>

                {/* Bottom */}
                <div className="sb3-bottom">
                    <div className="sb3-divider sb3-divider--full" />
                    <div className="sb3-sectionGap" />

                    <Link
                        to="/settings"
                        onClick={closeSidebar}
                        className={`sb3-link ${isActive("/settings") ? "active" : ""}`}
                    >
                        <span className="sb3-icoWrap" aria-hidden="true">
                            <img className="sb3-ico" src={SettingsIcon} alt="" />
                        </span>
                        <span className="sb3-text">Settings</span>
                    </Link>

                    <button type="button" className="sb3-link sb3-link--logout" onClick={handleLogout}>
                        <span className="sb3-icoWrap sb3-icoWrap--logout" aria-hidden="true">
                            <img className="sb3-ico" src={LogoutIcon} alt="" />
                        </span>
                        <span className="sb3-text sb3-text--logout">Logout</span>
                    </button>

                    <div className="sb3-footnote">© {new Date().getFullYear()} KonarCard</div>
                </div>
            </aside>
        </>
    );
}