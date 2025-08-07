import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import PlasticCard from '../../assets/images/KonarCard.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import { toast } from 'react-hot-toast';

export default function NFCCards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  const { user: authUser, loading: authLoading } = useContext(AuthContext);
  const userId = authUser?._id;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

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

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
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

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)}></div>
      )}

      <main className="main-content-container">
        <PageHeader
          title="Our Plans & Cards"
          subtitle="Choose what's right for your business."
        />

        <div className="combined-offer-container">
          <div className="subscription-offer-left contact-card-content">
            <div className="subscription-header">
              <p className='desktop-h5'>Power Profile</p>
              <div className="free-trial-badge">14 Day Free Trial</div>
            </div>
            <p className='desktop-body-s subscription-subheader'>Create a stunning, professional profile in minutes. No coding needed.</p>

            <div className="subscription-features">
              {[
                "Update anytime, instantly",
                "Choose your own font",
                "Select Light or Dark mode",
                "Craft your 'About Me' section",
                "Showcase your work portfolio",
                "Display client reviews",
                "List your services",
                "Set your pricing",
              ].map((text, idx) => (
                <div className="hero-tick" key={idx}>
                  <img src={TickIcon} className="icon" />
                  <p>{text}</p>
                </div>
              ))}
            </div>

            <p className='desktop-body-s subscription-description-footer'>
              "The perfect tool for tradesmen to make an unforgettable first impression and get new clients."
            </p>

            <div className="subscription-price-cta">
              <div className='price-display'>
                <p className='desktop-h5'>£7.95</p>
                <p className='light-black' style={{ fontSize: 14 }}>Per Month</p>
              </div>
              <Link to="/productandplan/konarsubscription" className="desktop-button combined-section-button black-button">
                View Subscription Details
              </Link>
            </div>
          </div>

          <div className="card-offer-right contact-card-content">
            <div className="product-header">
              <p className='desktop-h5'>Plastic NFC Card</p>
              <div className="free-trial-badge product-header-badge">12 Month Warranty</div>
            </div>
            <p className='desktop-body-s product-subheader'>Lightweight, Durable, Always Ready</p>
            <p className='desktop-body-xs product-optional-sentence'>This product is optional, buy one to stand out.</p>

            <img src={PlasticCard} className="product-image" />

            <p className='desktop-body-s subscription-description-footer'>
              "For those who want to stand out above those who already stand out!"
            </p>

            <div className="product-price-cta">
              <div className='price-display'>
                <p className='desktop-h5'>£24.95</p>
                <p className='light-black' style={{ fontSize: 14 }}>Lifetime Use</p>
              </div>
              <Link to="/productandplan/konarcard" className="desktop-button combined-section-button black-button">
                View Card Details
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}