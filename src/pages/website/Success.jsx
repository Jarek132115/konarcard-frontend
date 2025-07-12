import React from 'react';
import { Link } from 'react-router-dom';

export default function SuccessSubscription() {
  return (
    <div className="success-page">
      <div className="success-box">
        <p className='desktop-h3'>Congratulations!</p>
        <p className='desktop-body'>Your subscription is now active.</p>
        <p className='desktop-body'>You can now enjoy all Power Profile features!</p>

        <div className="success-buttons">
          <Link to="/" className="black-button desktop-button" style={{ width: '100%' }}>Go to Homepage</Link>
          <Link to="/myprofile" className="blue-button desktop-button" style={{ width: '100%' }}>Go to Your Dashboard</Link>
        </div>
      </div>
    </div>
  );
}