import React, { useEffect, useState, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import TickIcon from '../../assets/icons/Tick-Icon.svg';

export default function Subscription() {
  const { user } = useContext(AuthContext);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false); // New state for confirmation step
  const [cancelCooldown, setCancelCooldown] = useState(0); // New state for countdown
  const [isCancelling, setIsCancelling] = useState(false); // To disable buttons during process

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

  // Countdown useEffect for cancellation
  useEffect(() => {
    let timer;
    if (cancelCooldown > 0 && showCancelConfirm) {
      setIsCancelling(true); // Disable buttons during countdown
      timer = setTimeout(() => setCancelCooldown(prev => prev - 1), 1000);
    } else if (cancelCooldown === 0 && showCancelConfirm) {
      setIsCancelling(false); // Enable confirm button once countdown is 0
    } else {
      setIsCancelling(false); // Reset if confirmation is hidden
    }
    return () => clearTimeout(timer);
  }, [cancelCooldown, showCancelConfirm]);


  const handleSubscribe = async () => {
    setIsCancelling(true); // Disable subscribe button during initiation
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
      setIsCancelling(false); // Re-enable if there's an immediate error
    }
  };

  // Step 1: Initiate cancellation confirmation
  const initiateCancelConfirmation = () => {
    setShowCancelConfirm(true);
    setCancelCooldown(3); // Start 3-second countdown
    toast('Confirm cancellation in 3 seconds...', { duration: 3000 }); // Optional toast
  };

  // Step 2: Confirm cancellation after cooldown
  const confirmCancel = async () => {
    setIsCancelling(true); // Disable buttons during API call
    try {
      await api.post('/cancel-subscription', {});
      toast.success('Subscription will be cancelled at the end of the current billing period.');
      setIsSubscribed(false); // Optimistically update UI
      setShowCancelConfirm(false); // Hide confirmation
      setCancelCooldown(0); // Reset cooldown
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      toast.error(err.response?.data?.error || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false); // Re-enable after API call
    }
  };

  const cancelConfirmationPrompt = () => {
    setShowCancelConfirm(false); // Hide the prompt
    setCancelCooldown(0); // Reset cooldown
    setIsCancelling(false); // Ensure buttons are re-enabled
  };

  return (
    <div className="myprofile-layout">
      <Sidebar />
      <main className="myprofile-main">
        <div className="page-wrapper">
          <div className="page-header">
            <h2 className="page-title">Subscription</h2>
            <div className="page-actions">
              <button className="header-button black">🖱️ Activate Your Card</button>
              <button className="header-button white">🔗 Share Your Card</button>
            </div>
          </div>

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
                                onClick={initiateCancelConfirmation} // First click initiates confirmation
                                disabled={isCancelling} // Disable if already cancelling/counting down
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
                            // Confirmation / Countdown UI
                            <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #ffcc00', borderRadius: '8px', background: '#fffbe6' }}>
                              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                {cancelCooldown > 0 ? `Confirm cancel in ${cancelCooldown}...` : 'Are you sure?'}
                              </p>
                              <button
                                className="primary-button"
                                onClick={confirmCancel}
                                disabled={cancelCooldown > 0 || isCancelling} // Disable until countdown is over or if API call is in progress
                                style={{
                                  backgroundColor: cancelCooldown > 0 || isCancelling ? '#e0e0e0' : '#dc3545', // Red for confirm cancel
                                  cursor: cancelCooldown > 0 || isCancelling ? 'not-allowed' : 'pointer',
                                  color: 'white',
                                  marginRight: '10px'
                                }}
                              >
                                {isCancelling && cancelCooldown === 0 ? 'Cancelling...' : 'Confirm Cancel'}
                              </button>
                              <button
                                className="secondary-button"
                                onClick={cancelConfirmationPrompt} // Button to hide the prompt
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
    </div>
  );
}