import React, { useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LogoIcon from '../assets/icons/Logo-Icon.svg';
// Removed specific icons that are no longer used for sidebar links, to clean up imports
// import settingsIcon from '../assets/icons/Settings-Icon.svg';
// import profileIcon from '../assets/icons/Profile-Icon.svg';
// import cardIcon from '../assets/icons/Card-Icon.svg';
// import helpIcon from '../assets/icons/Help-Icon.svg';
// import logoutIcon from '../assets/icons/Logout-Icon.svg';
// import subscriptionIcon from '../assets/icons/Subscription-Icon.svg';
// import homeIcon from '../assets/icons/Home-Icon.svg';
// import contactIcon from '../assets/icons/Contact-Icon.svg';

// Interface icons for clarity in the sidebar (only keep those still used for actual links)
import homeInterface from '../assets/icons/Home-Interface.svg';
import cardInterface from '../assets/icons/Card-Interface.svg'; // Using this for Products & Plans
import settingsInterface from '../assets/icons/Settings-Interface.svg';
// import subscriptionInterface from '../assets/icons/Subscription-Interface.svg'; // No longer used for a direct link
import contactInterface from '../assets/icons/Contact-Interface.svg';
// import helpInterface from '../assets/icons/Help-Interface.svg'; // No longer used for direct link
import logoutInterface from '../assets/icons/Logout-Interface.svg';


export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    // Debugging logs from previous conversation (can be removed once confirmed working)
    useEffect(() => {
        console.log("Sidebar: AuthContext user object:", user);
        console.log("Sidebar: User Name:", user?.name);
        console.log("Sidebar: User Email:", user?.email);
    }, [user]);

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
                    <span></span>
                </div>
            </div>

            <div className="sidebar-content-wrapper">
                <div className="my-account-container">
                    <img src={user?.avatar || LogoIcon} alt="User" className="profile-pic" />
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
                            <img src={homeInterface} alt="profile" className="icon" />
                            <p className='desktop-body-s'>My Profile</p>
                        </Link>
                    </div>

                    <hr className="divider" />

                    <div className="account-links-container">
                        <p className="section-title">ACCOUNT</p>
                        <Link to="/profile" className={`sidebar-button ${isActive('/profile') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={settingsInterface} alt="account" className="icon" />
                            <p className='desktop-body-s'>My Account</p>
                        </Link>
                        <Link to="/subscription" className={`sidebar-button ${isActive('/products-and-plans') || isActive('/nfccards') || isActive('/subscription') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={cardInterface} alt="products and plans" className="icon" />
                            <p className='desktop-body-s'>Products & Plans</p>
                        </Link>
                    </div>

                    <hr className="divider" />

                    <div className="help-links-container">
                        <p className="section-title">HELP</p>
                        <Link to="/contact-support" className={`sidebar-button ${isActive('/contact-support') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={contactInterface} alt="contact" className="icon" />
                            <p className='desktop-body-s'>Contact Us</p>
                        </Link>
                        {/* REMOVED: Help Centre Link */}
                        {/* <Link to="/helpcentreinterface" className={`sidebar-button ${isActive('/helpcentreinterface') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                            <img src={helpInterface} alt="help centre" className="icon" />
                            <p className='desktop-body-s'>Help Centre</p>
                        </Link> */}
                    </div>
                </div>

                <div className="footer-actions">
                    <Link to="/" className={`sidebar-button ${isActive('/') ? 'active-sidebar-link' : ''}`} onClick={closeSidebar}>
                        <img src={homeInterface} alt="home" className="icon" />
                        <p className='desktop-body-s'>Go to Homepage</p>
                    </Link>
                    <button className="sidebar-button logout-button" onClick={() => { handleLogout(); closeSidebar(); }}>
                        <img src={logoutInterface} alt="logout" className="icon" />
                        <p className='desktop-body-s'>Logout Account</p>
                    </button>
                </div>
            </div>
        </div>
    );
}