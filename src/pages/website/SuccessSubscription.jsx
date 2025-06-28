import React from 'react';
import { Link } from 'react-router-dom';

export default function SuccessSubscription() {
    return (
        <>
            <div className="success-page-wrapper"> {/* New wrapper for consistent styling */}
                <div className="success-box subscription-success-box"> {/* Added subscription-specific class */}
                    <h1>Congratulations!</h1>
                    <p>You are now subscribed to Konar Premium!</p>
                    <p>You're ready to create your ultimate digital profile and unlock all premium features!</p>

                    <div className="success-buttons">
                        <Link to="/" className="success-btn">Go to Homepage</Link>
                        <Link to="/myprofile" className="success-btn outline">Go to Your Dashboard</Link>
                    </div>
                </div>
            </div>
        </>
    );
}