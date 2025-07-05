// frontend/src/components/Sidebar.jsx

import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LogoIcon from '../assets/icons/Logo-Icon.svg';
import settingsIcon from '../assets/icons/Settings-Icon.svg';
import profileIcon from '../assets/icons/Profile-Icon.svg';
import cardIcon from '../assets/icons/Card-Icon.svg';
import helpIcon from '../assets/icons/Help-Icon.svg';
import logoutIcon from '../assets/icons/Logout-Icon.svg';
import subscriptionIcon from '../assets/icons/Subscription-Icon.svg';
import homeIcon from '../assets/icons/Home-Icon.svg';
import contactIcon from '../assets/icons/Contact-Icon.svg'; // <<< NEW: Import the Contact-Icon.svg

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-mobile-header-inner">
                <Link to="/" className="sidebar-logo-link-mobile" onClick={closeSidebar}>
                    <img src={LogoIcon} alt="Logo" className="sidebar-logo-mobile" />
                </Link>
                <div className="close-sidebar-button" onClick={closeSidebar}>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <div className="sidebar-content-wrapper">
                <div className="my-account-container">
                    <img src={LogoIcon} alt="User" className="profile-pic" />
                    <div className="user-info">
                        <p className="email desktop-body-xs">{user?.email || 'Not logged in'}</p>
                        <p className="name">{user?.name || ''}</p>
                    </div>
                </div>

                <hr className="divider" />

                <div className="top-links-group">
                    <div className="main-links-container">
                        <p className="section-title">MAIN</p>
                        <Link to="/myprofile" className={`sidebar-button ${isActive('/myprofile') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={profileIcon} alt="profile" className="icon" />
                            <p className='desktop-body-s'>My Profile</p>
                        </Link>
                        <Link to="/nfccards" className={`sidebar-button ${isActive('/nfccards') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={cardIcon} alt="card" className="icon" />
                            <p className='desktop-body-s'>NFC Cards</p>
                        </Link>
                    </div>

                    <hr className="divider" />

                    <div className="account-links-container">
                        <p className="section-title">ACCOUNT</p>
                        <Link to="/profile" className={`sidebar-button ${isActive('/profile') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={settingsIcon} alt="account" className="icon" />
                            <p className='desktop-body-s'>My Account</p>
                        </Link>
                        <Link to="/subscription" className={`sidebar-button ${isActive('/subscription') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={subscriptionIcon} alt="subscription" className="icon" />
                            <p className='desktop-body-s'>Subscription</p>
                        </Link>
                    </div>

                    <hr className="divider" />

                    <div className="help-links-container">
                        <p className="section-title">HELP</p>
                        <Link to="/contact-support" className={`sidebar-button ${isActive('/contact-support') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={contactIcon} alt="contact" className="icon" /> {/* <<< CHANGED: Use contactIcon here */}
                            <p className='desktop-body-s'>Contact Us</p>
                        </Link>
                        <Link to="/helpcentreinterface" className={`sidebar-button ${isActive('/helpcentreinterface') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={helpIcon} alt="help centre" className="icon" />
                            <p className='desktop-body-s'>Help Centre</p>
                        </Link>
                    </div>
                </div>

                <div className="footer-actions">
                    <Link to="/" className={`sidebar-button ${isActive('/') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                        <img src={homeIcon} alt="home" className="icon" />
                        <p className='desktop-body-s'>Go to Homepage</p>
                    </Link>
                    <button className="sidebar-button logout-button" onClick={() => { handleLogout(); closeSidebar(); }}>
                        <img src={logoutIcon} alt="logout" className="icon" />
                        <p className='desktop-body-s'>Logout Account</p>
                    </button>
                </div>
            </div>
        </div>
    );
}