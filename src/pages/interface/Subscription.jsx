import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile'; // Import ShareProfile
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard'; // Import useFetchBusinessCard

export default function Subscription() {
  const { user: authUser } = useContext(AuthContext); // Rename user to authUser
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelCooldown, setCancelCooldown] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [showShareModal, setShowShareModal] = useState(false); // Add share modal state

  const userId = authUser?._id;
  const userUsername = authUser?.username;

  // Fetch business card data for this page as well
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

  // Prepare contact details for VCard
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
            title="Subscription"
            onActivateCard={() => console.log("Activate Card clicked on Subscription page")} // Dummy or specific action
            onShareCard={handleShareCard}
          />

          <p className="desktop-h3 text-center">Our Plan</p>
          <p className="desktop-h6 text-center">Start free for 7 days — only upgrade if it works for you.</p>

          <div className="subscription-container">
            <div className="subscription-div">
              <div className="subscription-title">
                <p className="desktop-h5">Power Profile</p>
                <p className="desktop-body-s">Everything you need to look pro and win more work</p>
              </div>

              <div className="subscription-info">
                <div className="hero-tick-container-down">
                  {[
                    'Add a big photo banner at the top of your page',
                    'Write your own main heading and short message',
                    'Choose between light or dark background',
                    'Pick a font that fits your style',
                    'Show your name, job title, and profile photo',
                    'Upload photos of your best work',
                    'List your services and prices clearly',
                    'Add reviews from happy customers',
                    'Add your social media links',
                  ].map((text, idx) => (
                    <div className="hero-tick" key={idx}>
                      <img src={TickIcon} className="icon" alt="tick" />
                      <p>{text}</p>
                    </div>
                  ))}
                </div>

                <div className="subscription-price">
                  <p className="desktop-body-xs" style={{ fontStyle: 'italic' }}>
                    Start free. Cancel anytime during your 7-day trial.
                  </p>
                  <div className="subscription-price-tag">
                    <p style={{ fontSize: 18, fontWeight: 600 }}>£7.95</p>
                    <p className="light-black" style={{ fontSize: 12 }}>Per Month (after trial)</p>
                  </div>

                  {loading ? (
                    <div style={{ marginTop: 20, textAlign: 'center' }}>Loading status...</div>
                  ) : (
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      {isSubscribed ? (
                        <>
                          {!showCancelConfirm ? (
                            <>
                              <button className="primary-button" disabled>
                                Plan Active
                              </button>
                              <button
                                className="secondary-button"
                                onClick={initiateCancelConfirmation}
                                disabled={isCancelling}
                                style={{
                                  background: '#f3f3f3',
                                  color: '#333',
                                  border: '1px solid #ccc',
                                }}
                              >
                                Cancel Subscription
                              </button>
                            </>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #ffcc00', borderRadius: '8px', background: '#fffbe6' }}>
                              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                {cancelCooldown > 0 ? `Confirm cancel in ${cancelCooldown}...` : 'Are you sure?'}
                              </p>
                              <button
                                className="primary-button"
                                onClick={confirmCancel}
                                disabled={cancelCooldown > 0 || isCancelling}
                                style={{
                                  backgroundColor: cancelCooldown > 0 || isCancelling ? '#e0e0e0' : '#dc3545',
                                  cursor: cancelCooldown > 0 || isCancelling ? 'not-allowed' : 'pointer',
                                  color: 'white',
                                  marginRight: '10px'
                                }}
                              >
                                {isCancelling && cancelCooldown === 0 ? 'Cancelling...' : 'Confirm Cancel'}
                              </button>
                              <button
                                className="secondary-button"
                                onClick={cancelConfirmationPrompt}
                                disabled={isCancelling}
                                style={{
                                  background: '#f3f3f3',
                                  color: '#333',
                                  border: '1px solid #ccc',
                                }}
                              >
                                Go Back
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <button className="primary-button" onClick={handleSubscribe} disabled={isCancelling}>
                          Subscribe Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Render ShareProfile component */}
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