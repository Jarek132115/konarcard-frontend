import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

// Gallery images
import ProductCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';

export default function ProductAndPlan() {
    const [cardMainImage, setCardMainImage] = useState(ProductCover);
    const cardThumbs = [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4];

    // Same feature list used on Home (so layout + copy matches)
    const featureBlocks = [
        { t: 'Simple editor', s: 'Get set up quickly — no tech skills required.' },
        { t: 'Show what you do', s: 'Share your services and work in seconds.' },
        { t: 'Unlimited images', s: 'Upload every project — no limits on galleries.' },
        { t: 'Unlimited services', s: 'List each job you offer with clear pricing.' },
        { t: 'Unlimited reviews', s: 'Build instant trust with social proof.' },
        { t: 'Custom branding', s: 'Your logo, colours and layout — make it yours.' },
        { t: 'Share everywhere', s: 'Link, QR code, and NFC tap for instant contacts.' },
        { t: 'Instant updates', s: 'Edit once — changes go live across your profile.' },
        { t: 'No app needed', s: 'Works on iPhone & Android, right in the browser.' },
        { t: 'Cancel anytime', s: 'Stay flexible — no long contracts.' },
    ];

    return (
        <>
            <Navbar />

            <div className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* --- PRICING (same markup/classes as Home) --- */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">
                        One <span className="blue">Plan</span>. One <span className="blue">Card</span>. Endless <span className="blue">Opportunities</span>.
                    </h2>
                    <h3 className="desktop-h6 text-center">
                        Start your Power Profile free for 14 days. Add the Konar Card when you’re ready.
                    </h3>
                </div>

                <div className="pricing-grid nfc-pricing-page">
                    {/* Subscription (blue) */}
                    <div className="pricing-card pricing-card--subscription nfc-pricing-subscription" style={{ borderRadius: 16 }}>
                        <div className="pricing-inner">
                            <div className="pricing-content">
                                <div className="pricing-head">
                                    <div>
                                        <h3 className="desktop-h5">Konar Profile</h3>
                                        <p className="desktop-body-xs">Win more work with a power profile</p>
                                    </div>
                                    <span className="pricing-badge pill-blue-solid">14-Day Free Trial</span>
                                </div>

                                <div className="pricing-divider" />

                                <div className="pricing-price-row">
                                    <span className="desktop-h3" style={{ paddingRight: 5 }}>£4.95</span>
                                    <span className="desktop-button" style={{ padding: 0 }}>/Month - After 14 Days</span>
                                </div>

                                {/* Features (same grid + copy as Home) */}
                                <ul className="feature-grid">
                                    {featureBlocks.map((f, i) => (
                                        <li key={i} className="feature-item">
                                            <span className="blue-dot" aria-hidden="true" />
                                            <div className="feature-copy">
                                                <div className="feature-title desktop-body-s">{f.t}</div>
                                                <div className="feature-sub desktop-body-xs">{f.s}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pricing-bottom">
                                <Link
                                    to="/productandplan/konarsubscription"
                                    className="cta-blue-button desktop-button"
                                    style={{ width: '100%' }}
                                >
                                    View Subscription Details
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Physical card (black) */}
                    <div className="pricing-card pricing-card--product nfc-pricing-product" style={{ borderRadius: 16 }}>
                        <div className="pricing-inner">
                            <div className="pricing-content">
                                <div className="pricing-head">
                                    <div>
                                        <h3 className="desktop-h5">Konar Card - White Edition</h3>
                                        <p className="desktop-body-xs">Tap to share your profile instantly.</p>
                                    </div>
                                    <span className="pricing-badge pill-black">12 Month Warranty</span>
                                </div>

                                <div className="pricing-divider" />

                                <div className="pricing-price-row">
                                    <span className="desktop-h3">£24.95</span>
                                </div>

                                {/* Gallery (same classes as Home for styling) */}
                                <div className="pricing-media-tray">
                                    <div className="pricing-media-main">
                                        <img src={cardMainImage} alt="Konar Card - White Edition" />
                                    </div>
                                    <div className="pricing-media-thumbs tight">
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
                            </div>

                            <div className="pricing-bottom">
                                <Link
                                    to="/productandplan/konarcard"
                                    className="cta-black-button desktop-button"
                                    style={{ width: '100%' }}
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
