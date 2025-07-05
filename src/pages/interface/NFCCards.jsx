import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
// Removed ShareProfile import as it's no longer needed on this page
import PlasticCard from '../../assets/images/KonarCard.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import { toast } from 'react-hot-toast';

export default function NFCCards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  // Removed showShareModal state as it's no longer needed
  // const [showShareModal, setShowShareModal] = useState(false);

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

  const handleActivateCard = () => {
    console.log("Activate Card clicked on NFC Cards page");
  };

  // Removed handleShareCard function as it's no longer needed
  // const handleShareCard = () => {
  //   if (!authUser?.isVerified) {
  //     toast.error("Please verify your email to share your card.");
  //     return;
  //   }
  //   setShowShareModal(true);
  // };

  // Removed handleCloseShareModal function as it's no longer needed
  // const handleCloseShareModal = () => {
  //   setShowShareModal(false);
  // };

  // contactDetailsForVCard and currentProfileUrl/currentQrCodeUrl are now redundant if ShareProfile is removed,
  // but keeping them just in case they're used elsewhere or for future features.
  const contactDetailsForVCard = {
    full_name: businessCard?.full_name || authUser?.name || '',
    job_title: businessCard?.job_title || '',
    business_card_name: businessCard?.business_card_name || '',
    bio: businessCard?.bio || '',
    contact_email: businessCard?.contact_email || authUser?.email || '',
    phone_number: businessCard?.phone_number || '',
    username: userUsername || '',
  };

  const currentProfileUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : '';
  const currentQrCodeUrl = businessCard?.qrCodeUrl || '';


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
          <PageHeader
            title="Choose Your Perfect Card"
            onActivateCard={handleActivateCard}
          // Removed onShareCard prop
          // onShareCard={handleShareCard}
          />

          <p className="nfc-page-subtitle">
            Premium materials. Custom designs. Instantly share your contact details with a single tap.
          </p>

          {/* This is the new main container for the NFC Card offer */}
          <div className="nfc-card-offer-container">
            <div className="nfc-card-header">
              <p className='nfc-card-title'>Plastic NFC Card</p>
              <div className="nfc-card-badge">1-month subscription included</div>
            </div>
            <p className='nfc-card-subheader'>Lightweight, Durable, Always Ready</p>
            <p className='nfc-card-optional-text'>This product is optional, buy one to stand out.</p>

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
      </main>
    </div>
  );
}