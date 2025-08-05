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
import QRCodeIcon from '../../assets/icons/QR-Code-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import HowItWorks1 from '../../assets/images/HowItWorks-1.png';
import HowItWorks2 from '../../assets/images/HowItWorks-2.png';
import HowItWorks3 from '../../assets/images/HowItWorks-3.png';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import WarrantyIcon from '../../assets/icons/Warranty-Icon.svg'
import WhatIsKonar from '../../assets/images/WhatIsKonar.jpg';


const stripePromise = loadStripe('pk_live_51RPmTAP7pC1ilLXASjenuib1XpQAiuBOxcUuYbeQ35GbhZEVi3V6DRwriLetAcHc3biiZ6dlfzz1fdvHj2wvj1hS00lHDjoAu8');

export default function WhatIsNFC() {
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

  // Function to get dynamic delivery dates
  const getDeliveryDates = () => {
    const today = new Date();
    const deliveryStart = new Date(today);
    // Add one day for next day delivery
    deliveryStart.setDate(today.getDate() + 1);

    const deliveryEnd = new Date(today);
    // Add two days for the end of the delivery window
    deliveryEnd.setDate(today.getDate() + 2);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const startDay = deliveryStart.getDate();
    const endDay = deliveryEnd.getDate();
    const month = monthNames[deliveryStart.getMonth()];

    return `Receive by ${startDay}-${endDay} ${month}`;
  };

  const deliveryDateText = getDeliveryDates();

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
            The smart, durable card that instantly shows your profile, work, services, and how to contact you in seconds.
          </p>

          <div className="hero-tick-box">
            {/* DYNAMIC DELIVERY DATE - REVISED */}
            <div className="hero-tick">
              <img src={DeliveryIcon} className="icon" alt="Delivery" />
              <div>
                <p className='bold-tick desktop-body-xs' style={{ fontSize: 14 }}>Delivery 1-2 Days</p>
                <p className='desktop-body-xs' style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {deliveryDateText}
                </p>
              </div>
            </div>
            <div className="hero-tick">
              <img src={WarrantyIcon} className="icon" alt="Warranty" />
              <div>
                <p className='bold-tick desktop-body-xs' style={{ fontSize: 14 }}>12 Month Warranty</p>
                <p className='desktop-body-xs' style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  Damaged? Free replacement!
                </p>
              </div>
            </div>
          </div>

          <div className="review-rating">
            <img style={{ width: 80 }} src={ReviewStars} alt="Stars" />
            <p>(22)</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', }}>
            <p style={{ fontSize: 24, fontWeight: 600 }}>
              £{(pricePerCard * quantity).toFixed(2)}
            </p>
            <p style={{ fontSize: 18, color: '#666', textDecoration: 'line-through' }}>
              £{(originalPricePerCard * quantity).toFixed(2)}
            </p>
          </div>

          <div className="option-group">
            <p className="desktop-body-xs">Quantity:</p>
            <div className="quantity-control">
              <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <div className="qty-display">{quantity}</div>
              <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <button onClick={handleBuyNow} className="blue-button desktop-button">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* What is NFC section - REVISED */}
      <div className="section">
        <div className="section-1-title">
          <h2 className="desktop-h3 text-center">What’s an Konar Business Card?</h2>
          <h3 className="desktop-h6 text-center">It’s a smart card you tap on a phone to share your details — no apps needed.</h3>
        </div>

        <div style={{ gap: 40 }} className="section-1-content">
          <div className="section-1-left">
            <img src={WhatIsKonar} className="" />
          </div>

          <div className="section-1-right">
            <p className="desktop-h5">Why Our Cards Are Better</p>
            <p className="desktop-body">The durable, smart card that's always ready to impress.</p>

            <div className="section-list">
              <div className="icon-white">
                <img src={PremiumMaterials} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Durable and Professional</p>
                <p className="desktop-body-xs">Made from high-quality, long-lasting plastic that stands up to daily use.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={NFCIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">Tap to Share</p>
                <p className="desktop-body-xs">Instantly share your full profile with a simple tap on a phone—no apps or setup needed.</p>
              </div>
            </div>

            <div className="section-list">
              <div className="icon-white">
                <img src={QRCodeIcon} className="icon" />
              </div>
              <div className="section-list-info">
                <p className="desktop-h6">QR Code Backup</p>
                <p className="desktop-body-xs">A scannable code on the back ensures your profile is always accessible, even without NFC.</p>
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


      <Footer />
    </>
  );
}