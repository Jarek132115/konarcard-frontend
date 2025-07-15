import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';
import api from '../../services/api';

import TickIcon from '../../assets/icons/Tick-Icon.svg';
import PlasticCard from '../../assets/images/PlasticCard.png';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';


import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('pk_live_51RPmTAP7pC1ilLXASjenuib1XpQAiuBOxcUuYbeQ35GbhZEVi3V6DRwriLetAcHc3biiZ6dlfzz1fdvHj2wvj1hS00lHDjoAu8');


export default function Subscription() {
  const { user: authUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscriptionStatus, setLoadingSubscriptionStatus] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelCooldown, setCancelCooldown] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);
  const [showShareModal, setShowShareModal] = useState(false);

  const userId = authUser?._id;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!authUser) {
        setLoadingSubscriptionStatus(false);
        return;
      }
      try {
        const res = await api.get('/subscription-status');
        setIsSubscribed(res.data.active);
      } catch (err) {
        console.error('Error fetching subscription status:', err);
        toast.error('Failed to load subscription status.');
      } finally {
        setLoadingSubscriptionStatus(false);
      }
    };
    fetchSubscriptionStatus();
  }, [authUser]);


  useEffect(() => {
    let timer;
    if (cancelCooldown > 0 && showCancelConfirm) {
      setIsCancelling(true);
      timer = setTimeout(() => setCancelCooldown(prev => prev - 1), 1000);
    } else if (cancelCooldown === 0 && showCancelConfirm) {
      setIsCancelling(false);
    } else {
      setIsCancelling(false);
    }
    return () => clearTimeout(timer);
  }, [cancelCooldown, showCancelConfirm]);


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
      toast.info('You are already subscribed to the Power Profile.');
      return;
    }

    setIsCancelling(true);
    try {
      const res = await api.post('/subscribe', {
        returnUrl: window.location.origin + '/SuccessSubscription',
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Failed to get Stripe checkout URL.');
      }
    } catch (err) {
      console.error('Subscription initiation failed:', err);
      toast.error(err.response?.data?.error || 'Subscription initiation failed. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBuyCard = async () => {
    const stripe = await stripePromise;
    const quantity = 1;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    const session = await response.json();

    if (session.error) {
      toast.error(session.error);
      return;
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      toast.error(result.error.message);
    }
  };


  const initiateCancelConfirmation = () => {
    setShowCancelConfirm(true);
    setCancelCooldown(3);
    toast('Confirm cancellation in 3 seconds...', { duration: 3000 });
  };

  const confirmCancel = async () => {
    setIsCancelling(true);
    try {
      await api.post('/cancel-subscription', {});
      toast.success('Subscription will be cancelled at the end of the current billing period.');
      setIsSubscribed(false);
      setShowCancelConfirm(false);
      setCancelCooldown(0);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      toast.error(err.response?.data?.error || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const cancelConfirmationPrompt = () => {
    setShowCancelConfirm(false);
    setCancelCooldown(0);
    setIsCancelling(false);
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
          title="Products & Plans"
          onActivateCard={() => console.log("Activate Card clicked on Products & Plans page (functionality not implemented here)")}
          onShareCard={handleShareCard}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        <div className="products-plans-page-wrapper">
          <div className="products-plans-card-container">

            <div className="products-plans-subscription-column">
              <div className="products-plans-header">
                <p className='desktop-h5 products-plans-title'>Power Profile</p>
                {isSubscribed ? null : (
                  <div className="products-plans-badge desktop-body-xs">FREE TRIAL</div>
                )}
              </div>
              <p className='desktop-body-s products-plans-subheader'>Win more work and **stand out** with a power profile.</p>

              <div className="products-plans-features">
                {[
                  "Personalized URL: konarcard.com/u/hmplumbing.",
                  "Set profile pic, cover photo.",
                  "Custom page headings.",
                  "Explain yourself in 'About Me'.",
                  "Show unlimited amazing work photos.",
                  "List unlimited services you provide.",
                  "Build trust: unlimited client reviews."
                ].map((text, idx) => (
                  <div className="products-plans-feature-item" key={idx}>
                    <img src={TickIcon} className="products-plans-feature-icon" alt="tick" />
                    <p className="desktop-body-s black">{text}</p>
                  </div>
                ))}
              </div>

              <p className='desktop-body-s products-plans-footer-text'>
                "Unlock your full potential: make every connection count and secure new opportunities."
              </p>

              <div className="products-plans-price-cta">
                <div className='products-plans-price-display'>
                  <p className='desktop-h5 black'>£5.95</p>
                  <p className='desktop-body-s light-black'>Per Month</p>
                </div>
                {loadingSubscriptionStatus ? (
                  <button className="desktop-button black-button products-plans-action-button" disabled>
                    <span className="desktop-button">Loading Plan Status...</span>
                  </button>
                ) : isSubscribed ? (
                  <>
                    {!showCancelConfirm ? (
                      <>
                        <button className="desktop-button blue-button products-plans-action-button" disabled>
                          <span className="desktop-button">Plan Active</span>
                        </button>
                        <button
                          className="desktop-button black-button products-plans-action-button"
                          onClick={initiateCancelConfirmation}
                          disabled={isCancelling}
                        >
                          <span className="desktop-button">Cancel Subscription</span>
                        </button>
                      </>
                    ) : (
                      <div className="products-plans-cancel-confirm">
                        <p className="desktop-body black">
                          {cancelCooldown > 0 ? `Confirm cancel in ${cancelCooldown}...` : 'Are you sure?'}
                        </p>
                        <div className="products-plans-cancel-buttons">
                          <button
                            className="desktop-button blue-button products-plans-action-button"
                            onClick={confirmCancel}
                            disabled={cancelCooldown > 0 || isCancelling}
                          >
                            <span className="desktop-button">
                              {isCancelling && cancelCooldown === 0 ? 'Cancelling...' : 'Confirm Cancel'}
                            </span>
                          </button>
                          <button
                            className="desktop-button black-button products-plans-action-button"
                            onClick={cancelConfirmationPrompt}
                            disabled={isCancelling}
                          >
                            <span className="desktop-button">Go Back</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button className="desktop-button black-button products-plans-action-button" onClick={handleSubscribe} disabled={isCancelling}>
                    <span className="desktop-button">Upgrade to Power Profile</span>
                  </button>
                )}
              </div>
            </div>

            <div className="products-plans-card-column">
              <div className="products-plans-header">
                <p className='desktop-h5 products-plans-title'>Plastic NFC Card</p>
                <div className="products-plans-badge products-plans-product-badge">1-month subscription included</div>
              </div>
              <p className='desktop-body-s products-plans-subheader'>Lightweight, Durable, Always Ready</p>
              <p className='desktop-body-xs products-plans-optional-text'>This product is optional, buy one to stand out.</p>

              <img src={PlasticCard} className="products-plans-product-image" alt="Plastic NFC Card" />

              <p className='desktop-body-s products-plans-footer-text'>
                "For those who want to stand out above those who already stand out!"
              </p>

              <div className="products-plans-price-cta">
                <div className='products-plans-price-display'>
                  <p className='desktop-h5 black'>£24.95</p>
                  <p className='desktop-body-s light-black'>Lifetime Use</p>
                </div>
                <button onClick={handleBuyCard} className="desktop-button blue-button products-plans-action-button">
                  <span className="desktop-button">Buy Now</span>
                </button>
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