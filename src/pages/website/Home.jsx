// frontend/src/pages/Home/index.jsx
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Sections */
import Hero from "../../components/Home/Hero";
import Comparison from "../../components/Home/Comparison";
import HowItWorks from "../../components/Home/HowItWorks";
import CustomerTrust from "../../components/Home/CustomerTrust";
import Products from "../../components/Home/Products";
import Examples from "../../components/Home/Examples";
import Share from "../../components/Home/Share";
import Value from "../../components/Home/Value";
import Pricing from "../../components/Home/Pricing";
import Review from "../../components/Home/Review";

/* Existing assets (unchanged) */
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

      {/* ✅ SHARE (moved into component) */}
      <Share
        nfcImage={NFCBusinessCard}
        qrImage={ScanQRCode}
        smsImage={SMSSend}
        linkImage={LinkInBio}
      />

      {/* 7) VALUE */}
      <Value />

      {/* 8) PRICING */}
      <Pricing />

      {/* 9) REVIEW (last section) */}
      {/* <Review /> */}

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
