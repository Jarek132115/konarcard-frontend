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
            {/* Mobile overlay (matches navbar) */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Header row — desktop shows text brand, mobile shows logo + ✕ with grey divider */}
                <div className="brand-header">
                    {/* Desktop brand text (Cal Sans) */}
                    <span className="brand-text">KonarCard</span>

                    {/* Mobile logo */}
                    <img src={LogoIcon} alt="Konar" className="brand-logo" />

                    {/* Mobile close button — exact same as navbar (✕) */}
                    <button
                        className="mobile-close mobile-only"
                        aria-label="Close menu"
                        onClick={closeSidebar}
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                {/* Scroll area / content */}
                <div className="sidebar-content-wrapper">
                    <nav className="links-stack">
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

                        {/* Divider (mobile only) exactly like navbar */}
                        {isMobile && <div className="mobile-divider" aria-hidden="true" />}

                        <Link
                            to="/contact-support"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/contact-support') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={contactInterface} alt="" className="icon" />
                            <span className="label">Contact Us</span>
                        </Link>

                        <Link
                            to="/helpcentreinterface"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/helpcentreinterface') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={helpInterface} alt="" className="icon" />
                            <span className="label">Help Centre</span>
                        </Link>

                        <Link
                            to="/profile"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/profile') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={settingsInterface} alt="" className="icon" />
                            <span className="label">Settings</span>
                        </Link>

                        {/* Mobile: red text Logout under Settings (no icon) */}
                        {isMobile ? (
                            <button
                                type="button"
                                className="desktop-h4 logout-link mobile-only"
                                onClick={() => { handleLogout(); closeSidebar(); }}
                            >
                                Logout
                            </button>
                        ) : (
                            /* Desktop: keep the small logout icon button row */
                            <div className="settings-row desktop-only">
                                <button
                                    className="logout-icon-btn"
                                    onClick={() => { handleLogout(); closeSidebar(); }}
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
