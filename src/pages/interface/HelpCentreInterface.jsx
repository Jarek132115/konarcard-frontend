import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import HeroBackground from '../../assets/images/background-hero.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import { toast } from 'react-hot-toast';


export default function HelpCentre() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const handleShareCard = () => {
    if (!authUser?.isVerified) {
      toast.error("Please verify your email to share your card.");
      return;
    }
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handleActivateCard = () => {
    console.log("Activate Card clicked on Help Centre page");
  };

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
        {/* PageHeader remains a direct child of myprofile-main */}
        <PageHeader
          title="Help Centre"
          onActivateCard={handleActivateCard}
          onShareCard={handleShareCard}
        />

        {/* This new div acts as the main content "card" that contains the video cards */}
        {/* It gets the max-width and helps center the content */}
        <div className="page-wrapper content-card"> {/* Renamed from 'page-wrapper' to 'content-card' here too for consistency with the CSS rule you provided */}
          {/* The video cards are direct children of content-card now */}
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
        </div> {/* End of content-card */}
      </main>

      <ShareProfile
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        profileUrl={currentProfileUrl}
        qrCodeUrl={currentQrCodeUrl}
        contactDetails={contactDetailsForVCard}
        username={userUsername || ''}
      />
    </div>
  );
}