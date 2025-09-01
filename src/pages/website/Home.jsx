// frontend/src/pages/Home/index.jsx
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Section1Image from '../../assets/images/Section-1-Image.png';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import FormCustomizationIcon from '../../assets/icons/FormCustomization-Icon.svg';
import CustomizationIcon from '../../assets/icons/Customization-Icon.svg';
import BoltIcon from '../../assets/icons/Bolt-Icon.svg';
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import EditProfile from '../../assets/images/Edit-Profile.jpg';
import WhyYouNeedThis from '../../assets/images/WhyYouNeedThis.png';
import People from '../../assets/images/People.png';
import PlasticCard from '../../assets/images/PlasticCard.png';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import SetupIcon from '../../assets/icons/Setup-Icon.svg';
import BoxIcon from '../../assets/icons/Box-Icon.svg';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg';
import HatIcon from '../../assets/icons/Hat-Icon.svg';
import LockIcon from '../../assets/icons/Lock-Icon.svg';
import PencilIcon from '../../assets/icons/Pencil-Icon.svg';
import PhoneIcon from '../../assets/icons/Phone-Icon.svg';
import WalletIcon from '../../assets/icons/Wallet-Icon.svg';
import NFCBusinessCard from '../../assets/images/NFC-Business-Card.jpg';
import ScanQRCode from '../../assets/images/ScanQR-Code.jpg';
import LinkInBio from '../../assets/images/LinkInBio.jpg';
import SMSSend from '../../assets/images/SMSSend.jpg';
import pp1 from '../../assets/images/pp1.png';
import pp2 from '../../assets/images/pp2.png';
import pp3 from '../../assets/images/pp3.png';
import pp4 from '../../assets/images/pp4.png';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export default function Home() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isSubscribed = user ? user.isSubscribed : false;
  const loadingStatus = authLoading;

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', {
        state: { from: location.pathname, checkoutType: 'subscription' },
      });
      return;
    }

    if (isSubscribed) {
      toast.info('You are already subscribed to the Power Profile.');
      return;
    }

    try {
      const res = await api.post('/subscribe', {
        returnUrl: window.location.origin + '/SuccessSubscription',
      });
      const { url } = res.data;
      if (url) window.location.href = url;
      else toast.error('Could not start subscription. Please try again.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Subscription failed. Please try again.');
    }
  };

  /* --- Make step images only as tall as their text columns --- */
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('.step-card'));
    const observers = [];

    const updateCard = (card) => {
      const textEl = card.querySelector('.step-text');
      const mediaEl = card.querySelector('.step-media');
      if (!textEl || !mediaEl) return;

      const textH = textEl.offsetHeight;
      const cs = getComputedStyle(mediaEl);
      const mediaPad =
        parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0');

      const imgH = Math.max(0, Math.round(textH - mediaPad));
      card.style.setProperty('--step-media-img-h', `${imgH}px`);
    };

    cards.forEach((card) => {
      updateCard(card);
      const textEl = card.querySelector('.step-text');
      if (textEl) {
        const ro = new ResizeObserver(() => updateCard(card));
        ro.observe(textEl);
        observers.push(ro);
      }
    });

    const onResize = () => cards.forEach(updateCard);
    window.addEventListener('resize', onResize);

    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="home-hero">
        <div className="hero-container">
          <div className="hero-left">
            <div style={{ width: 'fit-content' }} className="step-badge">14 Day <span style={{ fontWeight: 600 }}>Free Trial</span> Now Available</div>
            <h1 className="desktop-h1 hero-heading">
              Stand Out. Get Noticed. Grow Your <span className="blue">Business.</span>
            </h1>
            <p className="desktop-h6 desktop-body">
              Build a professional profile that gets you noticed, and share it effortlessly through your Konar Card with a single tap.
            </p>

            <div className="hero-cta">
              <Link to="/productandplan" className="cta-blue-button desktop-button">View Plans & Cards</Link>
              <Link to="/productandplan/konarsubscription" className="cta-black-button desktop-button">See How It Works</Link>
            </div>

            <div className="hero-social-proof">
              <div className="hero-avatars">
                <img src={pp1} alt="User 1" className="avatar" />
                <img src={pp2} alt="User 2" className="avatar" />
                <img src={pp3} alt="User 3" className="avatar" />
              </div>
              <div className="avatar-text">
                <p style={{ fontWeight: 900 }} className="desktop-h6">1k+</p>
                <p className="desktop-body-xs light-black">Trusted by 1,000+ tradies</p>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <video
              className="hero-video-element"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              role="img"
              aria-label="Hero Animation showing a phone profile with transparent background"
              width="812"
              height="500"
            >
              <source src="/videos/Hero-GIF.webm" type="video/webm" />
              <source src="/videos/Hero-Video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      {/* ---------- 3 STEPS GROUP (with heading + 40px gaps) ---------- */}
      <div className="section steps-section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Getting Set Up Is Quick & Easy</h2>
          <h3 className="desktop-h6 text-center">The fastest way to show what you do and win the job.</h3>
        </div>

        <div className="steps-stack">
          {/* Step 1 */}
          <div className="step-section">
            <div className="step-badge">Step 1</div>
            <div className="step-card">
              <div className="step-media">
                <img src={EditProfile} alt="Create your profile" />
              </div>
              <div className="step-text">
                <h3 className="desktop-h5">Craft A Branded Profile Clients Trust</h3>

                <div className="step-bullets">
                  <div className="section-list">
                    <div className="icon-white">
                      <img src={BoltIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Sign up &amp; go live</p>
                      <p className="desktop-body-xs">Launch your profile in under 5 minutes.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={CustomizationIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Make it yours</p>
                      <p className="desktop-body-xs">Add a logo, photo, colours and layout.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={FormCustomizationIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Simple editor</p>
                      <p className="desktop-body-xs">Fill in easy fields — no coding needed.</p>
                    </div>
                  </div>
                </div>

                <div className="step-cta">
                  <p className="desktop-body-xs light-black step-note">No credit card required*</p>
                  <Link to="/register" className="cta-blue-button desktop-button">Start Your 14 Day Free Trial</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 (reversed) */}
          <div className="step-section">
            <div className="step-badge">Step 2</div>
            <div className="step-card reverse">
              <div className="step-media">
                <img src={Section1Image} alt="Order your NFC card" />
              </div>
              <div className="step-text">
                <h3 className="desktop-h5">Order Your Tap-To-Share Card Today</h3>

                <div className="step-bullets">
                  <div className="section-list">
                    <div className="icon-white">
                      <img src={BoltIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Pick your NFC card</p>
                      <p className="desktop-body-xs">Choose a design that fits your brand.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={CustomizationIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">We print &amp; ship</p>
                      <p className="desktop-body-xs">Fast turnaround, quality finish.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={FormCustomizationIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Link to your profile</p>
                      <p className="desktop-body-xs">Your card opens your live page.</p>
                    </div>
                  </div>
                </div>

                <div className="step-cta">
                  <p className="desktop-body-xs light-black step-note">No credit card required*</p>
                  <Link to="/register" className="cta-blue-button desktop-button">Start Your 14 Day Free Trial</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-section">
            <div className="step-badge">Step 3</div>
            <div className="step-card">
              <div className="step-media">
                <img src={WhyYouNeedThis} alt="Share your page" />
              </div>
              <div className="step-text">
                <h3 className="desktop-h5">Share In Seconds And Win More Jobs</h3>

                <div className="step-bullets">
                  <div className="section-list">
                    <div className="icon-white">
                      <img src={BoltIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Tap or scan to share</p>
                      <p className="desktop-body-xs">Open your profile with NFC or QR.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={CustomizationIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Send your link anywhere</p>
                      <p className="desktop-body-xs">Messages, socials, email — easy.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={FormCustomizationIcon} className="icon" alt="" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Win more work</p>
                      <p className="desktop-body-xs">Stand out and get hired faster.</p>
                    </div>
                  </div>
                </div>

                <div className="step-cta">
                  <p className="desktop-body-xs light-black step-note">No credit card required*</p>
                  <Link to="/register" className="cta-blue-button desktop-button">Start Your 14 Day Free Trial</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- HOW TO SHARE --- */}
      <div className="section share-section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">One Profile. Shared in Seconds.</h2>
        </div>

        <div className="share-grid">
          <div className="share-card">
            <div className="share-card-media">
              <img src={NFCBusinessCard} alt="NFC business card being tapped to share" />
            </div>
            <h4 className="desktop-h6">NFC Business Card</h4>
            <p className="desktop-body-xs">Tap to Instantly Share Details</p>
          </div>

          <div className="share-card">
            <div className="share-card-media">
              <img src={ScanQRCode} alt="Scanning a QR code to open profile" />
            </div>
            <h4 className="desktop-h6">Scan QR Code</h4>
            <p className="desktop-body-xs">Scan the QR Code To Open Your Profile</p>
          </div>

          <div className="share-card">
            <div className="share-card-media">
              <img src={SMSSend} alt="Sharing your link via message" />
            </div>
            <h4 className="desktop-h6">Share via Message</h4>
            <p className="desktop-body-xs">WhatsApp, SMS, Messenger &amp; More</p>
          </div>

          <div className="share-card">
            <div className="share-card-media">
              <img src={LinkInBio} alt="Profile link placed in social bio" />
            </div>
            <h4 className="desktop-h6">Link In Bio</h4>
            <p className="desktop-body-xs">One link which you can share via any platform</p>
          </div>
        </div>
      </div>

      {/* --- PRICING (redesigned) --- */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Our Plans & Cards</h2>
          <h3 className="desktop-h6 text-center">Choose what's right for your business.</h3>
        </div>

        <div className="pricing-grid">
          {/* Subscription card (blue) */}
          <div className="pricing-card pricing-card--subscription">
            <div className="pricing-inner">
              <div className="pricing-head">
                <div>
                  <h3 className="desktop-h5">Power Profile</h3>
                  <p className='desktop-body-xs'>Win more work with a power profile</p>
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
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              {/* Sticky bottom area: quote + CTA */}
              <div className="pricing-bottom">

                <Link
                  to="/productandplan/konarsubscription"
                  className="cta-blue-button desktop-button"
                  style={{ marginTop: 10, width: '100%' }}
                >
                  Start Your 14 Day Free Trial
                </Link>
              </div>
            </div>
          </div>

          {/* Physical card (black) */}
          <div className="pricing-card pricing-card--product">
            <div className="pricing-inner">
              <div className="pricing-head">
                <div>
                  <h3 className="desktop-h5">Konar Card - White Edition</h3>
                  <p className='desktop-body-xs'>Tap to share your profile instantly.</p>
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

              {/* Sticky bottom area: quote + CTA */}
              <div className="pricing-bottom">

                <Link
                  to="/productandplan/konarcard"
                  className="cta-black-button desktop-button"
                  style={{ marginTop: 10, width: '100%' }}
                >
                  View Card Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- People showcase --- */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Tradesmen Use It. Clients Love It.</h2>
          <h3 className="desktop-h6 text-center">
            Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
          </h3>
        </div>

        <div className="people-showcase-container-flex">
          <div className="people-showcase-left-col">
            <img src={People} className="people-showcase-img" alt="Tradesman holding Konar Card" />
          </div>

          <div className="people-showcase-right-col">
            <div className="people-showcase-top-row-flex">
              <div className="people-showcase-box">
                <img src={People} className="people-showcase-img" alt="Tradesman showing Konar Card" />
              </div>
              <div className="people-showcase-box">
                <img src={People} className="people-showcase-img" alt="Woman holding Konar Card" />
              </div>
            </div>

            <div className="people-showcase-bottom-single">
              <img src={People} className="people-showcase-img" alt="Group of tradesmen holding Konar Cards" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Reviews --- */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h2 text-center">The #1 Tool Tradies Are Talking About</h2>
          <h3 className="desktop-h6 text-center">
            Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
          </h3>
        </div>
        <div className="review-container-box">
          <div className="review-container">
            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Since using KonarCard I’m actually getting replies. Clients say it looks slick and I’m getting referrals.”
                </p>
                <div className="review-div-person">
                  <img src={pp1} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Plumber</p>
                    <p className="desktop-body-s">Mark B</p>
                  </div>
                </div>
              </div>

              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Saved me a fortune on printing. I tap the card and customers have everything in seconds.”
                </p>
                <div className="review-div-person">
                  <img src={pp2} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Electrician</p>
                    <p className="desktop-body-s">Jake C</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Gives me a proper online presence without a pricey website. Photos and reviews do the selling.”
                </p>
                <div className="review-div-person">
                  <img src={pp3} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Builder</p>
                    <p className="desktop-body-s">Tom G</p>
                  </div>
                </div>
              </div>

              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “I update prices and services on my phone. No reprinting, no fuss — just more enquiries.”
                </p>
                <div className="review-div-person">
                  <img src={pp4} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: '#333' }}>Roofer</p>
                    <p className="desktop-body-s">Sam H</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="faq-cta">
          <Link to="/reviews" className="black-button desktop-button">Read More Reviews</Link>
        </div>
      </div>

      {/* --- FAQ --- */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Frequently Asked Questions</h2>
          <h3 className="desktop-h6 text-center">For any other questions feel free to contact us at any time</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white">
                <img src={IDCardIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">What is a Konar digital profile?</p>
                <p className="desktop-body-s">It’s your own landing page showing your trade, services, photos, and contact details — all online.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white">
                <img src={NFCIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Do I need an NFC card to use it?</p>
                <p className="desktop-body-s">No. You can use and share your digital profile without ever buying a physical card.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white">
                <img src={PhoneIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">How do people view my profile?</p>
                <p className="desktop-body-s">Share via link, QR code, or NFC tap — works instantly on most phones.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white">
                <img src={SetupIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">How do I set up my page?</p>
                <p className="desktop-body-s">Just fill in your trade, upload photos, list services — done in under five minutes.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white">
                <img src={PencilIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I update my page anytime?</p>
                <p className="desktop-body-s">Yes. Log in from any device to update info, images, services, or pricing instantly.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className="icon-white">
                <img src={WalletIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">What does it cost to use?</p>
                <p className="desktop-body-s">We offer a free plan. Premium features unlock with our £5.95/month Power Profile subscription.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white">
                <img src={BoxIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">What happens if I lose my NFC card?</p>
                <p className="desktop-body-s">Your page still works without the card. You can always reorder one if you want to keep tapping.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white">
                <img src={HatIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Who is this for exactly?</p>
                <p className="desktop-body-s">Any tradesperson who wants to get noticed, win more work, and look professional online.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white">
                <img src={PalletteIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I customise the design and layout?</p>
                <p className="desktop-body-s">Yes. Pick fonts, colours, and layouts to match your brand and make it yours.</p>
              </div>
            </div>
            <div className="section-list">
              <div className="icon-white">
                <img src={LockIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Is my personal data safe on here?</p>
                <p className="desktop-body-s">Absolutely. You control everything shown, and your data is hosted securely at all times.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="faq-cta">
          <Link to="/faq" className="black-button desktop-button">Got more questions?</Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
