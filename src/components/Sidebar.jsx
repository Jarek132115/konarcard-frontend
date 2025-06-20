import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Import AuthContext from correct path

import LogoIcon from '../assets/icons/Logo-Icon.svg';
import settingsIcon from '../assets/icons/Settings-Icon.svg';
import profileIcon from '../assets/icons/Profile-Icon.svg';
import cardIcon from '../assets/icons/Card-Icon.svg';
import helpIcon from '../assets/icons/Help-Icon.svg';
import logoutIcon from '../assets/icons/Logout-Icon.svg';
// notificationIcon is not used in the provided code, but keeping it imported if it's used elsewhere in the file's original version
// import notificationIcon from '../assets/icons/Notification-Icon.svg';
import subscriptionIcon from '../assets/icons/Subscription-Icon.svg';
// billingIcon is not used in the provided code, but keeping it imported if it's used elsewhere in the file's original version
// import billingIcon from '../assets/icons/Billing-Icon.svg';
import homeIcon from '../assets/icons/Home-Icon.svg';

export default function Sidebar() {
    const navigate = useNavigate();
    // CORRECTED: Destructure 'logout' function from AuthContext
    const { user, logout } = useContext(AuthContext); // Use the logout function provided by AuthContext

    const handleLogout = async () => {
        // Use the logout function from AuthContext.
        // It handles clearing the token and making the backend call via the 'api' utility.
        await logout();
        navigate('/'); // Navigate to homepage after successful logout
    };

    return (
        <div className='sidebar'>
            {/* USER INFO */}
            <div className="my-account-container">
                <img src={LogoIcon} alt="User" className="profile-pic" />
                <div className="user-info">
                    <p className="email">{user?.email || 'Not logged in'}</p>
                    <p className="name">{user?.name || ''}</p>
                </div>
            </div>

            <hr className="divider" />

            {/* MAIN */}
            <div className="main-links-container">
                <p className="section-title">MAIN</p>
                <div className="sidebar-buttons" onClick={() => navigate('/myprofile')}>
                    <img src={profileIcon} alt="profile" className="icon" />
                    <p className='desktop-body-s'>My Profile</p>
                </div>
                <div className="sidebar-buttons" onClick={() => navigate('/nfccards')}>
                    <img src={cardIcon} alt="card" className="icon" />
                    <p className='desktop-body-s'>NFC Cards</p>
                </div>
            </div>

            <hr className="divider" />

            {/* ACCOUNT */}
            <div className="account-links-container">
                <p className="section-title">ACCOUNT</p>
                <div className="sidebar-buttons" onClick={() => navigate('/profile')}>
                    <img src={settingsIcon} alt="account" className="icon" />
                    <p className='desktop-body-s'>My Account</p>
                </div>
                <div className="sidebar-buttons" onClick={() => navigate('/subscription')}>
                    <img src={subscriptionIcon} alt="subscription" className="icon" />
                    <p className='desktop-body-s'>Subscription</p>
                </div>
            </div>

            <hr className="divider" />

            {/* HELP */}
            <div className="help-links-container">
                <p className="section-title">HELP</p>
                <div className="sidebar-buttons" onClick={() => navigate('/contact-support')}>
                    <img src={helpIcon} alt="contact" className="icon" />
                    <p className='desktop-body-s'>Contact Us</p>
                </div>
                <div className="sidebar-buttons" onClick={() => navigate('/helpcentreinterface')}>
                    <img src={helpIcon} alt="help centre" className="icon" />
                    <p className='desktop-body-s'>Help Centre</p>
                </div> {/* Corrected line: Removed the extra '}' */}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="footer-actions">
                <div className="sidebar-buttons" onClick={() => navigate('/')}>
                    <img src={homeIcon} alt="home" className="icon" />
                    <p className='go-back'>Go to Homepage</p>
                </div>
                <div className="sidebar-buttons logout-button" onClick={handleLogout}>
                    <img src={logoutIcon} alt="logout" className="icon" />
                    <p className='logout-text'>Logout Account</p>
                </div>
            </div>
        </div>
    );
}