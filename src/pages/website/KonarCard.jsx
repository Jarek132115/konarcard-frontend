import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg';
import { toast } from 'react-hot-toast';

import pp1 from '../../assets/images/pp1.png';
import pp2 from '../../assets/images/pp2.png';
import pp3 from '../../assets/images/pp3.png';
import pp4 from '../../assets/images/pp4.png';

import ProductCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';

import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import HowItWorks1 from '../../assets/images/HowItWorks-1.png';
import HowItWorks2 from '../../assets/images/HowItWorks-2.png';
import HowItWorks3 from '../../assets/images/HowItWorks-3.png';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg';
import WarrantyIcon from '../../assets/icons/Warranty-Icon.svg';
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg';
import SetupIcon from '../../assets/icons/Setup-Icon.svg';
import BoxIcon from '../../assets/icons/Box-Icon.svg';
import HatIcon from '../../assets/icons/Hat-Icon.svg';
import LockIcon from '../../assets/icons/Lock-Icon.svg';
import PencilIcon from '../../assets/icons/Pencil-Icon.svg';
import PhoneIcon from '../../assets/icons/Phone-Icon.svg';
import WalletIcon from '../../assets/icons/Wallet-Icon.svg';

const stripePromise = loadStripe('pk_live_51RPmTAP7pC1ilLXASjenuib1XpQAiuBOxcUuYbeQ35GbhZEVi3V6DRwriLetAcHc3biiZ6dlfzz1fdvHj2wvj1hS00lHDjoAu8');

export default function KonarCard() {
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(ProductCover);

  const pricePerCard = 24.95;
  const originalPricePerCard = 29.95;

  const thumbnails = [
    ProductCover,
    ProductImage1,
    ProductImage2,
    ProductImage3,
    ProductImage4,
  ];

  const handleBuyNow = async () => {
    const stripe = await stripePromise;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    const session = await response.json();

    if (session.error) {
      toast.error(session.error);
      return;
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      toast.error(result.error.message);
    }
  };

  // Delivery window text: today+1 to today+4 (e.g., "2–5 September" or "30 Sep – 3 Oct 2025")
  const getDeliveryDates = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 1);
    const end = new Date(today);
    end.setDate(today.getDate() + 4);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonth = (d) => monthNames[d.getMonth()].slice(0, 3);

    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

    if (sameMonth) {
      // "2–5 September"
      return `${start.getDate()}–${end.getDate()} ${monthNames[start.getMonth()]}`;
    }

    const sameYear = start.getFullYear() === end.getFullYear();
    if (sameYear) {
      // "30 Sep – 3 Oct"
      return `${start.getDate()} ${shortMonth(start)} – ${end.getDate()} ${shortMonth(end)}`;
    }
    // Cross-year: "30 Dec 2025 – 2 Jan 2026"
    return `${start.getDate()} ${shortMonth(start)} ${start.getFullYear()} – ${end.getDate()} ${shortMonth(end)} ${end.getFullYear()}`;
  };
  const deliveryDateText = getDeliveryDates();

  // Feature list (icons are placeholders—swap later)
  const featurePills = [
    { icon: PhoneIcon, title: 'Compatibility', text: 'Compatible with Android & iOS' },
    { icon: NFCIcon, title: 'QR Code Backup', text: 'If NFC doesn’t work, scan the QR' },
    { icon: WarrantyIcon, title: 'Warranty', text: '12-month warranty' },
    { icon: NFCIcon, title: 'Fast Transfer', text: 'Share details with one tap' },
    { icon: IDCardIcon, title: 'Chip & Memory', text: 'NTAG215 chip, 504 bytes' },
    { icon: LockIcon, title: 'Data Retention', text: 'Stores securely 10+ years' },
    { icon: BoxIcon, title: 'Size & Material', text: '85.5 × 54 × 0.8 mm, PVC' },
    { icon: PalletteIcon, title: 'Eco-Friendly', text: 'Made from recyclable materials' },
  ];

  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>

      {/* ============================= */}
      {/* Product header (redesigned)   */}
      {/* ============================= */}
      <div className="section product-shell">
        {/* LEFT: product image on tray + thumbnails */}
        <div className="pd-left">
          <div className="pd-card-tray">
            <div className="pd-card">
              <img src={mainImage} alt="Konar Card" />
            </div>
          </div>

          <div className="pd-thumbs">
            {thumbnails.map((t, i) => (
              <button
                key={i}
                type="button"
                className={`pd-thumb ${mainImage === t ? 'is-active' : ''}`}
                onClick={() => setMainImage(t)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={t} alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: copy, features, price, CTA */}
        <div className="pd-right">
          <h1 className="pd-title desktop-h4">Konar Card - White Edition</h1>
          <p className="pd-sub desktop-body">
            Stand out and win more jobs — one tap opens your profile with your services, photos, and contact details.
          </p>


          <div className="pd-feature-grid">
            {featurePills.map((f, idx) => (
              <div className="pd-feature-pill" key={idx}>
                <span className="pd-feature-icon">
                  <img src={f.icon} alt="" />
                </span>
                <div className="pd-feature-copy">
                  <p className="pd-feature-title desktop-body-s">{f.title}</p>
                  <p className="pd-feature-text desktop-body-xs">{f.text}</p>
                </div>
              </div>
            ))}

            {/* Full-width Delivery pill (one long row) */}
            <div className="pd-feature-pill pd-feature-pill--full">
              <span className="pd-feature-icon">
                <img src={DeliveryIcon} alt="" />
              </span>
              <div className="pd-feature-copy">
                <p className="pd-feature-title desktop-body-s">Ships within 24h</p>
                <p className="desktop-body-xs" style={{ color: '#666' }}>
                  Estimated delivery: {deliveryDateText}
                </p>
              </div>
            </div>
          </div>

          <div className="pd-meta-row">
            <div className="pd-stars">
              <img src={ReviewStars} alt="Rating" />
              <span className="pd-reviews-count light-black">(229)</span>
            </div>

            <div className="pd-price-wrap">
              <span className="pd-price-now">£{(pricePerCard * quantity).toFixed(2)}</span>
              <span className="pd-price-was">£{(originalPricePerCard * quantity).toFixed(2)}</span>
            </div>
          </div>

          <div className="pd-cta-row">
            <div className="pd-qty">
              <span className="desktop-body-xs">Qty</span>
              <div className="pd-qty-ctrl">
                <button className="pd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <div className="pd-qty-display">{quantity}</div>
                <button className="pd-qty-btn" onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity">+</button>
              </div>
            </div>

            <button onClick={handleBuyNow} className="cta-blue-button desktop-button">Buy Now</button>
          </div>
        </div>
      </div>

      {/* ===== Social proof / Reviews ===== */}
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
                    <p className="desktop-body-xs grey">Plumber</p>
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
                    <p className="desktop-body-xs grey">Electrician</p>
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
                    <p className="desktop-body-xs grey">Builder</p>
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
                    <p className="desktop-body-xs grey">Roofer</p>
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

      {/* ===== FAQ ===== */}
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
