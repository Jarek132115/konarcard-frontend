import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg';

import pp1 from '../../assets/images/pp1.png';
import pp2 from '../../assets/images/pp2.png';
import pp3 from '../../assets/images/pp3.png';
import pp4 from '../../assets/images/pp4.png';

import ProductCover from '../../assets/images/Subscription-Main.jpg';
import ProductImage1 from '../../assets/images/Subscription-Main.jpg';
import ProductImage2 from '../../assets/images/Subscription-Main.jpg';
import ProductImage3 from '../../assets/images/Subscription-Main.jpg';
import ProductImage4 from '../../assets/images/Subscription-Main.jpg';

import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import PalletteIcon from '../../assets/icons/Pallette-Icon.svg';
import WarrantyIcon from '../../assets/icons/Warranty-Icon.svg';
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg';
import SetupIcon from '../../assets/icons/Setup-Icon.svg';
import BoxIcon from '../../assets/icons/Box-Icon.svg';
import HatIcon from '../../assets/icons/Hat-Icon.svg';
import LockIcon from '../../assets/icons/Lock-Icon.svg';
import PencilIcon from '../../assets/icons/Pencil-Icon.svg';
import PhoneIcon from '../../assets/icons/Phone-Icon.svg';
import WalletIcon from '../../assets/icons/Wallet-Icon.svg';

export default function KonarSubscription() {
    // Pricing (subscription)
    const pricePerMonth = 4.95;
    const originalPerMonth = 7.95;

    // Gallery state (same pattern as KonarCard)
    const [mainImage, setMainImage] = useState(ProductCover);
    const thumbnails = [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4];

    // “Full-width pill” line (repurposed for subscription)
    const getFreeTrialEndDate = () => {
        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate() + 14);
        const opts = { year: 'numeric', month: 'long', day: 'numeric' };
        return end.toLocaleDateString('en-GB', opts);
    };
    const freeTrialEndDate = getFreeTrialEndDate();

    // Feature list (subscription-focused copy, same pill UI)
    const featurePills = [
        { icon: PhoneIcon, title: 'Contact Button', text: 'Save my number' },
        { icon: NFCIcon, title: 'Tap to Share', text: 'Works with NFC cards' },
        { icon: WarrantyIcon, title: 'Live Updates', text: 'Edit anytime, goes live' },
        { icon: NFCIcon, title: 'QR & Link', text: 'Share anywhere in seconds' },
        { icon: IDCardIcon, title: 'About & Services', text: 'Tell your story, list services' },
        { icon: LockIcon, title: 'Reviews', text: 'Collect & display stars' },
        { icon: BoxIcon, title: 'Gallery', text: 'Show finished jobs' },
        { icon: PalletteIcon, title: 'Branding', text: 'Fonts, colours, layouts' },
    ];

    return (
        <>
            <Navbar />
            <div style={{ marginTop: 20 }} className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* ===== Product header (identical shell) ===== */}
            <div className="section product-shell">
                {/* LEFT: tray + main + thumbs */}
                <div className="pd-left">
                    <div className="pd-card-tray">
                        <div className="pd-card">
                            <img src={mainImage} alt="Konar Power Profile" />
                        </div>
                    </div>

                    <div className="pd-thumbs">
                        {thumbnails.map((t, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`pd-thumb ${mainImage === t ? 'is-active' : ''}`}
                                onClick={() => setMainImage(t)}
                                aria-label={`View image ${i + 1}`}
                            >
                                <img src={t} alt={`Thumbnail ${i + 1}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: same structure, subscription copy */}
                <div className="pd-right">
                    <h1 className="pd-title desktop-h4">Konar Power Profile</h1>
                    <p className="pd-sub desktop-body">
                        Stand out and win more jobs — one tap opens your profile with your services, photos, and contact details.
                    </p>

                    <div className="pd-feature-grid">
                        {featurePills.map((f, idx) => (
                            <div className="pd-feature-pill" key={idx}>
                                <span className="pd-feature-icon">
                                    <img src={f.icon} alt="" />
                                </span>
                                <div className="pd-feature-copy">
                                    <p className="pd-feature-title desktop-body-s">{f.title}</p>
                                    <p className="pd-feature-text desktop-body-xs">{f.text}</p>
                                </div>
                            </div>
                        ))}

                        {/* Full-width pill */}
                        <div className="pd-feature-pill pd-feature-pill--full">
                            <span className="pd-feature-icon">
                                <img src={DeliveryIcon} alt="" />
                            </span>
                            <div className="pd-feature-copy">
                                <p className="pd-feature-title desktop-body-s">Instant activation</p>
                                <p className="desktop-body-xs" style={{ color: '#666' }}>
                                    Free for 14 days — ends {freeTrialEndDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stars + price row (same classes) */}
                    <div className="pd-meta-row">
                        <div className="pd-stars">
                            <img src={ReviewStars} alt="Rating" />
                            <span className="pd-reviews-count light-black">(165)</span>
                        </div>

                        <div className="pd-price-wrap">
                            <span className="pd-price-now">£{pricePerMonth.toFixed(2)}</span>
                            <span className="pd-price-was">£{originalPerMonth.toFixed(2)}</span>
                            <span className="pd-onetime">Per Month</span>
                        </div>
                    </div>

                    {/* CTA row — SAME classes as KonarCard */}
                    <div className="pd-cta-row">
                        <button className="cta-blue-button desktop-button">
                            Start Your Free 14-Day Trial
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== Reviews (same block as KonarCard) ===== */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">The #1 Tool Tradies Are Talking About</h2>
                    <h3 className="desktop-h6 text-center">
                        Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
                    </h3>
                </div>
                <div className="review-container-box">
                    <div className="review-container">
                        <div className="review-pair">
                            <div className="review-div">
                                <img className="stars" src={ReviewStars} alt="5 star rating" />
                                <p className="desktop-body-s text-center">
                                    “Since using Konar I’m actually getting replies. Looks slick and I’m getting referrals.”
                                </p>
                                <div className="review-div-person">
                                    <img src={pp1} alt="Reviewer" />
                                    <div className="review-person-name">
                                        <p className="desktop-body-xs grey">Plumber</p>
                                        <p className="desktop-body-s">Mark B</p>
                                    </div>
                                </div>
                            </div>

                            <div className="review-div">
                                <img className="stars" src={ReviewStars} alt="5 star rating" />
                                <p className="desktop-body-s text-center">
                                    “Saved me a fortune on printing. I share my page in seconds.”
                                </p>
                                <div className="review-div-person">
                                    <img src={pp2} alt="Reviewer" />
                                    <div className="review-person-name">
                                        <p className="desktop-body-xs grey">Electrician</p>
                                        <p className="desktop-body-s">Jake C</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="review-pair">
                            <div className="review-div">
                                <img className="stars" src={ReviewStars} alt="5 star rating" />
                                <p className="desktop-body-s text-center">
                                    “Gives me a proper online presence without a pricey website.”
                                </p>
                                <div className="review-div-person">
                                    <img src={pp3} alt="Reviewer" />
                                    <div className="review-person-name">
                                        <p className="desktop-body-xs grey">Builder</p>
                                        <p className="desktop-body-s">Tom G</p>
                                    </div>
                                </div>
                            </div>

                            <div className="review-div">
                                <img className="stars" src={ReviewStars} alt="5 star rating" />
                                <p className="desktop-body-s text-center">
                                    “I update prices and services on my phone. No reprinting, no fuss.”
                                </p>
                                <div className="review-div-person">
                                    <img src={pp4} alt="Reviewer" />
                                    <div className="review-person-name">
                                        <p className="desktop-body-xs grey">Roofer</p>
                                        <p className="desktop-body-s">Sam H</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== FAQ (same block as KonarCard) ===== */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">Frequently Asked Questions</h2>
                    <h3 className="desktop-h6 text-center">For any other questions feel free to contact us at any time</h3>
                </div>
                <div className="faq-container">
                    <div className="faq-column">
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={IDCardIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">What is a Konar digital profile?</p>
                                <p className="desktop-body-s">It’s your own landing page showing your trade, services, photos, and contact details — all online.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={NFCIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Do I need an NFC card to use it?</p>
                                <p className="desktop-body-s">No. You can use and share your digital profile without ever buying a physical card.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={PhoneIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">How do people view my profile?</p>
                                <p className="desktop-body-s">Share via link, QR code, or NFC tap — works instantly on most phones.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={SetupIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">How do I set up my page?</p>
                                <p className="desktop-body-s">Just fill in your trade, upload photos, list services — done in under five minutes.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={PencilIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Can I update my page anytime?</p>
                                <p className="desktop-body-s">Yes. Log in from any device to update info, images, services, or pricing instantly.</p>
                            </div>
                        </div>
                    </div>
                    <div className="faq-column">
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={WalletIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">What does it cost to use?</p>
                                <p className="desktop-body-s">We offer a free plan. Premium features unlock with our £5.95/month Power Profile subscription.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={BoxIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">What happens if I lose my NFC card?</p>
                                <p className="desktop-body-s">Your page still works without the card. You can always reorder one if you want to keep tapping.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={HatIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Who is this for exactly?</p>
                                <p className="desktop-body-s">Any tradesperson who wants to get noticed, win more work, and look professional online.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={PalletteIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Can I customise the design and layout?</p>
                                <p className="desktop-body-s">Yes. Pick fonts, colours, and layouts to match your brand and make it yours.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={LockIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Is my personal data safe on here?</p>
                                <p className="desktop-body-s">Absolutely. You control everything shown, and your data is hosted securely at all times.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
