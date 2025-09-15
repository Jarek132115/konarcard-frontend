import React from 'react';
import { Link } from 'react-router-dom';

export default function SuccessSubscription() {
    return (
        <div className="success-page">
            <div className="success-box">
                <p className='desktop-h3'>Your Subscription is Now Active!</p>
                <p className='desktop-body'>You can now enjoy all Power Profile features.</p>

                <div className="success-buttons">
                    <Link to="/" className="cta-black-button desktop-button" style={{ width: '100%' }}>Go to Homepage</Link>
                    <Link to="/myprofile" className="cta-blue-button desktop-button" style={{ width: '100%' }}>Go to Your Dashboard</Link>
                </div>
            </div>
        </div>
    );
}