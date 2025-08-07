import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
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
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(3);

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

    // This part runs only after the user clicks the button a second time
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
          subtitle="Choose what's right for your business."
        />

        <div className="profile-page-wrapper">
          <div className="subscription-offer-left contact-card-content">
            <div className="subscription-header">
              <p className='desktop-h5'>Power Profile</p>
              <div className="free-trial-badge">14 Day Free Trial</div>
            </div>
            <p className='desktop-body-s subscription-subheader'>Create a stunning, professional profile in minutes. No coding needed.</p>

            <div className="subscription-features">
              {[
                "Update anytime, instantly",
                "Choose your own font",
                "Select Light or Dark mode",
                "Craft your 'About Me' section",
                "Showcase your work portfolio",
                "Display client reviews",
                "List your services",
                "Set your pricing",
              ].map((text, idx) => (
                <div className="hero-tick" key={idx}>
                  <img src={TickIcon} className="icon" />
                  <p>{text}</p>
                </div>
              ))}
            </div>

            <p className='desktop-body-s subscription-description-footer'>
              "The perfect tool for tradesmen to make an unforgettable first impression and get new clients."
            </p>

            <div className="subscription-price-cta">
              <div className='price-display'>
                <p className='desktop-h5'>£7.95</p>
                <p className='light-black' style={{ fontSize: 14 }}>Per Month</p>
              </div>
              {isSubscribed ? (
                <div className="active-plan-buttons">
                  <button className="desktop-button combined-section-button black-button">
                    Plan Active
                  </button>
                  <button onClick={handleCancelSubscription} className={`desktop-button combined-section-button red-button ${isConfirmingCancel ? 'confirm-cancel' : ''}`}>
                    {isConfirmingCancel ? (cancelCountdown > 0 ? `Cancel in ${cancelCountdown}...` : 'Confirm Cancel') : 'Cancel Subscription'}
                  </button>
                </div>
              ) : (
                <button onClick={handleSubscribe} className="desktop-button combined-section-button black-button">
                  Subscribe Now
                </button>
              )}
            </div>
          </div>

          <div className="card-offer-right contact-card-content">
            <div className="product-header">
              <p className='desktop-h5'>Plastic NFC Card</p>
              <div className="free-trial-badge product-header-badge">12 Month Warranty</div>
            </div>
            <p className='desktop-body-s product-subheader'>Lightweight, Durable, Always Ready</p>
            <p className='desktop-body-xs product-optional-sentence'>This product is optional, buy one to stand out.</p>

            <img src={PlasticCard} className="product-image" />

            <p className='desktop-body-s subscription-description-footer'>
              "For those who want to stand out above those who already stand out!"
            </p>

            <div className="product-price-cta">
              <div className='price-display'>
                <p className='desktop-h5'>£24.95</p>
                <p className='light-black' style={{ fontSize: 14 }}>Lifetime Use</p>
              </div>
              <Link to="/productandplan/konarcard" className="desktop-button combined-section-button black-button">
                View Card Details
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}