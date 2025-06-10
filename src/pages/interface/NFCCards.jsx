import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import KonarCard from '../../assets/images/KonarCard.png';

export default function NFCCards() {
  return (
    <div className="myprofile-layout">
      <Sidebar />

      <main className="myprofile-main">
        <div className="page-wrapper">
          <div className="page-header">
            <h2 className="page-title">Choose Your Perfect Card</h2>
            <div className="page-actions">
              <button className="header-button black">🖱️ Activate Your Card</button>
              <button className="header-button white">🔗 Share Your Card</button>
            </div>
          </div>

          <p className="nfc-subtitle">
            Premium materials. Custom designs. Instantly share your contact details with a single tap.
          </p>

          <div className="section-3-container shop-page-container">
            <div className="Prouct-Image-Section">
              <img src={KonarCard} className="Product-Image" alt="Konar Card" />
              <div className='product-description'>
                <div className="grey-box desktop-body-xs">1-month subscription included</div>
                <p className='desktop-h5 text-center'>Konar Card - White Edition</p>
                <p className='desktop-body text-center'>Engineered to impress. Built to last.</p>
                <p style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginTop: 10, marginBottom: 5 }}>£19.95</p>
                <Link to="/shopnfccards/whitecard" style={{ display: 'flex', width: 'fit-content', margin: 'auto' }} className="black-button desktop-button margin-top-10">Buy Now</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
