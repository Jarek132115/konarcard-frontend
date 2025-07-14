import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile'; // Still imported as it's a global component
import HeroBackground from '../../assets/images/background-hero.png'; // Example image for article thumbnails
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import { toast } from 'react-hot-toast';


export default function HelpCentre() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);
  const [showShareModal, setShowShareModal] = useState(false); // This state still controls the ShareProfile modal

  const { user: authUser, loading: authLoading } = useContext(AuthContext);
  const userId = authUser?._id;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);


  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= 1000;
      const currentIsSmallMobile = window.innerWidth <= 600;
      setIsMobile(currentIsMobile);
      setIsSmallMobile(currentIsSmallMobile);
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

  // This handleShareCard is for the ShareProfile MODAL (which is still globally available)
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
    console.log("Activate Card clicked on Help Centre page (functionality not implemented here)");
    toast.info("Activate Card functionality is not available on this page.");
  };

  // NEW FUNCTION: handleGetHelp for the specific Help Centre "Share" button
  const handleGetHelp = () => {
    // Replace with your actual step-by-step guide URL or a hosted markdown page
    const helpGuideUrl = "https://your-website.com/help-guide-on-fixing-issues";
    window.open(helpGuideUrl, '_blank', 'noopener,noreferrer');
    toast.success("Opening step-by-step guide!");
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
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <div className="myprofile-mobile-header">
        <Link to="/" className="myprofile-logo-link">
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
          title="Help Centre" // Custom title for this page
          onActivateCard={handleActivateCard} // Use the specific handleActivateCard for this page
          onShareCard={handleGetHelp} // Use the NEW handleGetHelp function for the "Share" button here
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        <div className="help-videos-page-wrapper">
          <div className="help-videos-grid">
            {/* First Help Article/Card */}
            <div className="help-video-item">
              <img src={HeroBackground} alt="Profile Setup Thumbnail" className="video-thumb" />
              <div className="video-content">
                <h2 className="video-title">How To Set Up Your Profile</h2>
                <p className="video-desc">
                  Learn how to create your profile, add your details, and save it for instant sharing.
                </p>
                <p className="video-time">Read Time: 46 seconds</p> {/* Changed from Watch Time */}
                <button className="video-button black-button desktop-button">Get Help</button> {/* Changed button text */}
              </div>
            </div>

            {/* Second Help Article/Card (reversed layout) */}
            <div className="help-video-item video-item-reversed">
              <div className="video-content">
                <h2 className="video-title">How to Activate Your NFC Card</h2>
                <p className="video-desc">
                  Step-by-step activation process to connect your physical card to your digital profile.
                </p>
                <p className="video-time">Read Time: 46 seconds</p> {/* Changed from Watch Time */}
                <button className="video-button black-button desktop-button">Get Help</button> {/* Changed button text */}
              </div>
              <img src={HeroBackground} alt="Card Activation Thumbnail" className="video-thumb" />
            </div>

          </div> {/* End help-videos-grid */}
        </div> {/* End help-videos-page-wrapper */}
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