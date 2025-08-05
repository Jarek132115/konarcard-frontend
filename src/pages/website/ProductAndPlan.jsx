import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Breadcrumbs from '../../components/Breadcrumbs'
import Footer from '../../components/Footer'
import KonarCard from '../../assets/images/KonarCard.png'
import KonarCardCustom from '../../assets/images/KonarCardCustom.png'
import AllCards from '../../assets/images/All-Cards.png'
import PremiumMaterials from '../../assets/icons/Premium-Materials-Icon.svg'
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg'
import QRCode from '../../assets/icons/QR-Code-Icon.svg'
import NFCIcon from '../../assets/icons/NFC-Icon.svg'
import PhoneIcon from '../../assets/icons/Phone-Icon.svg'
import NoApp from '../../assets/icons/NoApp-Icon.svg'
import NFCBusinessCard from '../../assets/images/NFC-Business-Card.jpg';
import ProductCover from '../../assets/images/Product-Cover.png';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import PlasticCard from '../../assets/images/PlasticCard.png';

export default function Home() {
    return (
        <>
            <Navbar />
            <div className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* NEW SECTION: Combined Plan and Cards from Homepage */}
            <div className="section combined-offer-section">
                <div className="section-1-title">
                    <h2 className='desktop-h3 text-center'>Our Plans & Cards</h2>
                    <h3 className='desktop-h6 text-center'>Choose what's right for your business.</h3>
                </div>
                <div className="combined-offer-container">
                    <div className="subscription-offer-left">
                        <div className="subscription-header">
                            <p className='desktop-h5'>Power Profile</p>
                            <div className="free-trial-badge">Free Trial</div>
                        </div>
                        <p className='desktop-body-s subscription-subheader'>Win more work with a power profile</p>

                        <div className="subscription-features">
                            {[
                                "Upload unlimited photos (Portfolio / Gallery)",
                                "Add multiple social links and websites",
                                "Personalize your landing page URL (yourname.cardsite.com)",
                                "Priority support and setup help",
                                "CRM Integration.",
                                "Networking Toolkit.",
                                "Automated Follow-Ups.",
                            ].map((text, idx) => (
                                <div className="hero-tick" key={idx}>
                                    <img src={TickIcon} className="icon" />
                                    <p>{text}</p>
                                </div>
                            ))}
                        </div>

                        <p className='desktop-body-s subscription-description-footer'>
                            "For professionals and businesses ready to make every first impression count."
                        </p>

                        <div className="subscription-price-cta">
                            <div className='price-display'>
                                <p className='desktop-h5'>£7.95</p>
                                <p className='light-black' style={{ fontSize: 14 }}>Per Month</p>
                            </div>
                            <button className="desktop-button combined-section-button blue-button" onClick={handleSubscribe}>
                                Upgrade to Power Profile
                            </button>
                        </div>
                    </div>

                    <div className="card-offer-right">
                        <div className="product-header">
                            <p className='desktop-h5'>Plastic NFC Card</p>
                            <div className="free-trial-badge product-header-badge">1-month subscription included</div>
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
                            <Link to="/productandplan/whitecard" className="desktop-button combined-section-button blue-button">Buy Now</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ORIGINAL FEATURES SECTION - KEPT AS IS */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className='desktop-h3 text-center'>Your Work. Your Card. Built to Impress.</h2>
                    <h3 className='desktop-h6 text-center'>Choose a smart, tough card that shows off your trade and makes sharing easy.</h3>
                </div>
                <div style={{ gap: 40 }} className="section-1-content">
                    <div className="section-1-left">
                        <img src={NFCBusinessCard} className="" />
                    </div>
                    <div className="section-1-right">
                        <p className='desktop-h5'>Why Tradies Choose Konar Cards</p>
                        <p className='desktop-body'>Smart, durable, and built to help you share your business in seconds.</p>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={PremiumMaterials} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Built to Last</p>
                                <p className='desktop-body-xs'>Made from a durable, high-quality material that stands up to the demands of any job site.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={NFCIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>Tap and Share</p>
                                <p className='desktop-body-xs'>There's a smart chip inside — tap it on most phones and your profile pops up.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className=" icon-white">
                                <img src={QRCode} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className='desktop-h6'>QR Code Backup</p>
                                <p className='desktop-body-xs'>No NFC? No problem. Every card comes with a scannable code too.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}