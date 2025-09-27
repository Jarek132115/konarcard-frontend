// src/components/Sidebar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

/* Icons (desktop shows them, mobile hides them via CSS) */
import LogoIcon from '../assets/icons/Logo-Icon.svg';
import homeInterface from '../assets/icons/Home-Interface.svg';
import orderIcon from '../assets/icons/MyOrder-Icon.svg';
import cardInterface from '../assets/icons/Card-Interface.svg';
import contactInterface from '../assets/icons/Contact-Interface.svg';
import helpInterface from '../assets/icons/Help-Interface.svg';
import settingsInterface from '../assets/icons/Settings-Interface.svg';
import logoutInterface from '../assets/icons/Logout-Interface.svg';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 1000);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const closeSidebar = () => setSidebarOpen(false);
    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Header: desktop shows KonarCard text; mobile shows logo + close (✕) */}
                <div className="brand-header">
                    <span className="brand-text">KonarCard</span>
                    <img src={LogoIcon} alt="Konar" className="brand-logo" />
                    <button
                        className="mobile-close mobile-only"
                        aria-label="Close menu"
                        onClick={closeSidebar}
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                <div className="sidebar-content-wrapper">
                    <nav className="links-stack">
                        {/* MOBILE: single top divider, exactly like navbar */}
                        <div className="mobile-divider mobile-only" aria-hidden="true" />

                        {/* Main links (icons visible on desktop only) */}
                        <Link
                            to="/myprofile"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/myprofile') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={homeInterface} alt="" className="icon" />
                            <span className="label">Home</span>
                        </Link>

                        <Link
                            to="/myorders"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/myorders') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={orderIcon} alt="" className="icon" />
                            <span className="label">My Orders</span>
                        </Link>

                        <Link
                            to="/nfccards"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/products-and-plans') || isActive('/nfccards') || isActive('/subscription')
                                    ? 'active-sidebar-link'
                                    : ''
                                }`}
                        >
                            <img src={cardInterface} alt="" className="icon" />
                            <span className="label">Product &amp; Plan</span>
                        </Link>

                        {/* MOBILE: divider between groups (no extra one at bottom) */}
                        <div className="mobile-divider mobile-only" aria-hidden="true" />

                        <Link
                            to="/contact-support"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/contact-support') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={contactInterface} alt="" className="icon" />
                            <span className="label">Contact Us</span>
                        </Link>

                        {/* MOBILE-ONLY inline items (same typography as other links) */}
                        <Link
                            to="/helpcentreinterface"
                            onClick={closeSidebar}
                            className={`sidebar-button mobile-only ${isActive('/helpcentreinterface') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={helpInterface} alt="" className="icon" />
                            <span className="label">Help Centre</span>
                        </Link>

                        <Link
                            to="/profile"
                            onClick={closeSidebar}
                            className={`sidebar-button mobile-only ${isActive('/profile') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={settingsInterface} alt="" className="icon" />
                            <span className="label">Settings</span>
                        </Link>

                        {/* MOBILE: red Logout link styled exactly like the others (same font/spacing) */}
                        <button
                            type="button"
                            className="sidebar-button logout-link mobile-only"
                            onClick={() => {
                                handleLogout();
                                closeSidebar();
                            }}
                        >
                            Logout
                        </button>
                    </nav>

                    {/* DESKTOP FOOTER pinned bottom: Help Centre, Settings, Logout icon (right) */}
                    <div className="sidebar-footer desktop-only">
                        <Link
                            to="/helpcentreinterface"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/helpcentreinterface') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={helpInterface} alt="" className="icon" />
                            <span className="label">Help Centre</span>
                        </Link>

                        <div className="settings-row">
                            <Link
                                to="/profile"
                                onClick={closeSidebar}
                                className={`sidebar-button settings-link ${isActive('/profile') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={settingsInterface} alt="" className="icon" />
                                <span className="label">Settings</span>
                            </Link>

                            <button
                                className="logout-icon-btn"
                                onClick={() => {
                                    handleLogout();
                                    closeSidebar();
                                }}
                                aria-label="Logout"
                                title="Logout"
                                type="button"
                            >
                                <img src={logoutInterface} alt="" className="icon icon-red" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
