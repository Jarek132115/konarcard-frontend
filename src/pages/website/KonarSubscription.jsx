import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import ReviewStars from '../../assets/icons/Stars-Icon.svg';

import pp1 from '../../assets/images/pp1.png';
import pp2 from '../../assets/images/pp2.png';
import pp3 from '../../assets/images/pp3.png';
import pp4 from '../../assets/images/pp4.png';

/** SUBSCRIPTION GALLERY (hero/feature images) */
import ProductCover from '../../assets/images/Subscription-Main.jpg';
import Mockup1 from '../../assets/images/1.png';
import Mockup2 from '../../assets/images/2.png';
import Mockup3 from '../../assets/images/3.png';
import Mockup4 from '../../assets/images/4.png';

/** FAQ icons */
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import WarrantyIcon from '../../assets/icons/Warranty-Icon.svg';
import IDCardIcon from '../../assets/icons/IDCard-Icon.svg';
import SetupIcon from '../../assets/icons/Setup-Icon.svg';
import HatIcon from '../../assets/icons/Hat-Icon.svg';
import LockIcon from '../../assets/icons/Lock-Icon.svg';
import PencilIcon from '../../assets/icons/Pencil-Icon.svg';
import PhoneIcon from '../../assets/icons/Phone-Icon.svg';
import WalletIcon from '../../assets/icons/Wallet-Icon.svg';
import InfoIcon from '../../assets/icons/Info-Icon.svg';
import TimeIcon from '../../assets/icons/Time-Icon.svg';
import ShieldIcon from '../../assets/icons/Shield-Icon.svg';
import ProfilePencil from '../../assets/icons/ProfilePencil-Icon.svg';

import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export default function KonarSubscription() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const isSubscribed = !!user?.isSubscribed;

    // Pricing (subscription)
    const pricePerMonth = 4.95;
    const originalPerMonth = 7.95;

    /** SUBSCRIPTION gallery (left side) */
    const [mainImage, setMainImage] = useState(ProductCover);
    const thumbnails = [ProductCover, Mockup1, Mockup3, Mockup2, Mockup4];

    const getFreeTrialEndDate = () => {
        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate() + 14);
        const opts = { year: 'numeric', month: 'long', day: 'numeric' };
        return end.toLocaleDateString('en-GB', opts);
    };
    const freeTrialEndDate = getFreeTrialEndDate();

    // Feature bullets for subscription header (now blue-dot bullets)
    const headerBullets = [
        { title: 'Contact Button', text: 'Save my number' },
        { title: 'Tap to Share', text: 'Works with NFC cards' },
        { title: 'Live Updates', text: 'Edit anytime — goes live' },
        { title: 'About & Services', text: 'Tell your story, list services' },
        { title: 'Branding', text: 'Fonts, colours, layouts' },
    ];

    const startSubscription = useCallback(async () => {
        try {
            const res = await api.post('/subscribe', {
                returnUrl: window.location.origin + '/SuccessSubscription',
            });
            const { url } = res.data || {};
            if (url) window.location.href = url;
            else toast.error(res?.data?.error || 'Could not start subscription. Please try again.');
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Subscription failed. Please try again.');
        }
    }, []);

    const handleStartTrial = async () => {
        if (!user) {
            navigate('/register', { state: { postAuthAction: { type: 'subscribe' } } });
            return;
        }
        await startSubscription();
    };

    useEffect(() => {
        if (location.state?.triggerSubscribe) {
            navigate(location.pathname, { replace: true });
            startSubscription();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    return (
        <>
            <Navbar />
            <div style={{ marginTop: 20 }} className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* ===== Subscription Product header ===== */}
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
                    <h1 className="pd-title desktop-h4">
                        Konar <span className="blue">Power Profile</span>
                    </h1>
                    <p className="pd-sub desktop-body">
                        Stand out and win more jobs — one tap opens your profile with your services, photos, and contact details.
                    </p>

                    {/* Blue-dot bullets (no icon/pill backgrounds) */}
                    <div className="pd-feature-grid">
                        {headerBullets.map((b, idx) => (
                            <div className="pd-feature-item" key={idx}>
                                <span className="pd-dot" aria-hidden="true" />
                                <div className="pd-feature-copy">
                                    <p className="pd-feature-title desktop-body-s">{b.title}</p>
                                    <p className="pd-feature-text desktop-body-xs">{b.text}</p>
                                </div>
                            </div>
                        ))}

                        {/* Full-width row for trial info (kept as dot too) */}
                        <div className="pd-feature-item pd-feature-item--full">
                            <span className="pd-dot" aria-hidden="true" />
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

                    {/* CTA row (full width) */}
                    <div className="pd-cta-row">
                        {isSubscribed ? (
                            <button className="cta-blue-button desktop-button" style={{ opacity: 0.7, cursor: 'not-allowed', width: '100%' }} disabled>
                                Plan active
                            </button>
                        ) : (
                            <button className="cta-blue-button desktop-button" onClick={handleStartTrial} style={{ width: '100%' }}>
                                Start Your Free 14-Day Trial
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== Reviews ===== */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">
                        See How <span className="blue">Tradies</span> Put Konar To <span className="blue">Work</span>
                    </h2>
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

            {/* ===== FAQ ===== */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">
                        Power Profile — Subscription <span className="blue">FAQs</span>
                    </h2>
                    <h3 className="desktop-h6 text-center">Free trial, what’s included, and what happens after.</h3>
                </div>

                <div className="faq-container">
                    <div className="faq-column">
                        <div className="section-list">
                            <div className="icon-white"><img src={ProfilePencil} className="icon" alt="" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">What do I get with Power Profile?</p>
                                <p className="desktop-body-s">
                                    Unlimited edits, gallery, services with pricing, reviews, themes/fonts, layouts, and easy sharing via QR or link — changes go live instantly.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={InfoIcon} className="icon" alt="" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">How does the free trial work?</p>
                                <p className="desktop-body-s">
                                    The 14-day trial includes all the same features as a paid subscription. If your trial ends and you don’t subscribe, your page will be hidden until you subscribe.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={WalletIcon} className="icon" alt="" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Do I need a subscription to use the card?</p>
                                <p className="desktop-body-s">
                                    The card is a one-time purchase, but without an active trial or subscription your page is hidden — so tapping the card won’t show your profile until you subscribe again.
                                </p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={PencilIcon} className="icon" alt="" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Can I update my page anytime?</p>
                                <p className="desktop-body-s">Yes — while on an active trial or subscription your changes publish instantly.</p>
                            </div>
                        </div>
                    </div>

                    <div className="faq-column">
                        <div className="section-list">
                            <div className="icon-white"><img src={TimeIcon} className="icon" alt="" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">What happens if I cancel?</p>
                                <p className="desktop-body-s">You’ll keep access until the end of the current billing period. After that, your page will be hidden until you resubscribe.</p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={ShieldIcon} className="icon" alt="" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Is there a contract?</p>
                                <p className="desktop-body-s">No long-term contracts. It’s a simple monthly plan — cancel anytime.</p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={SetupIcon} className="icon" alt="" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">How do I start?</p>
                                <p className="desktop-body-s">Create your profile, start the free trial, then subscribe to keep your page live.</p>
                            </div>
                        </div>

                        <div className="section-list">
                            <div className="icon-white"><img src={HatIcon} className="icon" alt="" /></div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Who is Power Profile for?</p>
                                <p className="desktop-body-s">Built for tradies — plumbers, sparkies, builders, tilers, gardeners and more.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
