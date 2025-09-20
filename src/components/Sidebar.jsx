import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

import LogoIcon from '../assets/icons/Logo-Icon.svg';
import homeInterface from '../assets/icons/Home-Interface.svg';
import orderIcon from '../assets/icons/MyOrder-Icon.svg';
import cardInterface from '../assets/icons/Card-Interface.svg';
import settingsInterface from '../assets/icons/Settings-Interface.svg';
import contactInterface from '../assets/icons/Contact-Interface.svg';
import helpInterface from '../assets/icons/Help-Interface.svg';
import logoutInterface from '../assets/icons/Logout-Interface.svg';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const closeSidebar = () => setSidebarOpen(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Prefix-aware matcher so nested routes highlight (e.g. /productandplan/…)
    const isActive = (paths) => {
        const list = Array.isArray(paths) ? paths : [paths];
        return list.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));
    };

    return (
        <>
            {/* Mobile dim overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Main navigation">
                {/* Desktop brand header */}
                <div className="brand-header desktop-only">
                    <img src={LogoIcon} alt="" className="brand-logo" />
                    <span className="brand-wordmark">KONAR</span>
                </div>

                {/* Mobile drawer header (close button) */}
                <div className="sidebar-mobile-top-row mobile-only">
                    <button
                        className="close-sidebar-button"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                        type="button"
                    >
                        <span></span><span></span><span></span>
                    </button>
                </div>

                <div className="sidebar-content-wrapper">
                    <nav className="top-links-group" role="navigation" aria-label="Sidebar">
                        {/* MAIN */}
                        <div className="main-links-container">
                            <p className="section-title" aria-hidden="true">MAIN</p>

                            <Link
                                to="/myprofile"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/myprofile') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={homeInterface} alt="" className="icon" />
                                <p className="desktop-body-s">Home</p>
                            </Link>

                            <Link
                                to="/myorders"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/myorders') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={orderIcon} alt="" className="icon" />
                                <p className="desktop-body-s">My Orders</p>
                            </Link>

                            <Link
                                to="/nfccards"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive(['/products-and-plans', '/productandplan', '/nfccards', '/subscription'])
                                        ? 'active-sidebar-link'
                                        : ''
                                    }`}
                            >
                                <img src={cardInterface} alt="" className="icon" />
                                <p className="desktop-body-s">Product &amp; Plan</p>
                            </Link>
                        </div>

                        <hr className="divider" />

                        {/* GENERAL */}
                        <div className="account-links-container">
                            <p className="section-title" aria-hidden="true">GENERAL</p>

                            <Link
                                to="/profile"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/profile') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={settingsInterface} alt="" className="icon" />
                                <p className="desktop-body-s">My Account</p>
                            </Link>

                            <Link
                                to="/contact-support"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/contact-support') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={contactInterface} alt="" className="icon" />
                                <p className="desktop-body-s">Contact Us</p>
                            </Link>

                            <Link
                                to="/helpcentreinterface"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/helpcentreinterface') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={helpInterface} alt="" className="icon" />
                                <p className="desktop-body-s">Help Centre</p>
                            </Link>

                            <button
                                type="button"
                                className="sidebar-button logout-button"
                                onClick={() => {
                                    handleLogout();
                                    closeSidebar();
                                }}
                            >
                                <img src={logoutInterface} alt="" className="icon" />
                                <p className="desktop-body-s">Logout Account</p>
                            </button>
                        </div>
                    </nav>
                </div>
            </aside>
        </>
    );
}
