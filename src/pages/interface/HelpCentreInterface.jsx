import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

export default function HelpCentreInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= 1000;
      const currentIsSmallMobile = window.innerWidth <= 600;
      setIsMobile(currentIsMobile);
      setIsSmallMobile(currentIsSmallMobile);
      if (!currentIsMobile && sidebarOpen) setSidebarOpen(false);
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

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Mobile header */}
      <div className="myprofile-mobile-header">
        <Link to="/myprofile" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        <div
          className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="main-content-container">
        <PageHeader
          title="Help Centre"
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        {/* Under maintenance message */}
        <div className="w-full flex items-center justify-center">
          <div
            className="maintenance-card"
            style={{
              width: '100%',
              marginTop: '5px',
              background: '#F7F7F7',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              padding: '28px',
              textAlign: 'center',
            }}
          >
            <h2 className="desktop-h5" style={{ marginBottom: 8 }}>
              This page is under maintenance
            </h2>
            <p className="desktop-body-s" style={{ color: '#6b7280' }}>
              We’re polishing a few things. Please check back soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
