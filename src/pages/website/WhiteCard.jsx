import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg';
import { toast } from 'react-hot-toast';

// Import the new product images
import ProductCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';
import ProductImage5 from '../../assets/images/Product-Image-5.png';


// IMPORTANT: REPLACE 'pk_live_YOUR_PUBLISHABLE_KEY_HERE' with your actual LIVE Stripe Publishable Key
const stripePromise = loadStripe('pk_live_51RPmTAP7pC1ilLXASjenuib1XpQAiuBOxcUuYbeQ35GbhZEVi3V6DRwriLetAcHc3biiZ6dlfzz1fdvHj2wvj1hS00lHDjoAu8');

export default function WhiteCard() {
  const [quantity, setQuantity] = useState(1);
  // State to manage the currently displayed main image
  const [mainImage, setMainImage] = useState(ProductCover);

  const pricePerCard = 19.95; // This is the displayed price, actual price comes from Stripe Price ID

  // Array of thumbnail images
  const thumbnails = [
    ProductImage1,
    ProductImage2,
    ProductImage3,
    ProductImage4,
    ProductImage5
  ];

  const handleBuyNow = async () => {
    const stripe = await stripePromise;

    // Use VITE_API_URL for the backend checkout endpoint
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    const session = await response.json();

    // Check for errors returned by your backend before redirecting
    if (session.error) {
      toast.error(session.error);
      return;
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      toast.error(result.error.message); // Use toast instead of alert
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>

      <div className="section-product">
        <div className="product-preview">
          {/* Main product image, dynamically set */}
          <img src={mainImage} alt="Main Product Card" className="main-card" />
          <div className="thumbnail-row">
            {/* Map through the thumbnails array to display them */}
            {thumbnails.map((thumb, index) => (
              <img
                key={index}
                src={thumb}
                alt={`Product Thumbnail ${index + 1}`}
                className="thumbnail"
                onClick={() => setMainImage(thumb)} // Change main image on thumbnail click
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

            <button onClick={handleBuyNow} className="black-button" style={{ marginTop: 20 }}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}