import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import WarrantyIcon from '../../assets/icons/Warranty-Icon.svg'
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import SetupIcon from '../../assets/icons/Setup-Icon.svg';
import BoxIcon from '../../assets/icons/Box-Icon.svg';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg';
import HatIcon from '../../assets/icons/Hat-Icon.svg';
import LockIcon from '../../assets/icons/Lock-Icon.svg';
import PencilIcon from '../../assets/icons/Pencil-Icon.svg';
import PhoneIcon from '../../assets/icons/Phone-Icon.svg';
import WalletIcon from '../../assets/icons/Wallet-Icon.svg';
const stripePromise = loadStripe('pk_live_51RPmTAP7pC1ilLXASjenuib1XpQAiuBOxcUuYbeQ35GbhZEVi3V6DRwriLetAcHc3biiZ6dlfzz1fdvHj2wvj1hS00lHDjoAu8');


// RENAMED COMPONENT
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
          <p className="desktop-h5">Konar Card - White Edition</p> {/* This is the content title */}
          <p className="desktop-body">
            The smart, durable card that instantly shows your profile, work, services, and how to contact you in seconds.
          </p>

          <div className="hero-tick-box">
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
