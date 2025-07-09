import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';

export default function Subscription() {
  const { user: authUser } = useContext(AuthContext);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelCooldown, setCancelCooldown] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [showShareModal, setShowShareModal] = useState(false);

  const userId = authUser?._id;
  const userUsername = authUser?.username;

  const { data: businessCard, isLoading: isCardLoading } = useFetchBusinessCard(userId);


  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const res = await api.get('/subscription-status');
        setIsSubscribed(res.data.active);
      } catch (err) {
        console.error('Error fetching subscription status:', err);
        toast.error('Failed to load subscription status.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

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

  const handleSubscribe = async () => {
    setIsCancelling(true);
    try {
      const res = await api.post('/subscribe', {});
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
    <div className={`app-layout ${sidebarOpen && isMobile ? 'sidebar-active' : ''}`}>
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

      <main className="main-content-container">
        <PageHeader
          title="Subscription"
          onActivateCard={() => console.log("Activate Card clicked on Subscription page")}
          onShareCard={handleShareCard}
        />

        <div className="section-1-title">
          <h2 className='desktop-h3 text-center black'>Our Plan</h2>
          <h3 className='desktop-h6 text-center light-black'>Start free for 7 days — only upgrade if it works for you.</h3>
        </div>

        <div className="combined-offer-container" style={{ justifyContent: 'center' }}>
          <div className="subscription-offer-left">
            <div className="subscription-header">
              <p className='desktop-h5 black'>Power Profile</p>
              {isSubscribed ? null : (
                <div className="free-trial-badge desktop-body-xs">FREE TRIAL</div>
              )}
            </div>
            {/* Updated subtitle for more impact */}
            <p className='desktop-body-s light-black subscription-subheader'>Win more work and *stand out* with a power profile.</p>

            <div className="subscription-features">
              {[
                `Customizable Landing Page at konarcard.com/u/${userUsername || 'yourusername'}`,
                "Exchange Details in One Click.",
                "Explain Who You Are with dedicated sections for your Name, Job Title, and 'About Me'.",
                "Showcase Your Amazing Work with Unlimited Photos/Portfolio.",
                "Build Social Proof with Unlimited Client Reviews.",
                "Show Exactly What You Provide: Unlimited Services.",
                "Secure More Jobs with CRM Integration & Automated Follow-Ups.",
                "Stand Out with Premium NFC Card Design Options & Priority Support.",
              ].map((text, idx) => (
                <div className="hero-tick" key={idx}>
                  <img src={TickIcon} className="icon" alt="tick" />
                  <p className="desktop-body-s black">{text}</p>
                </div>
              ))}
            </div>

            {/* Updated quote for stronger conversion */}
            <p className='desktop-body-s black subscription-description-footer'>
              "Unlock your full potential: make every connection count and secure new opportunities."
            </p>

            <div className="subscription-price-cta">
              <div className='price-display'>
                <p className='desktop-h5 black'>£5.95</p>
                <p className='desktop-body-s light-black'>Per Month</p>
              </div>
              {loading ? (
                <button className="desktop-button black-button" disabled>
                  <span className="desktop-button">Loading Plan Status...</span>
                </button>
              ) : isSubscribed ? (
                <>
                  {!showCancelConfirm ? (
                    <>
                      <button className="desktop-button blue-button" disabled>
                        <span className="desktop-button">Plan Active</span>
                      </button>
                      <button
                        className="desktop-button black-button"
                        onClick={initiateCancelConfirmation}
                        disabled={isCancelling}
                        style={{ marginTop: '10px' }}
                      >
                        <span className="desktop-button">Cancel Subscription</span>
                      </button>
                    </>
                  ) : (
                    <div className="subscription-cancel-confirm">
                      <p className="desktop-body black">
                        {cancelCooldown > 0 ? `Confirm cancel in ${cancelCooldown}...` : 'Are you sure?'}
                      </p>
                      <div className="subscription-cancel-buttons">
                        <button
                          className="desktop-button blue-button-login"
                          onClick={confirmCancel}
                          disabled={cancelCooldown > 0 || isCancelling}
                        >
                          <span className="desktop-button">
                            {isCancelling && cancelCooldown === 0 ? 'Cancelling...' : 'Confirm Cancel'}
                          </span>
                        </button>
                        <button
                          className="desktop-button black-button"
                          onClick={cancelConfirmationPrompt}
                          disabled={isCancelling}
                          style={{ marginTop: '10px' }}
                        >
                          <span className="desktop-button">Go Back</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button className="desktop-button black-button" onClick={handleSubscribe} disabled={isCancelling}>
                  <span className="desktop-button">Upgrade to Power Profile</span>
                </button>
              )}
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