import { loadStripe } from '@stripe/stripe-js';
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Ensure this path is correct
import toast from 'react-hot-toast';

// IMPORTANT: REPLACE 'pk_live_YOUR_PUBLISHABLE_KEY_HERE' with your actual LIVE Stripe Publishable Key
const stripePromise = loadStripe('pk_live_51RPmTAP7pC1ilLXASjenuib1XpQAiuBOxcUuYbeQ35GbhZEVi3V6DRwriLetAcHc3biiZ6dlfzz1fdvHj2wvj1hS00lHDjoAu8');

// Removed logoFile prop
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

    // --- REMOVED LOGO UPLOAD LOGIC ---
    // let logoUrl = '';
    // if (logoFile) {
    //   const formData = new FormData();
    //   formData.append('logo', logoFile);
    //   const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/logo`, {
    //     method: 'POST',
    //     body: formData,
    //     credentials: 'include'
    //   });
    //   const uploadData = await uploadRes.json();
    //   logoUrl = uploadData.url;
    // }
    // --- END REMOVED LOGIC ---

    const stripe = await stripePromise;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        product,
        returnUrl: window.location.origin + '/success',
        // Removed logoUrl from body as it's no longer generated
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error('Could not create Stripe session.');
    }
  };

  return (
    <button onClick={handleClick} className="black-button desktop-button margin-top-10">
      Buy Now
    </button>
  );
};

export default BuyNowButton;