import { loadStripe } from '@stripe/stripe-js';
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_51RPmTAP7pC1ilLXA3e0hWCJFsirDnrxr7J7LX0ijgrhacpisWWqMrUUfu9VQ44VIAM9j0oVNjldmkqGjFuNUNNWH00RmpQ9vce');

const SubscribeButton = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = async () => {
        if (!user) {
            navigate('/login', {
                state: {
                    from: location.pathname,
                    checkoutType: 'subscription',
                },
            });
            return;
        }

        try {
            const stripe = await stripePromise;

            // FIX: Use VITE_API_URL for API calls
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/create-subscription-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    returnUrl: window.location.origin + '/success',
                }),
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error('Could not start checkout. Please try again.');
            }
        } catch (err) {
            console.error('Stripe checkout error:', err);
            toast.error('Something went wrong during subscription.');
        }
    };

    return (
        <button onClick={handleClick} className="primary-button">
            Subscribe Now
        </button>
    );
};

export default SubscribeButton;