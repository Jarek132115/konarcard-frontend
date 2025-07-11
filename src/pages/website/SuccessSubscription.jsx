// frontend/src/pages/website/SuccessSubscription.jsx
import React, { useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { AuthContext } from '../../components/AuthContext';

export default function SuccessSubscription() {
    const location = useLocation();
    const navigate = useNavigate();
    const { refetchAuthUser } = useContext(AuthContext);

    useEffect(() => {
        const confirmSubscription = async () => {
            const queryParams = new URLSearchParams(location.search);
            const sessionId = queryParams.get('session_id');

            if (sessionId) {
                try {
                    const response = await api.post('/api/stripe/confirm-subscription', { sessionId });

                    if (response.data.success) {
                        toast.success('Subscription successfully activated!');
                        console.log('Frontend: Subscription confirmed by backend.');

                        // FIX: Add a type check before calling refetchAuthUser
                        if (typeof refetchAuthUser === 'function') {
                            await refetchAuthUser();
                            console.log('Frontend: AuthUser refetched after subscription success.');
                        } else {
                            console.warn('Frontend: refetchAuthUser is not a function. Cannot immediately update AuthContext. Page will refresh or navigate to MyProfile.');
                            // Fallback: If refetchAuthUser isn't ready, a simple reload will get fresh data
                            // window.location.reload(); // Uncomment if you prefer an immediate full page refresh
                        }

                        // Redirect after a short delay (this ensures the MyProfile page will fetch the updated status)
                        setTimeout(() => {
                            navigate('/myprofile', { replace: true });
                        }, 3000); // Redirect after 3 seconds

                    } else {
                        // This else block handles if response.data.success is FALSE
                        toast.error(response.data.error || 'Failed to confirm subscription.');
                        console.error('Frontend: Backend reported error confirming subscription:', response.data.error);
                    }
                } catch (error) {
                    // This catch block handles network errors or TypeErrors from await refetchAuthUser()
                    toast.error('Error confirming subscription. Please contact support.');
                    console.error('Frontend: API call or subsequent action error during subscription confirmation:', error);
                }
            } else {
                toast('No session ID found, please check your subscription status in My Account.');
                console.warn('Frontend: SuccessSubscription page loaded without session_id.');
            }
        };

        confirmSubscription();
    }, [location.search, navigate, refetchAuthUser]); // Dependencies for useEffect

    return (
        <>
            <div className="success-page-wrapper">
                <div className="success-box subscription-success-box">
                    <h1>Congratulations!</h1>
                    <p>Your subscription is being activated.</p>
                    <p>You'll be redirected shortly, or you can go to your dashboard.</p>

                    <div className="success-buttons">
                        <Link to="/" className="success-btn">Go to Homepage</Link>
                        <Link to="/myprofile" className="success-btn outline">Go to Your Dashboard</Link>
                    </div>
                </div>
            </div>
        </>
    );
}