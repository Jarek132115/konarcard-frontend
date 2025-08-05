import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg';
import { toast } from 'react-hot-toast';

import ProductCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';
import NFCBusinessCard from '../../assets/images/NFC-Business-Card.jpg';
import PremiumMaterials from '../../assets/icons/Premium-Materials-Icon.svg';
import CustomizableDesign from '../../assets/icons/Customizable-Design-Icon.svg';
import QRCodeIcon from '../../assets/icons/QR-Code-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import TapIcon from '../../assets/icons/Tap-Icon.svg';
import SaveIcon from '../../assets/icons/Save-Icon.svg';
import HowItWorks1 from '../../assets/images/HowItWorks-1.png';
import HowItWorks2 from '../../assets/images/HowItWorks-2.png';
import HowItWorks3 from '../../assets/images/HowItWorks-3.png';
import ProfileIcon from '../../assets/icons/Profile-Icon.svg';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import NoApp from '../../assets/icons/NoApp-Icon.svg'


const stripePromise = loadStripe('pk_live_51RPmTAP7pC1ilLXASjenuib1XpQAiuBOxcUuYbeQ35GbhZEVi3V6DRwriLetAcHc3biiZ6dlfzz1fdvHj2wvj1hS00lHDjoAu8');

export default function WhatIsNFC() {
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(ProductCover);

  const pricePerCard = 19.95;

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

  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>

      {/* Main Product Section from WhiteCard.jsx - Top Section */}
      <div className="section-product">
        <div className="product-preview">
          <img src={mainImage} alt="Main Product Card" className="main-card" />
          <div className="thumbnail-row">
            {thumbnails.map((thumb, index) => (
              <img
                key={index}
                src={thumb}
                alt={`Product Thumbnail ${index + 1}`}
                className="thumbnail"
                onClick={() => setMainImage(thumb)}
              />
            ))}
          </div>
        </div>

        <div className="product-options">
          <p className="desktop-h5">Konar Card - White Edition</p>
          <p className="desktop-body">
            The smart, durable card that instantly shows your profile — help customers see your work, your services, and how to contact you in seconds.
          </p>
          <p style={{ fontSize: 18, fontWeight: 600, marginTop: 10, marginBottom: 20 }}>
            £{(pricePerCard * quantity).toFixed(2)}
          </p>

          <div className="review-rating">
            <img style={{ width: 120 }} src={ReviewStars} alt="Stars" />
            <p>(22)</p>
          </div>

          <div className="hero-tick">
            <img src={DeliveryIcon} className="icon" alt="Delivery" />
            <p style={{ fontSize: 14 }}>Order Before 3pm for Next Day Delivery</p>
          </div>

          <div className="option-group">
            <p className="desktop-body-xs">Quantity:</p>
            <div className="quantity-control">
              <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <div className="qty-display">{quantity}</div>
              <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <button onClick={handleBuyNow} className="black-button desktop-button" style={{ marginTop: 20 }}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* What is NFC section from the original file */}
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className="desktop-h1 text-center">What’s an NFC Business Card?</h2>
          <h3 className="desktop-h6 text-center">It’s a smart card you tap on a phone to share your details — no apps needed.</h3>
        </div>

        <div style={{ gap: 40 }} className="section-1-content">
          <div className="section-1-left">
            <img src={NFCBusinessCard} className="" />
          </div>

          <div className="section-1-right">
            <p className="desktop-h5">Why Our Cards Are Better</p>
            <p className="desktop-body">Tough, smart, and made to match your business.</p>

            <div className="section-list">
              <div className="icon-white">
                <img src={PremiumMaterials} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Built to Last</p>
                <p className="desktop-body-xs">Choose plastic, wood, or metal — strong and professional.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={NFCIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Tap to Share</p>
                <p className="desktop-body-xs">Just tap your card on most phones — your profile pops up.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={PalletteIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Your Look, Your Style</p>
                <p className="desktop-body-xs">Pick your colors, upload your logo — make it your own.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={QRCodeIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">QR Code Backup</p>
                <p className="desktop-body-xs">Also scannable — works even if NFC isn’t.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={PhoneIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Works on Any Phone</p>
                <p className="desktop-body-xs">Compatible with iPhones and Androids — no setup needed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section from the original file */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">How It Works</h2>
          <h3 className="desktop-h6 text-center">
            Tap the card on any phone. Your profile opens. Job done.
          </h3>
        </div>

        <div className="how-it-works-container">
          <div className="white-card-column">
            <div className="how-it-works-info">
              <p className="desktop-h5">Tap the Card</p>
              <p className="desktop-body">
                Hold the card near most phones — it works without any app.
              </p>
            </div>
            <img src={HowItWorks1} className="white-card-column-image" />
          </div>

          <div className="how-it-works-right">
            <div className="white-card">
              <div className="how-it-works-info">
                <p className="desktop-h5">Your Page Pops Up</p>
                <p className="desktop-body">
                  They see your name, photo, services, and how to reach you.
                </p>
              </div>
              <img src={HowItWorks2} className="how-it-works-right-image" />
            </div>

            <div className="white-card">
              <div className="how-it-works-info">
                <p className="desktop-h5">They Save Your Info</p>
                <p className="desktop-body">
                  One tap saves your number, email, or connects to your socials.
                </p>
              </div>
              <img src={HowItWorks3} className="how-it-works-right-image" />
            </div>
          </div>
        </div>
      </div>

      {/* Why Tradies Love It section from the original file */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">Why Tradesmen Love It</h2>
          <h3 className="desktop-h6 text-center">No paper. No hassle. Just tap and get hired.</h3>
        </div>

        <div className="section-3-container-flex">
          <div className="section-3-container">
            <div className="section-3-1x1-image-info">
              <img src={QRCodeIcon} className="" />
              <p className="desktop-h5 text-center">Look Like a Pro</p>
              <p className="desktop-body text-center">Modern, reliable, and ready to impress.</p>
            </div>

            <div className="section-3-1x1-image-info">
              <img src={QRCodeIcon} className="" />
              <p className="desktop-h5 text-center">One Smart Card</p>
              <p className="desktop-body text-center">No reprints. No stacks. Just tap and go.</p>
            </div>
          </div>

          <div className="section-3-container">
            <div className="section-3-1x1-image-info">
              <img src={QRCodeIcon} className="" />
              <p className="desktop-h5 text-center">Share Info in Seconds</p>
              <p className="desktop-body text-center">Tap once — your page pops up fast.</p>
            </div>

            <div className="section-3-1x1-image-info">
              <img src={QRCodeIcon} className="" />
              <p className="desktop-h5 text-center">No Apps Needed</p>
              <p className="desktop-body text-center">Works on most phones right out the box.</p>
            </div>
          </div>
        </div>

        <div className="cta-center-text" style={{ marginTop: 60, display: 'flex', justifyContent: 'center' }}>
          <p className="desktop-h6">Ready to upgrade your business card?</p>
          <button onClick={handleBuyNow} className="blue-button desktop-button">Get My Card Now</button>
        </div>
      </div>

      <Footer />
    </>
  );
}