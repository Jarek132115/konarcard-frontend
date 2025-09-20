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

    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

    useEffect(() => {
        const onResize = () => {
            const mob = window.innerWidth <= 1000;
            setIsMobile(mob);
            // Don’t keep collapsed mode on mobile
            if (mob && collapsed) setCollapsed(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [collapsed]);

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

            <aside
                className={`sidebar ${sidebarOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''
                    }`}
            >
                {/* Top row (desktop): logo + collapse button */}
                <div className="brand-header desktop-only">
                    <img src={LogoIcon} alt="Konar" className="brand-logo" />
                    <button
                        className="collapse-toggle"
                        onClick={() => setCollapsed((v) => !v)}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {/* tiny inline chevron */}
                        <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            aria-hidden="true"
                            style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
                        >
                            <path
                                d="M14.5 6l-1.4 1.4 3.2 3.1H6v2h10.3l-3.2 3.1 1.4 1.4L20 12z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>

                {/* Mobile drawer top row (close button) */}
                <div className="sidebar-mobile-top-row mobile-only">
                    <button
                        className="close-sidebar-button"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>

                <div className="sidebar-content-wrapper">
                    {/* MAIN group */}
                    <div className="top-links-group">
                        <p className="section-title">MAIN</p>

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

                        <hr className="divider" />

                        {/* Keep Contact in the top cluster */}
                        <Link
                            to="/contact-support"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/contact-support') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={contactInterface} alt="" className="icon" />
                            <span className="label">Contact Us</span>
                        </Link>
                    </div>

                    {/* FOOTER cluster pinned to bottom:
              Help Centre (above), then Settings + logout icon on the right.
              In collapsed mode these become stacked icons. */}
                    <div className="sidebar-footer">
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
