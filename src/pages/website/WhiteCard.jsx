import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg';

const stripePromise = loadStripe('pk_test_51RPmTAP7pC1ilLXA3e0hWCJFsirDnrxr7J7LX0ijgrhacpisWWqMrUUfu9VQ44VIAM9j0oVNjldmkqGjFuNUNNWH00RmpQ9vce');

export default function WhiteCard() {
  const [quantity, setQuantity] = useState(1);
  const pricePerCard = 19.95;

  const handleBuyNow = async () => {
    const stripe = await stripePromise;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      alert(result.error.message);
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
          <img src="https://yourcdn.com/images/WoodenCard.png" alt="Main Card" className="main-card" />
          <div className="thumbnail-row">
            {[...Array(5)].map((_, i) => (
              <img key={i} src="https://yourcdn.com/images/WoodenCard.png" alt={`Thumbnail ${i + 1}`} className="thumbnail" />
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