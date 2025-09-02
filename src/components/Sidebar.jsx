import React, { useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

import LogoIcon from '../assets/icons/Logo-Icon.svg';
import homeInterface from '../assets/icons/Home-Interface.svg';
import cardInterface from '../assets/icons/Card-Interface.svg';
import settingsInterface from '../assets/icons/Settings-Interface.svg';
import contactInterface from '../assets/icons/Contact-Interface.svg';
import logoutInterface from '../assets/icons/Logout-Interface.svg';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    useEffect(() => {
        // Debug (kept from your version)
        // console.log("Sidebar user:", user);
    }, [user]);

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

            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Mobile header */}
                <div className="sidebar-mobile-header-inner">
                    <Link to="/myprofile" className="sidebar-logo-link-mobile" onClick={closeSidebar}>
                        <img src={LogoIcon} alt="Logo" className="sidebar-logo-mobile" />
                    </Link>
                    <button className="close-sidebar-button" onClick={closeSidebar} aria-label="Close menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="sidebar-content-wrapper">
                    {/* Account block */}
                    <div className="my-account-container">
                        <img
                            src={user?.avatar || LogoIcon}
                            alt="User"
                            className="profile-pic"
                        />
                        <div className="user-info">
                            <p className="email desktop-body-xs">{user?.email || 'Not logged in'}</p>
                            <p className="name">{user?.name || ''}</p>
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="top-links-group">
                        {/* MAIN */}
                        <div className="main-links-container">
                            <p className="section-title">MAIN</p>
                            <Link
                                to="/myprofile"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/myprofile') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={homeInterface} alt="" className="icon" />
                                <p className="desktop-body-s">My Profile</p>
                            </Link>
                        </div>

                        <hr className="divider" />

                        {/* ACCOUNT */}
                        <div className="account-links-container">
                            <p className="section-title">ACCOUNT</p>

                            <Link
                                to="/profile"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/profile') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={settingsInterface} alt="" className="icon" />
                                <p className="desktop-body-s">My Account</p>
                            </Link>

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
                                <p className="desktop-body-s">Products &amp; Plans</p>
                            </Link>
                        </div>

                        <hr className="divider" />

                        {/* HELP */}
                        <div className="help-links-container">
                            <p className="section-title">HELP</p>
                            <Link
                                to="/contact-support"
                                onClick={closeSidebar}
                                className={`sidebar-button ${isActive('/contact-support') ? 'active-sidebar-link' : ''}`}
                            >
                                <img src={contactInterface} alt="" className="icon" />
                                <p className="desktop-body-s">Contact Us</p>
                            </Link>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="footer-actions">
                        <Link
                            to="/"
                            onClick={closeSidebar}
                            className={`sidebar-button ${isActive('/') ? 'active-sidebar-link' : ''}`}
                        >
                            <img src={homeInterface} alt="" className="icon" />
                            <p className="desktop-body-s">Go to Homepage</p>
                        </Link>

                        <button
                            className="sidebar-button logout-button"
                            onClick={() => { handleLogout(); closeSidebar(); }}
                        >
                            <img src={logoutInterface} alt="" className="icon" />
                            <p className="desktop-body-s">Logout Account</p>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
