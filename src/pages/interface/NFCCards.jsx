import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { loadStripe } from '@stripe/stripe-js';

/** Product gallery (same as Home) */
import CardCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';

/* ---- Stripe helper ---- */
async function getStripePublishableKey() {
  const envKey =
    process.env.REACT_APP_STRIPE_PK ||
    process.env.VITE_STRIPE_PK ||
    process.env.NEXT_PUBLIC_STRIPE_PK;
  if (envKey) return envKey;

  try {
    const res = await api.get('/stripe-pk', { params: { ts: Date.now() } });
    const key = res?.data?.publishableKey || res?.data?.key || res?.data?.pk;
    if (key) return key;
  } catch { }
  return null;
}

export default function NFCCards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

  const [showShareModal, setShowShareModal] = useState(false);
  const [ordering, setOrdering] = useState(false);

  const { user: authUser } = useContext(AuthContext);
  const isSubscribed = !!authUser?.isSubscribed;
  const userId = authUser?._id;
  const userUsername = authUser?.username;

  const { data: businessCard } = useFetchBusinessCard(userId);
  const navigate = useNavigate();
  const location = useLocation();

  /** Product gallery */
  const [cardMainImage, setCardMainImage] = useState(CardCover);
  const cardThumbs = [CardCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4];

  useEffect(() => {
    const handleResize = () => {
      const m = window.innerWidth <= 1000;
      const sm = window.innerWidth <= 600;
      setIsMobile(m);
      setIsSmallMobile(sm);
      if (!m && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) document.body.classList.add('body-no-scroll');
    else document.body.classList.remove('body-no-scroll');
  }, [sidebarOpen, isMobile]);

  /* Subscription checkout */
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
      if (url) window.location.assign(url);
      else toast.error('Could not start subscription. Please try again.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Subscription failed. Please try again.');
    }
  };

  /* Physical card checkout */
  const handleOrderCard = async () => {
    if (ordering) return;
    if (!authUser) {
      navigate('/login', { state: { from: location.pathname, checkoutType: 'card' } });
      return;
    }

    setOrdering(true);
    try {
      const origin = window.location.origin;
      const payload = {
        productId: 'konar-card-white',
        quantity: 1,
        successUrl: `${origin}/success`,
        cancelUrl: `${origin}/productandplan`,
        returnUrl: `${origin}/success`,
      };

      const res = await api.post('/buy-card', payload);
      const data = res?.data || {};

      const redirectUrl = data.url || data.sessionUrl;
      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      if (data.sessionId) {
        const pk = await getStripePublishableKey();
        if (!pk) {
          toast.error('Missing Stripe publishable key. Set REACT_APP_STRIPE_PK or add /stripe-pk endpoint.');
          return;
        }
        const stripe = await loadStripe(pk);
        if (!stripe) {
          toast.error('Could not load Stripe. Please refresh and try again.');
          return;
        }
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) toast.error(error.message || 'Stripe redirect failed. Please try again.');
        return;
      }

      toast.error('Could not start checkout. Please try again.');
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || 'Checkout failed. Please try again.');
    } finally {
      setOrdering(false);
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

  /* Two-line features (title + sub) */
  const featureBlocks = [
    { t: 'Simple editor', s: 'Get set up quickly — no tech skills required.' },
    { t: 'Show what you do', s: 'Share your services and work in seconds.' },
    { t: 'Unlimited images', s: 'Upload every project — no limits on galleries.' },
    { t: 'Unlimited services', s: 'List each job you offer with clear pricing.' },
    { t: 'Unlimited reviews', s: 'Build instant trust with social proof.' },
    { t: 'Custom branding', s: 'Your logo, colours and layout — make it yours.' },
    { t: 'Share everywhere', s: 'Link, QR code, and NFC tap for instant contacts.' },
    { t: 'Instant updates', s: 'Edit once — changes go live across your profile.' },
    { t: 'No app needed', s: 'Works on iPhone & Android, right in the browser.' },
    { t: 'Cancel anytime', s: 'Stay flexible — no long contracts.' },
  ];

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* mobile header */}
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

        {/* Scoped wrapper */}
        <div className="nfc-pricing-page">
          <div className="profile-page-wrapper">
            <div className="pricing-grid">
              {/* Subscription card */}
              <div className="pricing-card nfc-pricing-subscription" style={{ borderRadius: 16 }}>
                <div className="pricing-inner">
                  <div className="pricing-content">
                    <div className="pricing-head">
                      <div>
                        <h3 className="desktop-h5">Konar Profile</h3>
                        <p className="desktop-body-xs">Win more work with a power profile</p>
                      </div>
                      {/* solid BLUE pill */}
                      <span className="pricing-badge pill-blue-solid">14-Day Free Trial</span>
                    </div>

                    <div className="pricing-divider" />

                    <div className="pricing-price-row">
                      <span className="desktop-h3" style={{ paddingRight: 5 }}>£4.95</span>
                      <span className="desktop-button" style={{ padding: 0 }}>/Month - After 14 Days</span>
                    </div>

                    {/* Two-column bullets on desktop, 1 on mobile */}
                    <ul className="feature-grid">
                      {featureBlocks.map((f, i) => (
                        <li key={i} className="feature-item">
                          <span className="blue-dot" aria-hidden="true" />
                          <div className="feature-copy">
                            <div className="feature-title desktop-body-s">{f.t}</div>
                            <div className="feature-sub desktop-body-xs">{f.s}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pricing-bottom">
                    {isSubscribed ? (
                      <button
                        className="cta-blue-button desktop-button"
                        style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }}
                        disabled
                        type="button"
                      >
                        Plan active
                      </button>
                    ) : (
                      <button
                        onClick={handleSubscribe}
                        className="cta-blue-button desktop-button"
                        style={{ width: '100%' }}
                        type="button"
                      >
                        Subscribe now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical card */}
              <div className="pricing-card nfc-pricing-product" style={{ borderRadius: 16 }}>
                <div className="pricing-inner">
                  <div className="pricing-content">
                    <div className="pricing-head">
                      <div>
                        <h3 className="desktop-h5">Konar Card - White Edition</h3>
                        <p className="desktop-body-xs">Tap to share your profile instantly.</p>
                      </div>
                      {/* solid BLACK pill */}
                      <span className="pricing-badge pill-black">12 Month Warranty</span>
                    </div>

                    <div className="pricing-divider" />

                    <div className="pricing-price-row">
                      <span className="desktop-h3">£24.95</span>
                    </div>

                    {/* Gallery */}
                    <div className="pricing-media-tray">
                      <div className="pricing-media-main fixed-43">
                        <img src={cardMainImage} alt="Konar Card - White Edition" />
                      </div>
                      <div className="pricing-media-thumbs tight">
                        {cardThumbs.map((src, i) => (
                          <button
                            key={i}
                            className={`pricing-media-thumb ${cardMainImage === src ? 'is-active' : ''}`}
                            onClick={() => setCardMainImage(src)}
                            type="button"
                          >
                            <img src={src} alt={`Konar Card thumbnail ${i + 1}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pricing-bottom">
                    <button
                      onClick={handleOrderCard}
                      className="cta-black-button desktop-button"
                      style={{ width: '100%' }}
                      type="button"
                      disabled={ordering}
                    >
                      {ordering ? 'Starting checkout…' : 'Order now'}
                    </button>
                  </div>
                </div>
              </div>
              {/* end product card */}
            </div>
          </div>
        </div>
      </main>

      <ShareProfile
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        profileUrl={currentProfileUrl}
        qrCodeUrl={currentQrCodeUrl}
        contactDetails={{
          full_name: businessCard?.full_name || authUser?.name || '',
          job_title: businessCard?.job_title || '',
          business_card_name: businessCard?.business_card_name || '',
          bio: businessCard?.bio || '',
          contact_email: businessCard?.contact_email || authUser?.email || '',
          phone_number: businessCard?.phone_number || '',
          username: userUsername || '',
        }}
        username={userUsername || ''}
      />
    </div>
  );
}
