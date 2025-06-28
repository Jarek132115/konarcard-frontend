import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react';
import LogoIcon from '../assets/icons/Logo-Icon.svg'
import CopyrightIcon from '../assets/icons/Copyright-Icon.svg'



export default function Footer() {
    return (
        <footer>
            <div className="black-message-container">
                <p style={{ width: 590, color: 'white' }} className='desktop-h2 text-center'>Because Business Cards Should Work Harder!</p>
            </div>
            <div className="footer-container">
                <div className="footer-info">
                    <div className="footer-info-left">
                        <img src={LogoIcon} alt="Logo" className="logo" />
                        <p className='desktop-body-s' style={{ width: 280, marginBottom: 10 }}>Join our newsletter to stay up to date on features and updates.</p>
                        <div className='subscribe-button'>
                            <p>Email</p>
                            <Link to="/login" className="black-button desktop-button">Subscribe</Link>
                        </div>
                    </div>
                    <div className="footer-info-right">
                        <div className="footer-column">
                            <p className='footer-link'>NFC</p>
                            <Link to="/shopnfccards" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>Shop NFC Cards</p></Link>
                            <Link to="/howitworks" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>How It Works</p></Link>
                            <Link to="/whatisnfc" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>What Is NFC</p></Link>
                            <Link to="/reviews" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>Reviews</p></Link>
                        </div>
                        <div className="footer-column">
                            <p className='footer-link'>Help</p>
                            <Link to="/contactus" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>Contact Us</p></Link>
                            <Link to="/faq" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>FAQs</p></Link>
                            <Link to="/policies" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>Shipping & Returns</p></Link>
                            <Link to="/policies" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>Warranty</p></Link>
                        </div>
                        <div className="footer-column">
                            <p className='footer-link'>Follow Us</p>
                            <Link to="/#" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>Instagram</p></Link>
                            <Link to="/#" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>LinkedIn</p></Link>
                            <Link to="/#" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>Youtube</p></Link>
                            <Link to="/#" ><p style={{ color: '#333', marginBottom: 5 }} className='desktop-body-s footer-page-link'>X</p></Link>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="copyright-box">
                        <img src={CopyrightIcon} />
                        <p style={{ color: '#333', fontSize: 12 }}>2025 KONAR LTD. All Rights Reserved</p>
                    </div>
                    <div className="policy-box-footer">
                        <Link to="/policies" ><p style={{ color: '#333', fontSize: 12 }}>Terms Of Service</p></Link>
                        <Link to="/policies" ><p style={{ color: '#333', fontSize: 12 }}>Privacy Policy</p></Link>
                        <Link to="/policies" ><p style={{ color: '#333', fontSize: 12 }}>Cookie Policy</p></Link>
                    </div>
                </div>
            </div>
        </footer >
    )
}
