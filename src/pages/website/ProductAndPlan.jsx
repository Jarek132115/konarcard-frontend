import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import TickIcon from '../../assets/icons/Tick-Icon.svg';

// ✅ gallery images
import ProductCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';

export default function ProductAndPlan() {
    const [cardMainImage, setCardMainImage] = useState(ProductCover);
    const cardThumbs = [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4];

    return (
        <>
            <Navbar />
            <div className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* --- PRICING --- */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h2 text-center">
                        One <span className="blue">Plan</span>. One <span className="blue">Card</span>. Endless <span className="blue">Opportunities</span>.
                    </h2>
                    <h3 className="desktop-h6 text-center">
                        Start your Power Profile free for 14 days. Add the Konar Card when you’re ready.
                    </h3>
                </div>

                <div className="pricing-grid">
                    {/* Subscription card (blue) */}
                    <div className="pricing-card pricing-card--subscription">
                        <div className="pricing-inner">
                            <div className="pricing-head">
                                <div>
                                    <h3 className="desktop-h5">Konar Profile</h3>
                                    <p className="desktop-body-xs">Win more work with a power profile</p>
                                </div>
                                <span className="pricing-badge dark-blue">14-Day Free Trial</span>
                            </div>
                            <div className="pricing-divider" />
                            <div className="pricing-price-row">
                                <span style={{ paddingRight: 5 }} className="desktop-h3">£4.95</span>
                                <span style={{ padding: 0 }} className="desktop-button">/Month - After 14 Days</span>
                            </div>

                            <ul className="pricing-features">
                                {[
                                    'Simple editor; no tech skills.',
                                    'Show what you do, fast.',
                                    'Unlimited images — show all your work.',
                                    'Unlimited services — list every job.',
                                    'Unlimited reviews — build instant trust.',
                                    'Custom branding — logo, colours, layout.',
                                    'Share everywhere — link, QR, NFC tap.',
                                    'Update anytime — changes live instantly.',
                                    'No app needed — iPhone, Android.',
                                    'Cancel Anytime',
                                ].map((text, i) => (
                                    <li className="pricing-feature" key={i}>
                                        <img src={TickIcon} alt="" className="pricing-check invert-for-blue" />
                                        <span className="white desktop-body-x">{text}</span>
                                    </li>
                                ))}
                            </ul>

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
                                    <p className="desktop-body-xs">Tap to share your profile instantly.</p>
                                </div>
                                <span className="pricing-badge">12 Month Warranty</span>
                            </div>
                            <div className="pricing-divider" />
                            <div className="pricing-price-row">
                                <span className="desktop-h3">£24.95</span>
                            </div>

                            {/* === Gallery === */}
                            <div className="pricing-media-tray">
                                <div className="pricing-media-main">
                                    <img src={cardMainImage} alt="Konar Card - White Edition" />
                                </div>
                                <div className="pricing-media-thumbs">
                                    {cardThumbs.map((src, i) => (
                                        <button
                                            key={i}
                                            className={`pricing-media-thumb ${cardMainImage === src ? 'is-active' : ''}`}
                                            onClick={() => setCardMainImage(src)}
                                            type="button"
                                            aria-label={`Show product image ${i + 1}`}
                                        >
                                            <img src={src} alt={`Konar Card thumbnail ${i + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

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
