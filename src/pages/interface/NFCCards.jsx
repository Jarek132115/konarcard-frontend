import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import KonarCard from '../../assets/images/KonarCard.png';
// Assuming LogoIcon is available in assets/icons
import LogoIcon from '../../assets/icons/Logo-Icon.svg'; // Import LogoIcon

export default function NFCCards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  // Effect for handling window resize to update isMobile state
  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= 1000;
      setIsMobile(currentIsMobile);
      // If resizing from mobile to desktop while sidebar is open, close it
      if (!currentIsMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]); // Dependency on sidebarOpen to re-evaluate when it changes

  // Effect for controlling body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
  }, [sidebarOpen, isMobile]); // Dependencies to re-evaluate when sidebarOpen or isMobile changes


  return (
    // Apply myprofile-layout and dynamic sidebar-active class
    <div className={`myprofile-layout ${sidebarOpen && isMobile ? 'sidebar-active' : ''}`}>
      {/* MyProfile Mobile Header - Logo on left, Hamburger on right */}
      {/* This mobile header needs to be replicated for all pages */}
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

      {/* Main content area, structured like MyProfile page */}
      <main className="myprofile-main">
        {/* The rest of your NFCCards page content */}
        <div className="page-wrapper">
          <div className="page-header">
            <h2 className="page-title">Choose Your Perfect Card</h2>
            <div className="page-actions">
              <button className="header-button black">🖱️ Activate Your Card</button>
              <button className="header-button white">🔗 Share Your Card</button>
            </div>
          </div>

          <p className="nfc-subtitle">
            Premium materials. Custom designs. Instantly share your contact details with a single tap.
          </p>

          <div className="section-3-container shop-page-container">
            <div className="Prouct-Image-Section">
              <img src={KonarCard} className="Product-Image" alt="Konar Card" />
              <div className='product-description'>
                <div className="grey-box desktop-body-xs">1-month subscription included</div>
                <p className='desktop-h5 text-center'>Konar Card - White Edition</p>
                <p className='desktop-body text-center'>Engineered to impress. Built to last.</p>
                <p style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginTop: 10, marginBottom: 5 }}>£19.95</p>
                <Link to="/shopnfccards/whitecard" style={{ display: 'flex', width: 'fit-content', margin: 'auto' }} className="black-button desktop-button margin-top-10">Buy Now</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}