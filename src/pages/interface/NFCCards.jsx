import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

import TickIcon from '../../assets/icons/Tick-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

/** Product gallery (same as Home) */
import CardCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';

export default function NFCCards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

  const [showShareModal, setShowShareModal] = useState(false);

  const { user: authUser } = useContext(AuthContext);
  const isSubscribed = !!authUser?.isSubscribed;
  const userId = authUser?._id;
  const userUsername = authUser?.username;

  const { data: businessCard } = useFetchBusinessCard(userId);
  const navigate = useNavigate();
  const location = useLocation();

  /** Home-like product gallery */
  const [cardMainImage, setCardMainImage] = useState(CardCover);
  const cardThumbs = [CardCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4];

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
    if (sidebarOpen && isMobile) document.body.classList.add('body-no-scroll');
    else document.body.classList.remove('body-no-scroll');
  }, [sidebarOpen, isMobile]);

  const handleSubscribe = async () => {
    if (!authUser) {
      navigate('/login', { state: { from: location.pathname, checkoutType: 'subscription' } });
      return;
    }
    try {
      const res = await api.post('/subscribe', {
        returnUrl: window.location.origin + '/SuccessSubscription',
      });
      const { url } = res.data || {};
      if (url) window.location.href = url;
      else toast.error('Could not start subscription. Please try again.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Subscription failed. Please try again.');
    }
  };

  /** Open Stripe Checkout for the physical card order */
  const handleOrderCard = async () => {
    // if user must be logged in, redirect to login first
    if (!authUser) {
      navigate('/login', { state: { from: location.pathname, checkoutType: 'card' } });
      return;
    }
    try {
      // Adjust endpoint to your backend route that creates the Checkout Session
      const res = await api.post('/buy-card', {
        returnUrl: window.location.origin + '/success',
      });
      const { url } = res.data || {};
      if (url) window.location.href = url;
      else toast.error('Could not start checkout. Please try again.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed. Please try again.');
    }
  };

  const handleShareCard = () => {
    if (!authUser?.isVerified) {
      toast.error('Please verify your email to share your card.');
      return;
    }
    setShowShareModal(true);
  };
  const handleCloseShareModal = () => setShowShareModal(false);

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

  // SAME feature bullets as Home for subscription card
  const homeFeatureBullets = [
    'Simple editor; no tech skills.',
    'Show what you do, fast.',
    'Unlimited images — show all your work.',
    'Unlimited services — list every job.',
    'Unlimited reviews — build instant trust.',
    'Custom branding — logo, colours, layout.',
    'Share everywhere — link, QR, NFC tap.',
    'Update anytime — changes live instantly.',
    'No app needed — iPhone, Android.',
    'Cancel Anytime',
  ];

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
          <span></span><span></span><span></span>
        </div>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main-content-container">
        <PageHeader
          title="Our Plans & Cards"
          onActivateCard={() => { }}
          onShareCard={handleShareCard}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        <div className="profile-page-wrapper">
          <div className="pricing-grid">
            {/* Subscription card (blue) */}
            <div className="pricing-card pricing-card--subscription" style={{ borderRadius: 16 }}>
              <div className="pricing-inner">
                <div className="pricing-head">
                  <div>
                    <h3 className="desktop-h5">Konar Profile</h3>
                    <p className="desktop-body-xs">Win more work with a power profile</p>
                  </div>
                  <span className="pricing-badge dark-blue">14-Day Free Trial</span>
                </div>
                <div className="pricing-divider" />
                <div className="pricing-price-row">
                  <span style={{ paddingRight: 5 }} className="desktop-h3">£4.95</span>
                  <span style={{ padding: 0 }} className="desktop-button">/Month - After 14 Days</span>
                </div>

                <ul className="pricing-features">
                  {homeFeatureBullets.map((text, i) => (
                    <li className="pricing-feature" key={i}>
                      <img src={TickIcon} alt="" className="pricing-check invert-for-blue" />
                      <span className="white desktop-body-x">{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="pricing-bottom">
                  {isSubscribed ? (
                    <button
                      className="cta-blue-button desktop-button"
                      style={{ marginTop: 20, width: '100%', opacity: 0.7, cursor: 'not-allowed' }}
                      disabled
                      type="button"
                    >
                      Plan active
                    </button>
                  ) : (
                    <button
                      onClick={handleSubscribe}
                      className="cta-blue-button desktop-button"
                      style={{ marginTop: 20, width: '100%' }}
                      type="button"
                    >
                      Subscribe now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Physical card (black) — gallery + “Order now” */}
            <div className="pricing-card pricing-card--product" style={{ borderRadius: 16 }}>
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
                  <span className="desktop-h3">£24.95</span>
                </div>

                {/* Same gallery structure/classes as Home */}
                <div className="pricing-media-tray">
                  <div className="pricing-media-main">
                    <img src={cardMainImage} alt="Konar Card - White Edition" />
                  </div>
                  <div className="pricing-media-thumbs">
                    {cardThumbs.map((src, i) => (
                      <button
                        key={i}
                        className={`pricing-media-thumb ${cardMainImage === src ? 'is-active' : ''}`}
                        onClick={() => setCardMainImage(src)}
                      >
                        <img src={src} alt={`Konar Card thumbnail ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pricing-bottom">
                  <button
                    onClick={handleOrderCard}
                    className="cta-black-button desktop-button"
                    style={{ marginTop: 20, width: '100%' }}
                    type="button"
                  >
                    Order now
                  </button>
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
