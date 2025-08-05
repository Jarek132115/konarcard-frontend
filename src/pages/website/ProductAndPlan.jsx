import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import PremiumMaterials from '../../assets/icons/Premium-Materials-Icon.svg'
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import QRCode from '../../assets/icons/QR-Code-Icon.svg'
import NFCIcon from '../../assets/icons/NFC-Icon.svg'
import NFCBusinessCard from '../../assets/images/NFC-Business-Card.jpg';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import PlasticCard from '../../assets/images/PlasticCard.png';

export default function ProductAndPlan() {
    return (
        <>
            <Navbar />
            <div className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            <div className="section combined-offer-section">
                <div className="section-1-title">
                    <h2 className='desktop-h2 text-center'>Our Plans & Cards</h2>
                    <h3 className='desktop-h6 text-center'>Choose what's right for your business.</h3>
                </div>
                <div className="combined-offer-container">
                    <div className="subscription-offer-left">
                        <div className="subscription-header">
                            <p className='desktop-h5'>Power Profile</p>
                            <div className="free-trial-badge">14 Day Free Trial</div>
                        </div>
                        <p className='desktop-body-s subscription-subheader'>Create a stunning, professional profile in minutes. No coding needed.</p>

                        <div className="subscription-features">
                            {[
                                "Update anytime, instantly",
                                "Choose your own font",
                                "Select Light or Dark mode",
                                "Craft your 'About Me' section",
                                "Showcase your work portfolio",
                                "Display client reviews",
                                "List your services",
                                "Set your pricing",
                            ].map((text, idx) => (
                                <div className="hero-tick" key={idx}>
                                    <img src={TickIcon} className="icon" />
                                    <p>{text}</p>
                                </div>
                            ))}
                        </div>

                        <p className='desktop-body-s subscription-description-footer'>
                            "The perfect tool for tradesmen to make an unforgettable first impression and get new clients."
                        </p>

                        <div className="subscription-price-cta">
                            <div className='price-display'>
                                <p className='desktop-h5'>£7.95</p>
                                <p className='light-black' style={{ fontSize: 14 }}>Per Month</p>
                            </div>
                            <Link to="/howitworks" className="desktop-button combined-section-button blue-button">
                                View Subscription Details
                            </Link>
                        </div>
                    </div>

                    <div className="card-offer-right">
                        <div className="product-header">
                            <p className='desktop-h5'>Plastic NFC Card</p>
                            <div className="free-trial-badge product-header-badge">Best-Seller</div>
                        </div>
                        <p className='desktop-body-s product-subheader'>Lightweight, Durable, Always Ready</p>
                        <p className='desktop-body-xs product-optional-sentence'>This product is optional, buy one to stand out.</p>

                        <img src={PlasticCard} className="product-image" />

                        <p className='desktop-body-s subscription-description-footer'>
                            "For those who want to stand out above those who already stand out!"
                        </p>

                        <div className="product-price-cta">
                            <div className='price-display'>
                                <p className='desktop-h5'>£24.95</p>
                                <p className='light-black' style={{ fontSize: 14 }}>Lifetime Use</p>
                            </div>
                            <Link to="/whatisnfc" className="desktop-button combined-section-button blue-button">
                                View Card Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="section-1-title">
                    <h2 className='desktop-h3 text-center'>Your Work. Your Card. Built to Impress.</h2>
                    <h3 className='desktop-h6 text-center'>Your digital page and smart card—a powerful combo built to impress and win you work.</h3>
                </div>
                <div style={{ gap: 40 }} className="section-1-content">
                    <div className="section-1-left">
                        <img src={NFCBusinessCard} className="" />
                    </div>
                    <div className="section-1-right">
                        <p className='desktop-h5'>Why Tradies Choose Konar</p>
                        <p className='desktop-body'>It's a powerful tool that combines your digital portfolio with a smart physical card to get you noticed.</p>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={PremiumMaterials} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Look Professional & Legit</p>
                                <p className='desktop-body-xs'>Present a professional online profile and hand out a sleek, modern card that sets you apart from the competition.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={NFCIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Showcase Your Best Work</p>
                                <p className='desktop-body-xs'>Easily upload a portfolio of your past jobs and display customer reviews to build instant trust with new clients.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={PalletteIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Share in Seconds</p>
                                <p className='desktop-body-xs'>Instantly share your full profile with a simple tap of your card or a QR scan. Always be ready to connect with new leads.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}