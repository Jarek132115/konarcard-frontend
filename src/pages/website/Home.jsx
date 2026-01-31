// frontend/src/pages/Home/index.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* ✅ NEW: Hero as its own component */
import Hero from "../../components/Home/Hero";

/* Existing assets (unchanged) */
import Section1Image from "../../assets/images/Section-1-Image.png";
import StepSection1 from "../../assets/images/Step-Section-1.jpg";
import StepSection2 from "../../assets/images/Step-Section-2.jpg";

import EditProfile from "../../assets/images/Edit-Profile.jpg";
import WhyYouNeedThis from "../../assets/images/WhyYouNeedThis.png";
import People from "../../assets/images/People.png";

import ReviewStars from "../../assets/icons/Stars-Icon.svg";

import NFCBusinessCard from "../../assets/images/NFC-Business-Card.jpg";
import ScanQRCode from "../../assets/images/ScanQR-Code.jpg";
import LinkInBio from "../../assets/images/LinkInBio.jpg";
import SMSSend from "../../assets/images/SMSSend.jpg";

import pp1 from "../../assets/images/pp1.png";
import pp2 from "../../assets/images/pp2.png";
import pp3 from "../../assets/images/pp3.png";
import pp4 from "../../assets/images/pp4.png";

import ProductCover from "../../assets/images/Product-Cover.png";
import ProductImage1 from "../../assets/images/Product-Image-1.png";
import ProductImage2 from "../../assets/images/Product-Image-2.png";
import ProductImage3 from "../../assets/images/Product-Image-3.png";
import ProductImage4 from "../../assets/images/Product-Image-4.png";

/* Keep your existing home styling (where all the other sections live) */
import "../../styling/fonts.css";
/* If your original Home page relied on a home.css, keep it imported here.
   (If you already import it elsewhere, keep it consistent with your project.) */
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

      {/* ✅ HERO (now includes the Real Profiles carousel inside it) */}
      <Hero />

      {/* 3 STEPS */}
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

      {/* REAL WORLD USE CASES */}
      <div className="section realworld-section">
        <div className="realworld-header">
          <h2 className="desktop-h3 text-center">
            How You’ll Use It <span className="orange">In The Real World</span>
          </h2>
          <h3 className="desktop-body-xs text-center">
            No more typing your number, digging for photos, or swapping paper. It’s almost 2026 — time for a change.
          </h3>
        </div>

        <div className="realworld-comparison">
          <div className="comparison-box">
            <span className="comparison-badge old">The old way</span>
            <ul className="dot-list">
              <li>
                <span className="blue-dot bullet-dot" aria-hidden="true" />
                <span className="desktop-body-xs">Type your phone &amp; email into their phone</span>
              </li>
              <li>
                <span className="blue-dot bullet-dot" aria-hidden="true" />
                <span className="desktop-body-xs">Scroll your camera roll for examples</span>
              </li>
              <li>
                <span className="blue-dot bullet-dot" aria-hidden="true" />
                <span className="desktop-body-xs">Hope they don’t lose your details</span>
              </li>
            </ul>
          </div>

          <div className="comparison-box">
            <span className="comparison-badge new">The Konar way</span>
            <ul className="dot-list">
              <li>
                <span className="blue-dot bullet-dot" aria-hidden="true" />
                <span className="desktop-body-xs">Tap once — they get your full profile</span>
              </li>
              <li>
                <span className="blue-dot bullet-dot" aria-hidden="true" />
                <span className="desktop-body-xs">Photos, services, reviews, and contact — saved</span>
              </li>
              <li>
                <span className="blue-dot bullet-dot" aria-hidden="true" />
                <span className="desktop-body-xs">Follow-ups are faster and more professional</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="realworld-grid">
          <div className="realworld-card">
            <div className="realworld-card-icon">👷</div>
            <div className="realworld-card-text">
              <h4 className="desktop-body-s">On Site, With a Client</h4>
              <p className="equal desktop-body-xs">
                Tap your KonarCard. Their phone opens your profile and saves your details instantly.
              </p>
            </div>
          </div>

          <div className="realworld-card">
            <div className="realworld-card-icon">📄</div>
            <div className="realworld-card-text">
              <h4 className="desktop-body-s">After a Quote</h4>
              <p className="equal desktop-body-xs">
                Send the link in messages so they can revisit your services and reviews while deciding.
              </p>
            </div>
          </div>

          <div className="realworld-card">
            <div className="realworld-card-icon">🤝</div>
            <div className="realworld-card-text">
              <h4 className="desktop-body-s">Networking / Trade Counter</h4>
              <p className="equal desktop-body-xs">No stacks of cards. One tap per person, unlimited times.</p>
            </div>
          </div>

          <div className="realworld-card">
            <div className="realworld-card-icon">🚐</div>
            <div className="realworld-card-text">
              <h4 className="desktop-body-s">Van QR &amp; Site Board</h4>
              <p className="equal desktop-body-xs">Print your QR. Passers-by scan to view your work and save your number.</p>
            </div>
          </div>

          <div className="realworld-card">
            <div className="realworld-card-icon">📱</div>
            <div className="realworld-card-text">
              <h4 className="desktop-body-s">Social &amp; Link In Bio</h4>
              <p className="equal desktop-body-xs">
                Add your link to Instagram, Facebook, and TikTok to convert views into enquiries.
              </p>
            </div>
          </div>

          <div className="realworld-card">
            <div className="realworld-card-icon">⚡</div>
            <div className="realworld-card-text">
              <h4 className="desktop-body-s">Updates in Seconds</h4>
              <p className="equal desktop-body-xs">
                Change prices or photos once — your card shares the latest version everywhere.
              </p>
            </div>
          </div>
        </div>

        <div className="faq-cta">
          <Link to="/register" className="navy-button desktop-button">
            Get Your KonarCard
          </Link>
        </div>
      </div>

      {/* WHY KONARCARD VS PAPER */}
      <div className="section why-vs-paper">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">
            Stop <span className="orange">Wasting Money</span> on Paper Business Cards
          </h2>
        </div>

        <div className="why-vs-grid">
          <div className="vs-media" aria-hidden="true">
            <div className="vs-split">
              <div className="vs-pane vs-left" role="img" aria-label="Pile of paper business cards"></div>

              <div className="vs-pane vs-right">
                <img src={NFCBusinessCard} alt="KonarCard — tap to share instantly" loading="lazy" />
              </div>

              <div className="vs-badge" aria-hidden="true">
                VS
              </div>
            </div>
          </div>

          <div className="vs-copy">
            <ul className="vs-bullets">
              <li>
                <span className="vs-ico vs-neg" aria-hidden="true">
                  ✖
                </span>
                <div>
                  <p className="desktop-body-s">
                    <strong>Paper cards get lost or binned.</strong>
                  </p>
                  <p className="desktop-body-xs gray">Most never make it into contacts.</p>
                </div>
              </li>

              <li>
                <span className="vs-ico vs-neg" aria-hidden="true">
                  ✖
                </span>
                <div>
                  <p className="desktop-body-s">
                    <strong>Updating details means reprinting.</strong>
                  </p>
                  <p className="desktop-body-xs gray">Wasted time and ongoing costs.</p>
                </div>
              </li>

              <li>
                <span className="vs-ico vs-pos" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <p className="desktop-body-s">
                    <strong>KonarCard is eco-friendly &amp; always up-to-date.</strong>
                  </p>
                  <p className="desktop-body-xs gray">One tap, share forever — no app needed.</p>
                </div>
              </li>
            </ul>

            <div className="vs-cta">
              <Link to="/register" className="navy-button desktop-button">
                Make the Switch
              </Link>
            </div>
          </div>
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

      {/* PEOPLE */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">
            Tradies Are Making the <span className="orange">Switch.</span>
          </h2>
          <h3 className="desktop-body-xs text-center">See how Konar is used every day by real tradespeople.</h3>
        </div>

        <div className="people-grid">
          <div className="pg-item span-2">
            <img src={People} alt="Tradies using Konar on the job site" />
          </div>
          <div className="pg-item">
            <img src={People} alt="Konar card being shared with a client" />
          </div>
          <div className="pg-item">
            <img src={People} alt="Tradie showing Konar card close-up" />
          </div>
          <div className="pg-item span-2">
            <img src={People} alt="Team on site showing Konar cards" />
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">
            The <span className="orange">#1 Tool</span> Tradies Are Talking About
          </h2>
          <h3 className="desktop-body-xs text center">
            Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
          </h3>
        </div>

        <div className="review-container-box">
          <div className="review-container">
            <div className="review-pair">
              <div className="review-div">
                <img className="stars" src={ReviewStars} alt="5 star rating" />
                <p className="desktop-body-s text-center">
                  “Since using KonarCard I’m actually getting replies. Clients say it looks slick and I’m getting
                  referrals.”
                </p>
                <div className="review-div-person">
                  <img src={pp1} alt="Reviewer" />
                  <div className="review-person-name">
                    <p className="desktop-body-xs" style={{ color: "#333" }}>
                      Plumber
                    </p>
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
                    <p className="desktop-body-xs" style={{ color: "#333" }}>
                      Electrician
                    </p>
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
                    <p className="desktop-body-xs" style={{ color: "#333" }}>
                      Builder
                    </p>
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
                    <p className="desktop-body-xs" style={{ color: "#333" }}>
                      Roofer
                    </p>
                    <p className="desktop-body-s">Sam H</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="faq-cta">
          <Link to="/reviews" className="navy-button desktop-button">
            Read More Reviews
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">
            Frequently <span className="orange">Asked</span> Questions
          </h2>
          <h3 className="desktop-body-xs text-center">For any other questions, feel free to reach out.</h3>
        </div>

        <div className="faq-container">
          <div className="faq-column">
            <div className="section-list">
              <span className="blue-dot" aria-hidden="true"></span>
              <div className="section-list-info">
                <p className="desktop-h6">What is the Konar NFC business card?</p>
                <p className="desktop-body-xs">
                  A reusable card with an NFC chip that opens your Konar profile with a tap—no app, no battery, no fuss.
                </p>
              </div>
            </div>

            <div className="section-list">
              <span className="blue-dot" aria-hidden="true"></span>
              <div className="section-list-info">
                <p className="desktop-h6">How does the tap actually work?</p>
                <p className="desktop-body-xs">
                  The phone’s NFC reader powers the chip and instantly launches your live profile link.
                </p>
              </div>
            </div>

            <div className="section-list">
              <span className="blue-dot" aria-hidden="true"></span>
              <div className="section-list-info">
                <p className="desktop-h6">What if someone can’t tap?</p>
                <p className="desktop-body-xs">
                  Every card also has a QR code and a shareable link—so there’s always a backup.
                </p>
              </div>
            </div>

            <div className="section-list">
              <span className="blue-dot" aria-hidden="true"></span>
              <div className="section-list-info">
                <p className="desktop-h6">What can my profile include?</p>
                <p className="desktop-body-xs">
                  Your name, job title, bio, photos, services with pricing, reviews, and contact details.
                </p>
              </div>
            </div>
          </div>

          <div className="faq-column">
            <div className="section-list">
              <span className="blue-dot" aria-hidden="true"></span>
              <div className="section-list-info">
                <p className="desktop-h6">Can I edit my page later?</p>
                <p className="desktop-body-xs">
                  Yes. Update info, images, services, or layout anytime—changes go live instantly.
                </p>
              </div>
            </div>

            <div className="section-list">
              <span className="blue-dot" aria-hidden="true"></span>
              <div className="section-list-info">
                <p className="desktop-h6">How do I share my page?</p>
                <p className="desktop-body-xs">
                  Tap your card, show the QR code, or copy your unique link to send anywhere.
                </p>
              </div>
            </div>

            <div className="section-list">
              <span className="blue-dot" aria-hidden="true"></span>
              <div className="section-list-info">
                <p className="desktop-h6">How does the free trial work?</p>
                <p className="desktop-body-xs">
                  The free trial includes the same features as the subscription. If it ends and you don’t subscribe, your
                  page will no longer show.
                </p>
              </div>
            </div>

            <div className="section-list">
              <span className="blue-dot" aria-hidden="true"></span>
              <div className="section-list-info">
                <p className="desktop-h6">What happens if I cancel?</p>
                <p className="desktop-body-xs">
                  You’ll keep access until the end of the billing period. After that, your page won’t show until you
                  subscribe again.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="faq-cta">
          <Link to="/faq" className="navy-button desktop-button">
            Read More Q&amp;A
          </Link>
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
