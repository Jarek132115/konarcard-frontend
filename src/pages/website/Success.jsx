import React from 'react';
import { Link } from 'react-router-dom';

export default function SuccessSubscription() {
  return (
    // Changed class from 'success-page-wrapper' to 'success-page' to match Success.jsx
    <div className="success-page">
      {/* Removed 'subscription-success-box' class to match Success.jsx */}
      <div className="success-box">
        {/* Applied desktop-h3 class to match Success.jsx */}
        <p className='desktop-h3'>Congratulations!</p>
        {/* Applied desktop-body class to match Success.jsx */}
        <p className='desktop-body'>Your subscription is now active.</p>
        {/* Applied desktop-body class to match Success.jsx */}
        <p className='desktop-body'>You can now enjoy all Power Profile features!</p>

        <div className="success-buttons">
          {/* Applied black-button and desktop-button classes, and inline style for full width */}
          <Link to="/" className="black-button desktop-button" style={{ width: '100%' }}>Go to Homepage</Link>
          {/* Applied blue-button and desktop-button classes, and inline style for full width, removed 'outline' */}
          <Link to="/myprofile" className="blue-button desktop-button" style={{ width: '100%' }}>Go to Your Dashboard</Link>
        </div>
      </div>
    </div>
  );
}