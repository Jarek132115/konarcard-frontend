import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader'; // Import PageHeader
import HeroBackground from '../../assets/images/background-hero.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

export default function HelpCentre() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= 1000;
      setIsMobile(currentIsMobile);
      if (!currentIsMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
  }, [sidebarOpen, isMobile]);

  // Define dummy action functions for PageHeader
  const handleActivateCard = () => console.log("Activate Card clicked on Help Centre page");
  const handleShareCard = () => console.log("Share Card clicked on Help Centre page");

  return (
    <div className={`myprofile-layout ${sidebarOpen && isMobile ? 'sidebar-active' : ''}`}>
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

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>
      )}

      <main className="myprofile-main">
        <div className="page-wrapper">
          {/* Replace hardcoded page-header with PageHeader component */}
          <PageHeader
            title="Help Centre" // Title for this page
            onActivateCard={handleActivateCard} // Pass action handlers
            onShareCard={handleShareCard}     // Pass action handlers
          />

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
            </div>
            <img src={HeroBackground} alt="Card Activation" className="help-video-thumb" />
          </div>
        </div>
      </main>
    </div>
  );
}