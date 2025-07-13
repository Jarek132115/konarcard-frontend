import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import BackgroundHero from '../../assets/images/background-hero.png'; // Example image for hero
// Import placeholder icons for help items
import QuestionIcon from '../../assets/icons/Help-Icon.svg'; // Using Help-Icon as a generic question icon
import InfoIcon from '../../assets/icons/Info-Icon.svg'; // Assuming you have an Info-Icon or similar


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

        {/* New main wrapper for the centered content card */}
        <div className="help-page-wrapper">
          <div className="help-main-card"> {/* This is the single large card container */}
            {/* Grid container for the two-column help sections */}
            <div className="help-items-grid">
              {/* Individual Help Item 1 */}
              <div className="help-item">
                <img src={QuestionIcon} alt="Question Icon" className="help-item-icon" />
                <p className='desktop-h6 help-item-title'>Getting Started</p>
                <p className='desktop-body-s help-item-description'>Learn how to set up your profile and activate your card.</p>
                <Link to="/help/getting-started" className="help-item-link black-button desktop-button">Read Guide</Link>
              </div>

              {/* Individual Help Item 2 */}
              <div className="help-item">
                <img src={InfoIcon} alt="Info Icon" className="help-item-icon" />
                <p className='desktop-h6 help-item-title'>Troubleshooting</p>
                <p className='desktop-body-s help-item-description'>Find solutions to common issues with your card or profile.</p>
                <Link to="/help/troubleshooting" className="help-item-link black-button desktop-button">Get Help</Link>
              </div>

              {/* Individual Help Item 3 */}
              <div className="help-item">
                <img src={QuestionIcon} alt="Question Icon" className="help-item-icon" />
                <p className='desktop-h6 help-item-title'>Account Management</p>
                <p className='desktop-body-s help-item-description'>Manage your subscription, personal details, and security settings.</p>
                <Link to="/help/account-management" className="help-item-link black-button desktop-button">Manage Account</Link>
              </div>

              {/* Individual Help Item 4 */}
              <div className="help-item">
                <img src={InfoIcon} alt="Info Icon" className="help-item-icon" />
                <p className='desktop-h6 help-item-title'>Sharing Your Profile</p>
                <p className='desktop-body-s help-item-description'>Tips and tricks for effectively sharing your digital business card.</p>
                <Link to="/help/sharing-profile" className="help-item-link black-button desktop-button">Learn More</Link>
              </div>

              {/* Individual Help Item 5 */}
              <div className="help-item">
                <img src={QuestionIcon} alt="Question Icon" className="help-item-icon" />
                <p className='desktop-h6 help-item-title'>FAQs</p>
                <p className='desktop-body-s help-item-description'>Browse frequently asked questions for quick answers.</p>
                <Link to="/faq" className="help-item-link black-button desktop-button">View FAQs</Link>
              </div>

              {/* Individual Help Item 6 */}
              <div className="help-item">
                <img src={InfoIcon} alt="Info Icon" className="help-item-icon" />
                <p className='desktop-h6 help-item-title'>Contact Us</p>
                <p className='desktop-body-s help-item-description'>Still need help? Get in touch with our support team directly.</p>
                <Link to="/contact-support" className="help-item-link black-button desktop-button">Contact Support</Link>
              </div>

            </div> {/* End help-items-grid */}
          </div> {/* End help-main-card */}
        </div> {/* End help-page-wrapper */}

      </div> {/* End section */}
      <Footer />
    </>
  )
}