import React from 'react';
import { Link } from 'react-router-dom';

export default function Success() {
  return (
    <div className="success-page">
      <div className="success-box">
        <p className='desktop-h3'>Payment Successful!</p>
        <p className='desktop-body'>Thank you for your order. Your smart card is on its way.</p>

        <div className="success-buttons">
          <Link to="/" className="cta-black-button desktop-button" style={{ width: '100%' }}>Go to Home</Link>
          <Link to="/myprofile" className="cta-blue-button desktop-button" style={{ width: '100%' }}>Go to Your Dashboard</Link>
        </div>
      </div>
    </div>
  );
}