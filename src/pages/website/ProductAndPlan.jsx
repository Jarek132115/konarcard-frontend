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

            {/* --- PRICING (redesigned) --- */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">One Plan. One Card. Endless Opportunities.</h2>
                    <h3 className="desktop-h6 text-center">No confusion. Just one powerful plan to make you stand out.</h3>
                </div>

                <div className="pricing-grid">
                    {/* Subscription card (blue) */}
                    <div className="pricing-card pricing-card--subscription">
                        <div className="pricing-inner">
                            <div className="pricing-head">
                                <div>
                                    <h3 className="desktop-h5">Power Profile</h3>
                                    <p className='desktop-body-xs'>Win more work with a power profile</p>
                                </div>
                                <span className="pricing-badge blue">14-Day Free Trial</span>
                            </div>
                            <div className="pricing-divider" />
                            <div className="pricing-price-row">
                                <span className="desktop-h1">£4.95</span>
                                <span className="desktop-button">/Month</span>
                            </div>

                            <ul className="pricing-features">
                                {[
                                    'Update your profile instantly (real-time edits)',
                                    'Choose fonts and light/dark themes',
                                    'Write a compelling “About Me” section',
                                    'Showcase your work with unlimited images',
                                    'Collect and display client reviews (star ratings)',
                                    'List your services and set pricing',
                                    'Share via QR code, link, or save-to-contacts',
                                    'Display work/services as list, grid, or carousel',
                                    'Make it easy for clients to contact you',
                                ].map((text, i) => (
                                    <li className="pricing-feature" key={i}>
                                        <img src={TickIcon} alt="" className="pricing-check invert-for-blue" />
                                        <span className='white desktop-body-x'>{text}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Sticky bottom area: quote + CTA */}
                            <div className="pricing-bottom">

                                <Link
                                    to="/productandplan/konarsubscription"
                                    className="cta-blue-button desktop-button"
                                    style={{ marginTop: 20, width: '100%' }}
                                >
                                    View Subscription Details
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Physical card (black) */}
                    <div className="pricing-card pricing-card--product">
                        <div className="pricing-inner">
                            <div className="pricing-head">
                                <div>
                                    <h3 className="desktop-h5">Konar Card - White Edition</h3>
                                    <p className='desktop-body-xs'>Tap to share your profile instantly.</p>
                                </div>
                                <span className="pricing-badge">12 Month Warranty</span>
                            </div>
                            <div className="pricing-divider" />
                            <div className="pricing-price-row">
                                <span className="desktop-h1">£24.95</span>
                                <span className="desktop-button">One Time Purchase</span>
                            </div>

                            <div className="pricing-media">
                                <img src={PlasticCard} alt="Konar Card - White Edition" />
                            </div>

                            {/* Sticky bottom area: quote + CTA */}
                            <div className="pricing-bottom">

                                <Link
                                    to="/productandplan/konarcard"
                                    className="cta-black-button desktop-button"
                                    style={{ marginTop: 20, width: '100%' }}
                                >
                                    View Card Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
