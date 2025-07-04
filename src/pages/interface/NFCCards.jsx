import React, { useState, useEffect, useContext } from 'react'; 
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile'; 
import KonarCard from '../../assets/images/KonarCard.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext'; 
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard'; 

export default function NFCCards() {
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

  const handleActivateCard = () => {
    console.log("Activate Card clicked on NFC Cards page");
  };

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

  const contactDetailsForVCard = {
    full_name: authUser?.name || '',
    job_title: '', 
    business_card_name: businessCard?.business_card_name || '',
    bio: '',
    contact_email: authUser?.email || '',
    phone_number: '', 
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
            onShareCard={handleShareCard}
          />

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