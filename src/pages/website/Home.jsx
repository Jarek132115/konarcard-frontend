// frontend/src/pages/Home/index.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Sections */
import Hero from "../../components/Home/Hero";
import Comparison from "../../components/Home/Comparison";
import HowItWorks from "../../components/Home/HowItWorks";
import CustomerTrust from "../../components/Home/CustomerTrust";
import Products from "../../components/Home/Products";
import Examples from "../../components/Home/Examples";

/* Existing assets (unchanged) */
import StepSection1 from "../../assets/images/Step-Section-1.jpg";
import EditProfile from "../../assets/images/Edit-Profile.jpg";
import WhyYouNeedThis from "../../assets/images/WhyYouNeedThis.png";

import NFCBusinessCard from "../../assets/images/NFC-Business-Card.jpg";
import ScanQRCode from "../../assets/images/ScanQR-Code.jpg";
import LinkInBio from "../../assets/images/LinkInBio.jpg";
import SMSSend from "../../assets/images/SMSSend.jpg";

import ProductCover from "../../assets/images/Product-Cover.png";
import ProductImage1 from "../../assets/images/Product-Image-1.png";
import ProductImage2 from "../../assets/images/Product-Image-2.png";
import ProductImage3 from "../../assets/images/Product-Image-3.png";
import ProductImage4 from "../../assets/images/Product-Image-4.png";

/* Global typography */
import "../../styling/fonts.css";
/* If your original Home page relied on home.css, keep it imported here */
// import "../../styling/home.css";

export default function Home() {
  // product gallery
  const [cardMainImage, setCardMainImage] = useState(ProductCover);
  const cardThumbs = [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4];

  // video modal
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isVideoOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => e.key === "Escape" && setIsVideoOpen(false);
    window.addEventListener("keydown", onKey);

    // auto-play when opened
    const v = videoRef.current;
    if (v) {
      try {
        v.currentTime = 0;
      } catch { }
      v.play().catch(() => { });
    }

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);

      // pause & reset on close
      const vv = videoRef.current;
      if (vv) {
        try {
          vv.pause();
          vv.currentTime = 0;
        } catch { }
      }
    };
  }, [isVideoOpen]);

  // subscription features
  const featureBlocks = useMemo(
    () => [
      { t: "Simple editor", s: "Get set up quickly — no tech skills required." },
      { t: "Show what you do", s: "Share your services and work in seconds." },
      { t: "Unlimited images", s: "Upload every project — no limits on galleries." },
      { t: "Unlimited services", s: "List each job you offer with clear pricing." },
      { t: "Unlimited reviews", s: "Build instant trust with social proof." },
      { t: "Custom branding", s: "Your logo, colours and layout — make it yours." },
      { t: "Share everywhere", s: "Link, QR code, and NFC tap for instant contacts." },
      { t: "Instant updates", s: "Edit once — changes go live across your profile." },
      { t: "No app needed", s: "Works on iPhone & Android, right in the browser." },
      { t: "Cancel anytime", s: "Stay flexible — no long contracts." },
    ],
    []
  );

  return (
    <>
      <Navbar />

      {/* 1) HERO */}
      <Hero />

      {/* 2) PAPER vs KONAR COMPARISON */}
      <Comparison />

      {/* 3) HOW IT WORKS */}
      <HowItWorks />

      {/* 4) CUSTOMER TRUST */}
      <CustomerTrust />

      <Products />

      <Examples />


      {/* 3 STEPS (existing section) */}
      <div className="section steps-v1">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">
            Get Set Up in <span className="orange">3 Quick</span> <span className="orange">&amp; Easy</span> Steps
          </h2>
          <h3 className="desktop-body-xs text-center">From sign-up to sharing — it only takes minutes.</h3>
        </div>

        <div className="steps-grid-3">
          <div className="step-tile">
            <div className="step-copy">
              <span className="step-pill">Step 1</span>
              <h3 className="desktop-h5">Create Your Profile</h3>
              <p className="desktop-body-s gray step-subtitle">
                Set up your profile in minutes by adding details, photos, and branding, then save so it’s always ready to
                share.
              </p>
            </div>
            <div className="step-media">
              <img src={EditProfile} alt="Create your profile" />
            </div>
          </div>

          <div className="step-tile">
            <div className="step-copy">
              <span className="step-pill">Step 2</span>
              <h3 className="desktop-h5">Order Your Konar Card</h3>
              <p className="desktop-body-s gray step-subtitle">
                Get your sleek NFC card to share unlimited times, delivered fast and always current with your updated
                profile.
              </p>
            </div>
            <div className="step-media">
              <img src={StepSection1} alt="Order your Konar card" />
            </div>
          </div>

          <div className="step-tile">
            <div className="step-copy">
              <span className="step-pill">Step 3</span>
              <h3 className="desktop-h5">Share &amp; Win More Work</h3>
              <p className="desktop-body-s gray step-subtitle">
                Tap or scan your card to instantly send details, making it easier for clients to save, get in touch, and
                book faster.
              </p>
            </div>
            <div className="step-media">
              <img src={WhyYouNeedThis} alt="Share your page" />
            </div>
          </div>
        </div>

        <div className="faq-cta">
          <button
            type="button"
            className="navy-button desktop-button"
            onClick={() => setIsVideoOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isVideoOpen}
            aria-controls="how-it-works-modal"
          >
            Watch How It Works
          </button>
        </div>
      </div>

      {/* HOW TO SHARE */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">
            One Profile. <span className="orange">Shared</span> Every Way.
          </h2>
          <h3 className="desktop-body-xs text-center">Four simple ways to get your details in front of clients.</h3>
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

      {/* PRICING */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">
            One <span className="orange">Plan</span>. One <span className="orange">Card</span>. Endless{" "}
            <span className="orange">Opportunities</span>.
          </h2>
          <h3 className="desktop-body-xs text-center">
            Start your Power Profile free for 14 days. Add the Konar Card when you’re ready.
          </h3>
        </div>

        <div className="pricing-grid nfc-pricing-page">
          <div
            className="pricing-card pricing-card--subscription nfc-pricing-subscription"
            style={{
              borderRadius: 16,
              boxShadow: "0px 0px 8px rgba(255, 107, 0, 0.3)",
            }}
          >
            <div className="pricing-inner">
              <div className="pricing-content">
                <div className="pricing-head">
                  <div>
                    <h3 className="desktop-h5">Konar Profile</h3>
                    <p className="desktop-body-xs">Win more work with a power profile</p>
                  </div>
                  <span className="pricing-badge pill-blue-solid">14-Day Free Trial</span>
                </div>

                <div className="pricing-divider" />

                <div className="pricing-price-row">
                  <span className="desktop-h1" style={{ paddingRight: 5 }}>
                    £4.95
                  </span>
                  <span className="desktop-button" style={{ padding: 0 }}>
                    /Month
                  </span>
                </div>

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
                <Link
                  to="/productandplan/konarsubscription"
                  className="orange-button desktop-button"
                  style={{ width: "100%" }}
                >
                  View Subscription Details
                </Link>
              </div>
            </div>
          </div>

          <div
            className="pricing-card pricing-card--product nfc-pricing-product"
            style={{
              borderRadius: 16,
              boxShadow: "0px 0px 8px rgba(30, 42, 56, 0.3)",
            }}
          >
            <div className="pricing-inner">
              <div className="pricing-content">
                <div className="pricing-head">
                  <div>
                    <h3 className="desktop-h5">Konar Card - White Edition</h3>
                    <p className="desktop-body-xs">Tap to share your profile instantly.</p>
                  </div>
                  <span className="pricing-badge pill-black">12 Month Warranty</span>
                </div>

                <div className="pricing-divider" />

                <div className="pricing-price-row">
                  <span className="desktop-h1">£24.95</span>
                </div>

                <div className="pricing-media-tray">
                  <div className="pricing-media-main">
                    <img src={cardMainImage} alt="Konar Card - White Edition" />
                  </div>

                  <div className="pricing-media-thumbs tight">
                    {cardThumbs.map((src, i) => (
                      <button
                        key={i}
                        className={`pricing-media-thumb ${cardMainImage === src ? "is-active" : ""}`}
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
                <Link to="/productandplan/konarcard" className="navy-button desktop-button" style={{ width: "100%" }}>
                  View Card Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* HOW IT WORKS - MODAL */}
      {isVideoOpen && (
        <div
          id="how-it-works-modal"
          className="video-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="How it works video"
          onClick={(e) => {
            if (e.target.classList.contains("video-modal-overlay")) setIsVideoOpen(false);
          }}
        >
          <div className="video-modal" role="document">
            <button className="video-close" aria-label="Close video" onClick={() => setIsVideoOpen(false)} autoFocus>
              ✕
            </button>

            <div className="video-frame">
              <video ref={videoRef} className="howitworks-video" controls playsInline preload="metadata">
                <source src="/videos/HowItWorks.mp4" type="video/mp4" />
                Sorry, your browser doesn’t support embedded videos.
              </video>
            </div>

            <p className="video-caption desktop-body-xs">Learn how Konar Card helps you share your profile in seconds.</p>
          </div>
        </div>
      )}
    </>
  );
}
