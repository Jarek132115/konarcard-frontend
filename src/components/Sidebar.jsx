// src/components/Sidebar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

/* Icons */
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
                {/* Top row */}
                <div className="brand-header">
                    {/* Desktop: text logo (Cal Sans) / Mobile: icon */}
                    <span className="brand-text">KonarCard</span>
                    <img src={LogoIcon} alt="Konar" className="brand-logo" />
                    <button
                        className="close-sidebar-button mobile-only"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>

                <div className="sidebar-content-wrapper">
                    {/* LINKS */}
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

                        <Link
                            to="/contact-support"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/contact-support') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={contactInterface} alt="" className="icon" />
                            <span className="label">Contact Us</span>
                        </Link>

                        {/* Moved into main stack (right under Contact Us) */}
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
                    </nav>

                    {/* Bottom: logout only */}
                    <div className="sidebar-footer">
                        <button
                            className="logout-icon-btn"
                            onClick={() => {
                                handleLogout();
                                closeSidebar();
                            }}
                            aria-label="Logout"
                            title="Logout"
                        >
                            <img src={logoutInterface} alt="" className="icon icon-red" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Inline mobile-only style tweak to hide icons on small screens, if you
          don’t want to touch the main CSS file. Remove if you’ve added this rule there. */}
            <style>{`
        @media (max-width: 1000px) {
          .sidebar-button .icon { display: none !important; }
          .sidebar-button { gap: 0 !important; padding-left: 12px !important; }
        }
      `}</style>
        </>
    );
}
