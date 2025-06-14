import { loadStripe } from '@stripe/stripe-js';
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const stripePromise = loadStripe('pk_test_51RPmTAP7pC1ilLXA3e0hWCJFsirDnrxr7J7LX0ijgrhacpisWWqMrUUfu9VQ44VIAM9j0oVNjldmkqGjFuNUNNWH00RmpQ9vce');

// REMOVED logoFile prop from component signature
const BuyNowButton = ({ product }) => {
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

    const stripe = await stripePromise;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        product,
        returnUrl: window.location.origin + '/success',
        // DELETED: logoUrl no longer passed here
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