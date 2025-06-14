import React, { useEffect, useState, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../components/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TickIcon from '../../assets/icons/Tick-Icon.svg';

export default function Subscription() {
  const { user } = useContext(AuthContext);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/subscription-status`, {
          withCredentials: true,
        });
        setIsSubscribed(res.data.active);
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const handleSubscribe = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/subscribe`, {}, { withCredentials: true }); if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error('Subscription failed');
    }
  };

  const handleCancel = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/cancel-subscription`, {}, { withCredentials: true });
      toast.success('Subscription cancelled');
      setIsSubscribed(false);
    } catch (err) {
      toast.error('Failed to cancel');
    }
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

                  {!loading && (
                    <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {isSubscribed ? (
                        <>
                          <button className="primary-button" disabled>
                            Plan Active
                          </button>
                          <button
                            className="secondary-button"
                            onClick={handleCancel}
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
                        <button className="primary-button" onClick={handleSubscribe}>
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