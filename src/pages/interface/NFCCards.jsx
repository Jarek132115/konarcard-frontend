import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import PlasticCard from '../../assets/images/KonarCard.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function NFCCards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(3);
  const [showShareModal, setShowShareModal] = useState(false);

  const { user: authUser, loading: authLoading } = useContext(AuthContext);
  const userId = authUser?._id;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

  const navigate = useNavigate();
  const location = useLocation();
  const isSubscribed = authUser ? authUser.isSubscribed : false;

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

  useEffect(() => {
    if (isConfirmingCancel) {
      if (cancelCountdown > 0) {
        const timer = setTimeout(() => {
          setCancelCountdown(cancelCountdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isConfirmingCancel, cancelCountdown]);

  const handleSubscribe = async () => {
    if (!authUser) {
      navigate('/login', {
        state: {
          from: location.pathname,
          checkoutType: 'subscription',
        },
      });
      return;
    }

    if (isSubscribed) {
      toast.error('You are already subscribed to the Power Profile.');
      return;
    }

    try {
      const res = await api.post('/subscribe', {
        returnUrl: window.location.origin + '/SuccessSubscription',
      });

      const { url } = res.data;

      if (url) {
        window.location.href = url;
      } else {
        toast.error('Could not start subscription. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Subscription failed. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!isConfirmingCancel) {
      setIsConfirmingCancel(true);
      return;
    }

    if (cancelCountdown === 0) {
      try {
        const res = await api.post('/cancel-subscription');
        if (res.data.success) {
          toast.success(res.data.message);
        } else {
          toast.error(res.data.error);
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to cancel subscription.');
      } finally {
        setIsConfirmingCancel(false);
        setCancelCountdown(3);
      }
    }
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
          onActivateCard={() => { /* Functionality not implemented here */ }}
          onShareCard={handleShareCard}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        <div className="myprofile-flex-container">
          <div className="pricing-grid">
            {/* Subscription card (blue) */}
            <div style={{ borderRadius: 16 }} className="pricing-card pricing-card--subscription">
              <div className="pricing-inner">
                <div className="pricing-head">
                  <div>
                    <h3 className="desktop-h5">Power Profile</h3>
                    <p className="desktop-body-xs">Win more work with a power profile</p>
                  </div>
                  <span className="pricing-badge blue">14-Day Free Trial</span>
                </div>
                <div className="pricing-divider" />
                <div className="pricing-price-row">
                  <span className="desktop-h1">£4.95</span>
                  <span className="desktop-button">Per Month</span>
                </div>

                <ul className="pricing-features">
                  {[
                    'Update your profile instantly (real-time edits)',
                    'Choose fonts and light/dark themes',
                    'Write a compelling “About Me” section',
                    'Showcase your work with unlimited images',
                    'Collect and display client reviews (star ratings)',
                    'List your services and set pricing',
                    'Share via QR code, link, or save-to-contacts',
                    'Display work/services as list, grid, or carousel',
                    'Make it easy for clients to contact you',
                  ].map((text, i) => (
                    <li className="pricing-feature" key={i}>
                      <img src={TickIcon} alt="" className="pricing-check invert-for-blue" />
                      <span style={{ fontWeight: 600 }} className="white desktop-body-x">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="pricing-bottom">
                  <Link
                    to="/productandplan/konarsubscription"
                    className="cta-blue-button desktop-button"
                    style={{ marginTop: 20, width: '100%' }}
                  >
                    View Subscription Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Physical card (black) */}
            <div style={{ borderRadius: 16 }} className="pricing-card pricing-card--product">
              <div className="pricing-inner">
                <div className="pricing-head">
                  <div>
                    <h3 className="desktop-h5">Konar Card - White Edition</h3>
                    <p className="desktop-body-xs">Tap to share your profile instantly.</p>
                  </div>
                  <span className="pricing-badge">12 Month Warranty</span>
                </div>
                <div className="pricing-divider" />
                <div className="pricing-price-row">
                  <span className="desktop-h1">£24.95</span>
                  <span className="desktop-button">One Time Purchase</span>
                </div>

                <div className="pricing-media">
                  <img src={PlasticCard} alt="Konar Card - White Edition" />
                </div>

                <div className="pricing-bottom">
                  <Link
                    to="/productandplan/konarcard"
                    className="cta-black-button desktop-button"
                    style={{ marginTop: 20, width: '100%' }}
                  >
                    View Card Details
                  </Link>
                </div>
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
