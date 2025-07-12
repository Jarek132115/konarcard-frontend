import React from 'react'; 
import { Link } from 'react-router-dom'; 

export default function SuccessSubscription() {
    return (
        <>
            <div className="success-page-wrapper">
                <div className="success-box subscription-success-box">
                    <h1>Congratulations!</h1>
                    <p>Your subscription is being activated.</p>
                    <p>You'll be redirected shortly, or you can go to your dashboard.</p>

                    <div className="success-buttons">
                        <Link to="/" className="success-btn" style={{ width: '100%' }}>Go to Homepage</Link>
                        <Link to="/myprofile" className="success-btn outline" style={{ width: '100%' }}>Go to Your Dashboard</Link>
                    </div>
                </div>
            </div>
        </>
    );
}