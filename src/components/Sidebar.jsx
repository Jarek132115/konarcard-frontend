// frontend/src/components/Sidebar.jsx (MODIFIED - Removed HamburgerIcon SVG import)

import React, { useState, useContext } from 'react'; // Added useState
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LogoIcon from '../assets/icons/Logo-Icon.svg';
import settingsIcon from '../assets/icons/Settings-Icon.svg';
import profileIcon from '../assets/icons/Profile-Icon.svg';
import cardIcon from '../assets/icons/Card-Icon.svg';
import helpIcon from '../assets/icons/Help-Icon.svg';
import logoutIcon from '../assets/icons/Logout-Icon.svg';
import subscriptionIcon from '../assets/icons/Subscription-Icon.svg';
import homeIcon from '../assets/icons/Home-Icon.svg';
// REMOVED: import HamburgerIcon from '../assets/icons/Hamburger-Icon.svg'; // This line is now removed

export default function Sidebar() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar visibility

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        // Main container for the sidebar, conditionally applies 'open' class
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

            {/* Mobile Header for Sidebar (will be visible only on mobile/tablet) */}
            <div className="sidebar-mobile-header">
                <Link to="/" className="sidebar-logo-link" onClick={closeSidebar}>
                    <img src={LogoIcon} alt="Logo" className="sidebar-logo" />
                </Link>
                {/* Hamburger/Close button for mobile sidebar - now CSS-only */}
                <div
                    className={`sidebar-hamburger ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <span></span> {/* First line of hamburger */}
                    <span></span> {/* Second line of hamburger */}
                    <span></span> {/* Third line of hamburger */}
                </div>
            </div>

            {/* Sidebar content container */}
            <div className="sidebar-content-wrapper">
                {/* USER INFO */}
                <div className="my-account-container">
                    <img src={LogoIcon} alt="User" className="profile-pic" />
                    <div className="user-info">
                        <p className="email">{user?.email || 'Not logged in'}</p>
                        <p className="name">{user?.name || ''}</p>
                    </div>
                </div>

                <hr className="divider" />

                {/* MAIN LINKS */}
                <div className="main-links-container">
                    <p className="section-title">MAIN</p>
                    <Link to="/myprofile" className="sidebar-button" onClick={closeSidebar}>
                        <img src={profileIcon} alt="profile" className="icon" />
                        <p className='desktop-body-s'>My Profile</p>
                    </Link>
                    <Link to="/nfccards" className="sidebar-button" onClick={closeSidebar}>
                        <img src={cardIcon} alt="card" className="icon" />
                        <p className='desktop-body-s'>NFC Cards</p>
                    </Link>
                </div>

                <hr className="divider" />

                {/* ACCOUNT LINKS */}
                <div className="account-links-container">
                    <p className="section-title">ACCOUNT</p>
                    <Link to="/profile" className="sidebar-button" onClick={closeSidebar}>
                        <img src={settingsIcon} alt="account" className="icon" />
                        <p className='desktop-body-s'>My Account</p>
                    </Link>
                    <Link to="/subscription" className="sidebar-button" onClick={closeSidebar}>
                        <img src={subscriptionIcon} alt="subscription" className="icon" />
                        <p className='desktop-body-s'>Subscription</p>
                    </Link>
                </div>

                <hr className="divider" />

                {/* HELP LINKS */}
                <div className="help-links-container">
                    <p className="section-title">HELP</p>
                    <Link to="/contact-support" className="sidebar-button" onClick={closeSidebar}>
                        <img src={helpIcon} alt="contact" className="icon" />
                        <p className='desktop-body-s'>Contact Us</p>
                    </Link>
                    <Link to="/helpcentreinterface" className="sidebar-button" onClick={closeSidebar}>
                        <img src={helpIcon} alt="help centre" className="icon" />
                        <p className='desktop-body-s'>Help Centre</p>
                    </Link>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="footer-actions">
                    <Link to="/" className="sidebar-button" onClick={closeSidebar}>
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