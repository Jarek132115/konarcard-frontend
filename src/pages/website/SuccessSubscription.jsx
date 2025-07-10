// frontend/src/pages/website/SuccessSubscription.jsx
import React, { useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useLocation, useNavigate
import { toast } from 'react-hot-toast';
import api from '../../services/api'; // Assuming your api instance is in services/api
import { AuthContext } from '../../components/AuthContext'; // Import AuthContext

export default function SuccessSubscription() {
    const location = useLocation();
    const navigate = useNavigate();
    const { refetchAuthUser } = useContext(AuthContext); // Get refetchAuthUser from AuthContext

    useEffect(() => {
        const confirmSubscription = async () => {
            const queryParams = new URLSearchParams(location.search);
            const sessionId = queryParams.get('session_id');

            if (sessionId) {
                try {
                    // Call the new backend endpoint to confirm the subscription
                    const response = await api.post('/stripe/confirm-subscription', { sessionId });

                    if (response.data.success) {
                        toast.success('Subscription successfully activated!');
                        console.log('Frontend: Subscription confirmed by backend.');
                        // IMPORTANT: Refetch user data to update isSubscribed status in AuthContext
                        await refetchAuthUser();
                        console.log('Frontend: AuthUser refetched after subscription success.');

                        // Optional: Redirect to MyProfile after a short delay
                        setTimeout(() => {
                            navigate('/myprofile', { replace: true }); // Use replace to avoid back button issues
                        }, 3000); // Redirect after 3 seconds
                    } else {
                        toast.error(response.data.error || 'Failed to confirm subscription.');
                        console.error('Frontend: Backend reported error confirming subscription:', response.data.error);
                    }
                } catch (error) {
                    toast.error('Error confirming subscription. Please contact support.');
                    console.error('Frontend: API call error during subscription confirmation:', error);
                }
            } else {
                // If no session_id, maybe it's a direct navigation or error, inform user.
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
                    <p>Your subscription is being activated.</p> {/* Updated message */}
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