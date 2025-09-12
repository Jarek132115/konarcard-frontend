import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

import LogoIcon from '../assets/icons/Logo-Icon.svg';
import homeInterface from '../assets/icons/Home-Interface.svg';
import cardInterface from '../assets/icons/Card-Interface.svg';
import settingsInterface from '../assets/icons/Settings-Interface.svg';
import contactInterface from '../assets/icons/Contact-Interface.svg';
import helpInterface from '../assets/icons/Help-Interface.svg'; // 🆕 Add a help icon (create/import this asset)
import logoutInterface from '../assets/icons/Logout-Interface.svg';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const closeSidebar = () => setSidebarOpen(false);
    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Dim background on mobile */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* ===== Desktop brand header (hidden on mobile) ===== */}
                <div className="brand-header desktop-only">
                    <img src={LogoIcon} alt="Konar logo" className="brand-logo" />
                    <span className="brand-wordmark">KONAR</span>
                </div>

                {/* ===== Mobile drawer top row (X button) ===== */}
                <div className="sidebar-mobile-top-row mobile-only">
                    <button
                        className="close-sidebar-button"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        <span></span><span></span><span></span>
                    </button>
                </div>

                <div className="sidebar-content-wrapper">
                    {/* MAIN */}
                    <div className="top-links-group">
                        <div className="main-links-container">
                            <p style={{ marginTop: 40 }} className="section-title">MAIN</p>

                            {/* Home */}
                            <Link
                                to="/myprofile"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/myprofile') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={homeInterface} alt="" className="icon" />
                                <p className="desktop-body-s">Home</p>
                            </Link>

                            {/* Products & Plans */}
                            <Link
                                to="/nfccards"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/products-and-plans') ||
                                    isActive('/nfccards') ||
                                    isActive('/subscription')
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
                            <p className="section-title">GENERAL</p>

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

                            {/* 🆕 Help Centre */}
                            <Link
                                to="/helpcentreinterface"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/helpcentreinterface') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={helpInterface} alt="" className="icon" />
                                <p className="desktop-body-s">Help Centre</p>
                            </Link>

                            {/* Logout */}
                            <button
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
                    </div>
                </div>
            </aside>
        </>
    );
}
