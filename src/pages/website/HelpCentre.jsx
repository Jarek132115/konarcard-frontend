import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import BackgroundHero from '../../assets/images/background-hero.png'; // Using BackgroundHero as a placeholder image


export default function HelpCentre() {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: 20 }} className="section-breadcrumbs">
        <Breadcrumbs />
      </div>
      <div style={{ marginTop: 40 }} className="section">
        <div className="section-1-title">
          <h2 className='desktop-h1 text-center'>Welcome to the NFC Help Centre</h2>
          <h3 className='desktop-h6 text-center'>Here to help you set up, share, and make the most of your smart card. Browse guides, FAQs, and tips below.</h3>
        </div>

        {/* New wrapper for the centered content cards */}
        <div className="help-page-wrapper">
          {/* First Help Section Card */}
          <div className="help-section-card">
            <img src={BackgroundHero} alt="Help Section Visual" className="help-section-image" />
            <div className="help-section-details">
              <div>
                <p className='desktop-h5'>Why NFC Business Cards Are the Future</p>
                <p style={{ fontStyle: 'italic', color: '#333' }} className='desktop-body'>Published April 19, 2025 • 3 min read</p>
                <p style={{ marginBottom: 20 }} className='desktop-body'>Explore how NFC technology is changing the way professionals connect, share, and grow relationships faster than ever. Learn why businesses, freelancers, and creators are making the switch to digital networking tools.</p>
              </div>
              <Link to="/login" className="black-button desktop-button help-section-cta-button">Read more</Link>
            </div>
          </div>

          {/* Second Help Section Card (with reversed layout) */}
          <div className="help-section-card help-section-card-reversed">
            <img src={BackgroundHero} alt="Help Section Visual" className="help-section-image" />
            <div className="help-section-details">
              <div>
                <p className='desktop-h5'>How to Set Up Your Konar Card Profile</p>
                <p style={{ fontStyle: 'italic', color: '#333' }} className='desktop-body'>Published April 20, 2025 • 5 min read</p>
                <p style={{ marginBottom: 20 }} className='desktop-body'>A step-by-step guide to creating your professional digital profile. From adding your services to showcasing your best work, get your page ready in minutes.</p>
              </div>
              <Link to="/login" className="black-button desktop-button help-section-cta-button">Read more</Link>
            </div>
          </div>

          {/* You can add more help sections here following the same structure */}
          <div className="help-section-card">
            <img src={BackgroundHero} alt="Help Section Visual" className="help-section-image" />
            <div className="help-section-details">
              <div>
                <p className='desktop-h5'>Troubleshooting Common NFC Issues</p>
                <p style={{ fontStyle: 'italic', color: '#333' }} className='desktop-body'>Published April 21, 2025 • 4 min read</p>
                <p style={{ marginBottom: 20 }} className='desktop-body'>Facing issues with your NFC card? This guide covers common problems and quick fixes to ensure your card is always ready to connect.</p>
              </div>
              <Link to="/login" className="black-button desktop-button help-section-cta-button">Read more</Link>
            </div>
          </div>

        </div> {/* End help-page-wrapper */}

      </div> {/* End section */}
      <Footer />
    </>
  )
}