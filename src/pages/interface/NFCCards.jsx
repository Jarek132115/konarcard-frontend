import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import PlasticCard from '../../assets/images/KonarCard.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import NFCBusinessCard from '../../assets/images/NFC-Business-Card.jpg';
import PremiumMaterials from '../../assets/icons/Premium-Materials-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg';
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
    <div className="contact-card-content">
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
            <div className="subscription-offer-left content-card-box">
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

            <div className="nfc-card-offer-container content-card-box">
              <div className="nfc-card-header">
                <p className='nfc-card-title'>Plastic NFC Card</p>
                <div className="nfc-card-badge">1-month subscription included</div>
              </div>
              <p className="nfc-card-subheader">Lightweight, Durable, Always Ready</p>
              <p className="nfc-card-optional-text">This product is optional, buy one to stand out.</p>

              <img src={PlasticCard} className="nfc-card-image" alt="Plastic NFC Card" />

              <p className='nfc-card-quote-footer'>
                "For those who want to stand out above those who already stand out!"
              </p>

              <div className="nfc-card-price-cta-wrapper">
                <div className='nfc-card-price-display'>
                  <p className='nfc-card-price-value'>£24.95</p>
                  <p className='nfc-card-price-period'>Lifetime Use</p>
                </div>
                <Link to="/shopnfccards/whitecard" className="nfc-card-buy-button">Buy Now</Link>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-1-title">
              <h2 className='desktop-h3 text-center'>Your Work. Your Card. Built to Impress.</h2>
              <h3 className='desktop-h6 text-center'>Your digital page and smart card—a powerful combo built to impress and win you work.</h3>
            </div>
            <div style={{ gap: 40 }} className="section-1-content">
              <div className="section-1-left">
                <img src={NFCBusinessCard} className="" />
              </div>
              <div className="section-1-right">
                <p className='desktop-h5'>Why Tradies Choose Konar</p>
                <p className='desktop-body'>It's a powerful tool that combines your digital portfolio with a smart physical card to get you noticed.</p>
                <div className="section-list">
                  <div className=" icon-white">
                    <img src={PremiumMaterials} className="icon" />
                  </div>
                  <div className="section-list-info">
                    <p className='desktop-h6'>Look Professional & Legit</p>
                    <p className='desktop-body-xs'>Present a professional online profile and hand out a sleek, modern card that sets you apart from the competition.</p>
                  </div>
                </div>
                <div className="section-list">
                  <div className=" icon-white">
                    <img src={NFCIcon} className="icon" />
                  </div>
                  <div className="section-list-info">
                    <p className='desktop-h6'>Showcase Your Best Work</p>
                    <p className='desktop-body-xs'>Easily upload a portfolio of your past jobs and display customer reviews to build instant trust with new clients.</p>
                  </div>
                </div>
                <div className="section-list">
                  <div className=" icon-white">
                    <img src={PalletteIcon} className="icon" />
                  </div>
                  <div className="section-list-info">
                    <p className='desktop-h6'>Share in Seconds</p>
                    <p className='desktop-body-xs'>Instantly share your full profile with a simple tap of your card or a QR scan. Always be ready to connect with new leads.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}