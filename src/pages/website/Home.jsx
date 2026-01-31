// frontend/src/pages/Home/index.jsx
import React, { useState, useEffect, useRef } from "react";
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
import Value from "../../components/Home/Value";
import Pricing from "../../components/Home/Pricing";
import Review from "../../components/Home/Review";

/* Existing assets (unchanged) */
import StepSection1 from "../../assets/images/Step-Section-1.jpg";
import EditProfile from "../../assets/images/Edit-Profile.jpg";
import WhyYouNeedThis from "../../assets/images/WhyYouNeedThis.png";

import NFCBusinessCard from "../../assets/images/NFC-Business-Card.jpg";
import ScanQRCode from "../../assets/images/ScanQR-Code.jpg";
import LinkInBio from "../../assets/images/LinkInBio.jpg";
import SMSSend from "../../assets/images/SMSSend.jpg";

/* Global typography */
import "../../styling/fonts.css";
/* If your original Home page relied on home.css, keep it imported here */
// import "../../styling/home.css";

export default function Home() {
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

      {/* 5) PRODUCTS */}
      <Products />

      {/* 6) EXAMPLES */}
      <Examples />

      {/* 7) VALUE */}
      <Value />

      {/* 8) PRICING */}
      <Pricing />

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

      {/* 9) REVIEW (last section) */}
      <Review />

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
