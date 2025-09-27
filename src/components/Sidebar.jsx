// src/components/Sidebar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

/* Icons (desktop only) */
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
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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
                    {/* Divider ABOVE Home */}
                    <div className="mobile-divider mobile-only" aria-hidden="true" />

                    <nav className="links-stack">
                        <Link
                            to="/myprofile"
                            onClick={closeSidebar}
                            className={`sidebar-button desktop-h4 ${isActive('/myprofile') ? 'active' : ''
                                }`}
                        >
                            Home
                        </Link>

                        <Link
                            to="/myorders"
                            onClick={closeSidebar}
                            className={`sidebar-button desktop-h4 ${isActive('/myorders') ? 'active' : ''
                                }`}
                        >
                            My Orders
                        </Link>

                        <Link
                            to="/nfccards"
                            onClick={closeSidebar}
                            className={`sidebar-button desktop-h4 ${isActive('/products-and-plans') ||
                                    isActive('/nfccards') ||
                                    isActive('/subscription')
                                    ? 'active'
                                    : ''
                                }`}
                        >
                            Product &amp; Plan
                        </Link>

                        {/* Divider between Product & Plan and Contact Us */}
                        <div className="mobile-divider mobile-only" aria-hidden="true" />

                        <Link
                            to="/contact-support"
                            onClick={closeSidebar}
                            className={`sidebar-button desktop-h4 ${isActive('/contact-support') ? 'active' : ''
                                }`}
                        >
                            Contact Us
                        </Link>

                        <Link
                            to="/helpcentreinterface"
                            onClick={closeSidebar}
                            className={`sidebar-button desktop-h4 ${isActive('/helpcentreinterface') ? 'active' : ''
                                }`}
                        >
                            Help Centre
                        </Link>

                        <Link
                            to="/profile"
                            onClick={closeSidebar}
                            className={`sidebar-button desktop-h4 ${isActive('/profile') ? 'active' : ''
                                }`}
                        >
                            Settings
                        </Link>

                        {/* Divider above Logout */}
                        <div className="mobile-divider mobile-only" aria-hidden="true" />

                        {/* Logout full-width red link */}
                        {isMobile ? (
                            <button
                                type="button"
                                className="desktop-h4 logout-link mobile-only"
                                onClick={() => {
                                    handleLogout();
                                    closeSidebar();
                                }}
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="settings-row desktop-only">
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
                        )}
                    </nav>
                </div>
            </aside>
        </>
    );
}
