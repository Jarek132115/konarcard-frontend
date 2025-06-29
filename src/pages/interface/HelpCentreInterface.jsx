import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Link } from 'react-router-dom'; // Import Link for Logo
import Sidebar from '../../components/Sidebar';
import HeroBackground from '../../assets/images/background-hero.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg'; // Import LogoIcon

export default function HelpCentre() {
  // New state for sidebar and mobile responsiveness
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  // Effect for handling window resize to update isMobile state
  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= 1000;
      setIsMobile(currentIsMobile);
      if (!currentIsMobile && sidebarOpen) {
        setSidebarOpen(false); // Close sidebar if transitioning from mobile to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]); // Re-evaluate when sidebarOpen changes

  // Effect for controlling body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
  }, [sidebarOpen, isMobile]); // Re-evaluate when sidebarOpen or isMobile changes

  return (
    // Apply myprofile-layout and dynamic sidebar-active class
    <div className={`myprofile-layout ${sidebarOpen && isMobile ? 'sidebar-active' : ''}`}>
      {/* MyProfile Mobile Header - Replicated from MyProfile.jsx */}
      <div className="myprofile-mobile-header">
        <Link to="/" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        <div
          className={`myprofile-hamburger ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Sidebar component, passing state and setter */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>
      )}

      <main className="myprofile-main">
        <div className="page-wrapper">
          <div className="page-header">
            <h2 className="page-title">Help Centre</h2>
            {/* These buttons are likely not needed on a help center page, but keeping them as per original */}
            <div className="page-actions">
              <button className="header-button black">🖱️ Activate Your Card</button>
              <button className="header-button white">🔗 Share Your Card</button>
            </div>
          </div>

          <div className="help-video-card">
            <img src={HeroBackground} alt="Profile Setup" className="help-video-thumb" />
            <div className="help-video-content">
              <h2 className="help-video-title">How To Set Up Your Profile</h2>
              <p className="help-video-desc">
                Learn how to create your profile, add your details, and save it for instant sharing.
              </p>
              <p className="help-video-time">Watch Time: 46 seconds</p>
              <button className="help-video-button">Watch Now</button>
            </div>
          </div>

          <div className="help-video-card reverse">
            <div className="help-video-content">
              <h2 className="help-video-title">How to Activate Your NFC Card</h2>
              <p className="help-video-desc">
                Step-by-step activation process to connect your physical card to your digital profile.
              </p>
              <p className="help-video-time">Watch Time: 46 seconds</p>
              <button className="help-video-button">Watch Now</button>
            </div>
            <img src={HeroBackground} alt="Card Activation" className="help-video-thumb" />
          </div>
        </div>
      </main>
    </div>
  );
}