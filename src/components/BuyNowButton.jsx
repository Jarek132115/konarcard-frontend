import { loadStripe } from '@stripe/stripe-js';
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const stripePromise = loadStripe('pk_test_51RPmTAP7pC1ilLXA3e0hWCJFsirDnrxr7J7LX0ijgrhacpisWWqMrUUfu9VQ44VIAM9j0oVNjldmkqGjFuNUNNWH00RmpQ9vce');

const BuyNowButton = ({ product, logoFile }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname,
          checkoutProduct: product,
        },
      });
      return;
    }

    let logoUrl = '';

    if (logoFile) {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const uploadRes = await fetch('http://localhost:8000/api/upload/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const uploadData = await uploadRes.json();
      logoUrl = uploadData.url;
    }

    const stripe = await stripePromise;
    const res = await fetch('http://localhost:8000/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        product,
        returnUrl: window.location.origin + '/success',
        logoUrl
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Could not create Stripe session.');
    }
  };

  return (
    <button onClick={handleClick} className="black-button desktop-button margin-top-10">
      Buy Now
    </button>
  );
};

export default BuyNowButton;
