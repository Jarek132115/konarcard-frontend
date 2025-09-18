import React, { useContext, useState, useEffect } from 'react';
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
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg';
import LinkIcon from '../../assets/icons/Link-Icon.svg';
import TapIcon from '../../assets/icons/Tap-Icon.svg';
import MoneyIcon from '../../assets/icons/Money-Icon.svg';
import ShareIcon from '../../assets/icons/Share-Icon.svg';
import NFCBusinessCard from '../../assets/images/NFC-Business-Card.jpg';
import ScanQRCode from '../../assets/images/ScanQR-Code.jpg';
import LinkInBio from '../../assets/images/LinkInBio.jpg';
import SMSSend from '../../assets/images/SMSSend.jpg';
import QRCode from '../../assets/icons/QR-Code-Icon.svg';
import ProfileIcon from '../../assets/icons/Profile-Icon.svg';
import TimeIcon from '../../assets/icons/Time-Icon.svg';
import ShieldIcon from '../../assets/icons/Shield-Icon.svg';

import pp1 from '../../assets/images/pp1.png';
import pp2 from '../../assets/images/pp2.png';
import pp3 from '../../assets/images/pp3.png';
import pp4 from '../../assets/images/pp4.png';

import ProductCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';

import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isSubscribed = user ? user.isSubscribed : false;

  // gallery state (kept for future use even if not shown here)
  const [cardMainImage, setCardMainImage] = useState(ProductCover);
  const cardThumbs = [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4];

  // video modal
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    // lock scroll when modal is open
    if (isVideoOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => {
        if (e.key === 'Escape') setIsVideoOpen(false);
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [isVideoOpen]);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname, checkoutType: 'subscription' } });
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

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="home-hero">
        <div className="hero-container">
          <div className="hero-left">
            <div style={{ width: 'fit-content' }} className="step-badge hero-badge">
              14 Day <span style={{ fontWeight: 600 }}>Free Trial</span> Now Available
            </div>

            <h1 className="desktop-h1 hero-heading">
              Your Business Card. <span className="blue hero-glow">Supercharged</span> to Win More Jobs.
            </h1>

            <p className="desktop-h6 desktop-body">
              One tap opens your full profile—photos, services, reviews—and saves your details to their phone. No app. Just jobs.
            </p>

            <div className="hero-cta">
              <Link to="/register" className="cta-blue-button desktop-button">
                Start Your Free Trial
              </Link>

              {/* NEW: Watch video button toggles modal */}
              <button
                type="button"
                className="cta-black-button desktop-button hero-watch-btn"
                onClick={() => setIsVideoOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isVideoOpen}
                aria-controls="how-it-works-modal"
              >
                Watch How It Works
              </button>
            </div>

            <div className="hero-social-proof">
              <div className="hero-avatars">
                <img src={pp1} alt="User 1" className="avatar" />
                <img src={pp2} alt="User 2" className="avatar" />
                <img src={pp3} alt="User 3" className="avatar" />
              </div>
              <div className="avatar-text">
                <p style={{ fontWeight: 900 }} className="desktop-h6">
                  1k+
                </p>
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
              aria-hidden="true"
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
          <h2 className="desktop-h3 text-center">
            Get Set Up in <span className='blue'>3 Quick</span> <span className='blue'>& Easy</span> Steps
          </h2>
          <h3 className="desktop-h6 text-center">From sign-up to booked jobs—in minutes.</h3>
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
                <h3 className="desktop-h5">Sign Up & Build Your Profile</h3>

                <div className="step-bullets">
                  <div className="section-list">
                    <div className="icon-white">
                      <img src={BoltIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Go live in minutes</p>
                      <p className="desktop-body-xs gray">Create your account, pick a layout, publish.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={CustomizationIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Make it yours</p>
                      <p className="desktop-body-xs gray">Add logo, photos, brand colours, and services.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={FormCustomizationIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Enable “Save My Number”</p>
                      <p className="desktop-body-xs gray">One tap and your details are in their phone.</p>
                    </div>
                  </div>
                </div>

                <div className="step-cta">
                  <p style={{ fontStyle: 'italic' }} className="desktop-body-xs gray step-note">
                    No credit card required*
                  </p>
                  <Link to="/register" className="cta-blue-button desktop-button">
                    Start Your 14-Day Free Trial
                  </Link>
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
                <h3 className="desktop-h5">Order Your Own Konar Card</h3>

                <div className="step-bullets">
                  <div className="section-list">
                    <div className="icon-white">
                      <img src={NFCIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">One card, unlimited shares</p>
                      <p className="desktop-body-xs gray">NFC card linked to your live profile.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={DeliveryIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Printed & shipped fast</p>
                      <p className="desktop-body-xs gray">Fast turnaround. Premium finish.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={LinkIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Always up to date</p>
                      <p className="desktop-body-xs gray">Change your profile anytime; the card stays current.</p>
                    </div>
                  </div>
                </div>

                <div className="step-cta">
                  <p style={{ fontStyle: 'italic' }} className="desktop-body-xs gray step-note">
                    No credit card required*
                  </p>
                  <Link to="/register" className="cta-blue-button desktop-button">
                    Start Your 14-Day Free Trial
                  </Link>
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
                <h3 className="desktop-h5">Share Everywhere & Win More Work</h3>

                <div className="step-bullets">
                  <div className="section-list">
                    <div className="icon-white">
                      <img src={TapIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Tap or scan</p>
                      <p className="desktop-body-xs gray">NFC + QR open your profile instantly.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={ShareIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Send your link</p>
                      <p className="desktop-body-xs gray">Text, WhatsApp, socials, email, or add to your bio.</p>
                    </div>
                  </div>

                  <div className="section-list">
                    <div className="icon-white">
                      <img src={MoneyIcon} className="icon icon-img" alt="Icon" />
                    </div>
                    <div className="section-list-info">
                      <p className="desktop-h6">Get booked faster</p>
                      <p className="desktop-body-xs gray">Show photos, services, and reviews; clients save your number in one click.</p>
                    </div>
                  </div>
                </div>

                <div className="step-cta">
                  <p style={{ fontStyle: 'italic' }} className="desktop-body-xs gray step-note">
                    No credit card required*
                  </p>
                  <Link to="/register" className="cta-blue-button desktop-button">
                    Start Your 14-Day Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ---------- HOW TO SHARE (new section after steps) ---------- */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">One Profile. <span className='blue'>Shared</span> Every Way.</h2>
          <h3 className="desktop-h6 text-center">Four simple ways to get your details in front of clients.</h3>
        </div>

        <div className="share-grid">
          <div className="share-card">
            <div className="share-card-media">
              <img src={NFCBusinessCard} alt="NFC business card being tapped to share details" />
            </div>
            <h4 className="desktop-h6">NFC Business Card</h4>
            <p className="desktop-body-xs">Tap to Instantly Share Details With Anyone</p>
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
              <img src={SMSSend} alt="Sharing your link via message apps" />
            </div>
            <h4 className="desktop-h6">Share via Message</h4>
            <p className="desktop-body-xs">WhatsApp, SMS, Messenger &amp; More</p>
          </div>

          <div className="share-card">
            <div className="share-card-media">
              <img src={LinkInBio} alt="Link in bio on social profile" />
            </div>
            <h4 className="desktop-h6">Link In Bio</h4>
            <p className="desktop-body-xs">Add to Instagram, Facebook, TikTok, or your website.</p>
          </div>
        </div>
      </div>

      {/* --- PRICING (redesigned) --- */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">One <span className='blue'>Plan</span>. One <span className='blue'>Card</span>. Endless <span className='blue'>Opportunities</span>.</h2>
          <h3 className="desktop-h6 text-center">Start your Power Profile free for 14 days. Add the Konar Card when you’re ready.</h3>
        </div>

        <div className="pricing-grid">
          {/* Subscription card (blue) */}
          <div className="pricing-card pricing-card--subscription">
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
                {[
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
                ].map((text, i) => (
                  <li className="pricing-feature" key={i}>
                    <img src={TickIcon} alt="" className="pricing-check invert-for-blue" />
                    <span className="white desktop-body-x">{text}</span>
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
          {/* Physical card (black) */}
          <div className="pricing-card pricing-card--product">
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

              {/* === GALLERY WITH THUMBNAILS === */}
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
              {/* === END GALLERY === */}

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

      {/* People, Reviews, FAQ */}
      {/* People, Reviews, FAQ */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Tradies Are Making the <span className="blue">Switch.</span></h2>
          <h3 className="desktop-h6 text-center">See how Konar is used every day by real tradespeople.</h3>
        </div>

        {/* NEW: 4-image grid (1-2-1 on <1000px) */}
        <div className="people-grid">
          {/* Row 1 (mobile: spans 2 columns) */}
          <div className="pg-item span-2">
            <img src={People} alt="Tradies using Konar on the job site" />
          </div>

          {/* Row 2 (two side-by-side) */}
          <div className="pg-item">
            <img src={People} alt="Konar card being shared with a client" />
          </div>
          <div className="pg-item">
            <img src={People} alt="Tradie showing Konar card close-up" />
          </div>

          {/* Row 3 (mobile: spans 2 columns) */}
          <div className="pg-item span-2">
            <img src={People} alt="Team on site showing Konar cards" />
          </div>
        </div>
      </div>


      {/* Reviews */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">The <span className='blue'>#1 Tool</span> Tradies Are Talking About</h2>
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

      {/* FAQ */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Frequently <span className='blue'>Asked</span> Questions</h2>
          <h3 className="desktop-h6 text-center">For any other questions, feel free to reach out.</h3>
        </div>
        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white"><img src={IDCardIcon} className="icon" alt='icon' /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What is the Konar NFC business card?</p>
                <p className="desktop-body-xs">A reusable card with an NFC chip that opens your Konar profile with a tap—no app, no battery, no fuss.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white"><img src={NFCIcon} className="icon" alt='icon' /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does the tap actually work?</p>
                <p className="desktop-body-xs">The phone’s NFC reader powers the chip and instantly launches your live profile link.</p>
              </div>
            </div >
            <div className="section-list">
              <div className=" icon-white"><img src={QRCode} className="icon" alt='icon' /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What if someone can’t tap?</p>
                <p className="desktop-body-xs">Every card also has a QR code and a shareable link—so there’s always a backup.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white"><img src={ProfileIcon} className="icon" alt='icon' /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What can my profile include?</p>
                <p className="desktop-body-xs">Your name, job title, bio, photos, services with pricing, reviews, and contact details.</p>
              </div>
            </div>
          </div>
          <div className="faq-column">
            <div className="section-list">
              <div className=" icon-white"><img src={PencilIcon} className="icon" alt='icon' /></div>
              <div className="section-list-info">
                <p className="desktop-h6">Can I edit my page later?</p>
                <p className="desktop-body-xs">Yes. Update info, images, services, or layout anytime—changes go live instantly.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white"><img src={BoltIcon} className="icon" alt='icon' /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How do I share my page?</p>
                <p className="desktop-body-xs">Tap your card, show the QR code, or copy your unique link to send anywhere.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white"><img src={TimeIcon} className="icon" alt='icon' /></div>
              <div className="section-list-info">
                <p className="desktop-h6">How does the free trial work?</p>
                <p className="desktop-body-xs">The free trial includes the same features as the subscription. If it ends and you don’t subscribe, your page will no longer show.</p>
              </div>
            </div>
            <div className="section-list">
              <div className=" icon-white"><img src={ShieldIcon} className="icon" alt='icon' /></div>
              <div className="section-list-info">
                <p className="desktop-h6">What happens if I cancel?</p>
                <p className="desktop-body-xs">You’ll keep access until the end of the billing period. After that, your page won’t show until you subscribe again.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="faq-cta">
          <Link to="/faq" className="black-button desktop-button">Read More Q&A</Link>
        </div>
      </div>

      <Footer />

      {/* =========================
          HOW IT WORKS - MODAL
          (no video wired yet; just drop your src later)
         ========================= */}
      {isVideoOpen && (
        <div
          id="how-it-works-modal"
          className="video-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="How it works video"
          onClick={(e) => {
            if (e.target.classList.contains('video-modal-overlay')) setIsVideoOpen(false);
          }}
        >
          <div className="video-modal" role="document">
            <button
              className="video-close"
              aria-label="Close video"
              onClick={() => setIsVideoOpen(false)}
              autoFocus
            >
              ✕
            </button>

            {/* 16:9 responsive frame; replace the placeholder with your video later */}
            <div className="video-frame">
              {/* EXAMPLE to add later:
                  <video controls playsInline>
                    <source src="/videos/how-it-works.mp4" type="video/mp4" />
                  </video>
                 or an iframe embed
              */}
              <div className="video-placeholder">
                <p className="desktop-body-s">Video coming soon</p>
              </div>
            </div>

            <p className="video-caption desktop-body-xs">
              Learn how Konar Card helps you share your profile in seconds.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
