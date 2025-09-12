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

// New mockups
import Mockup1 from '../../assets/images/1.png';
import Mockup2 from '../../assets/images/2.png';
import Mockup3 from '../../assets/images/3.png';
import Mockup4 from '../../assets/images/4.png';

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

// Added for subscription FAQs
import InfoIcon from '../../assets/icons/Info-Icon.svg';
import TimeIcon from '../../assets/icons/Time-Icon.svg';
import ShieldIcon from '../../assets/icons/Shield-Icon.svg';
import ProfilePencil from '../../assets/icons/ProfilePencil-Icon.svg';

export default function KonarSubscription() {
    // Pricing (subscription)
    const pricePerMonth = 4.95;
    const originalPerMonth = 7.95;

    // Gallery state
    const [mainImage, setMainImage] = useState(ProductCover);

    // Thumbnails: keep cover first, then mockups in requested order
    const thumbnails = [
        ProductCover, // keep cover first
        Mockup1,      // 1.png
        Mockup3,      // 3.png
        Mockup2,      // 2.png
        Mockup4       // 4.png
    ];

    // “Full-width pill” line (repurposed for subscription)
    const getFreeTrialEndDate = () => {
        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate() + 14);
        const opts = { year: 'numeric', month: 'long', day: 'numeric' };
        return end.toLocaleDateString('en-GB', opts);
    };
    const freeTrialEndDate = getFreeTrialEndDate();

    // Feature list
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

            {/* ===== Product header ===== */}
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

                {/* RIGHT: subscription copy */}
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

                    {/* Stars + price row */}
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

                    {/* CTA row */}
                    <div className="pd-cta-row">
                        <button className="cta-blue-button desktop-button">
                            Start Your Free 14-Day Trial
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== Reviews ===== */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">See How Tradies Put Konar To Work</h2>
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

            {/* ===== FAQ (Subscription-specific) ===== */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">Power Profile — Subscription FAQs</h2>
                    <h3 className="desktop-h6 text-center">Free trial, what’s included, and what happens after.</h3>
                </div>

                <div className="faq-container">
                    <div className="faq-column">
                        <div className="section-list">
                            <div className="icon-white"><img src={ProfilePencil} className="icon" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">What do I get with Power Profile?</p>
                                <p className="desktop-body-s">
                                    Unlimited edits, gallery, services with pricing, reviews, themes/fonts, layouts, and easy sharing via QR or link — changes go live instantly.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={InfoIcon} className="icon" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">How does the free trial work?</p>
                                <p className="desktop-body-s">
                                    The 14-day trial includes all the same features as a paid subscription. If your trial ends and you don’t subscribe, your page will be hidden (not publicly viewable) until you subscribe.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={WalletIcon} className="icon" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Do I need a subscription to use the card?</p>
                                <p className="desktop-body-s">
                                    The card is a one-time purchase, but without an active trial or subscription your page is hidden — so tapping the card won’t show your profile until you subscribe again.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={PencilIcon} className="icon" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Can I update my page anytime?</p>
                                <p className="desktop-body-s">
                                    Yes — while on an active trial or subscription you can edit from any device and your changes publish instantly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="faq-column">
                        <div className="section-list">
                            <div className="icon-white"><img src={TimeIcon} className="icon" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">What happens if I cancel?</p>
                                <p className="desktop-body-s">
                                    You’ll keep access until the end of the current billing period. After that, your page will be hidden until you resubscribe.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={ShieldIcon} className="icon" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Is there a contract?</p>
                                <p className="desktop-body-s">
                                    No long-term contracts. It’s a simple monthly plan — cancel anytime from your account dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={SetupIcon} className="icon" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">How do I start my trial or subscription?</p>
                                <p className="desktop-body-s">
                                    Create your profile, then start the free trial. When you’re ready, subscribe in a few clicks from your account to keep your page live.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={HatIcon} className="icon" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Who is Power Profile for?</p>
                                <p className="desktop-body-s">
                                    Built for tradies — plumbers, sparkies, builders, tilers, gardeners and more — who want to look pro and win more work.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <Footer />
        </>
    );
}
