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

    // Header bullets (orange dots)
    const headerBullets = [
        { title: 'Contact Button', text: 'Save my number' },
        { title: 'Tap to Share', text: 'Works with NFC cards' },
        { title: 'Live Updates', text: 'Edit anytime — goes live' },
        { title: 'About & Services', text: 'Tell your story, list services' },
        { title: 'Branding', text: 'Fonts, colours, layouts' },
    ];

    // FAQ content (rendered as dot items)
    const faqsLeft = [
        {
            title: 'What do I get with Power Profile?',
            text:
                'Unlimited edits, gallery, services with pricing, reviews, themes/fonts, layouts, and easy sharing via QR or link — changes go live instantly.',
        },
        {
            title: 'How does the free trial work?',
            text:
                'The 14-day trial includes all the same features as a paid subscription. If your trial ends and you don’t subscribe, your page will be hidden until you subscribe.',
        },
        {
            title: 'Do I need a subscription to use the card?',
            text:
                'The card is a one-time purchase, but without an active trial or subscription your page is hidden — so tapping the card won’t show your profile until you subscribe again.',
        },
        {
            title: 'Can I update my page anytime?',
            text:
                'Yes — while on an active trial or subscription your changes publish instantly.',
        },
    ];

    const faqsRight = [
        {
            title: 'What happens if I cancel?',
            text:
                'You’ll keep access until the end of the current billing period. After that, your page will be hidden until you resubscribe.',
        },
        {
            title: 'Is there a contract?',
            text:
                'No long-term contracts. It’s a simple monthly plan — cancel anytime.',
        },
        {
            title: 'How do I start?',
            text:
                'Create your profile, start the free trial, then subscribe to keep your page live.',
        },
        {
            title: 'Who is Power Profile for?',
            text:
                'Built for tradies — plumbers, sparkies, builders, tilers, gardeners and more.',
        },
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
                        Konar <span className="orange">Power Profile</span>
                    </h1>
                    <p className="pd-sub desktop-body">
                        Stand out and win more jobs — one tap opens your profile with your services, photos, and contact details.
                    </p>

                    {/* Orange-dot bullets */}
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

                        {/* Full-width row for trial info */}
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
                            <button
                                className="orange-button desktop-button"
                                style={{ opacity: 0.7, cursor: 'not-allowed', width: '100%' }}
                                disabled
                            >
                                Plan active
                            </button>
                        ) : (
                            <button
                                className="orange-button desktop-button"
                                onClick={handleStartTrial}
                                style={{ width: '100%' }}
                            >
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
                        See How <span className="orange">Tradies</span> Put Konar To <span className="orange">Work</span>
                    </h2>
                    <h3 className="desktop-body-xs text-center">
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

            {/* ===== FAQ (dot style) ===== */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">
                        Power Profile — Subscription <span className="orange">FAQs</span>
                    </h2>
                    <h3 className="desktop-body-xs text-center">Free trial, what’s included, and what happens after.</h3>
                </div>

                <div className="faq-container">
                    <div className="faq-column">
                        {faqsLeft.map((f, i) => (
                            <div key={i} className="pd-feature-item pd-feature-item--full" style={{ marginBottom: 16 }}>
                                <span className="pd-dot" aria-hidden="true" />
                                <div className="pd-feature-copy">
                                    <p className="desktop-h6">{f.title}</p>
                                    <p className="desktop-body-s">{f.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="faq-column">
                        {faqsRight.map((f, i) => (
                            <div key={i} className="pd-feature-item pd-feature-item--full" style={{ marginBottom: 16 }}>
                                <span className="pd-dot" aria-hidden="true" />
                                <div className="pd-feature-copy">
                                    <p className="desktop-h6">{f.title}</p>
                                    <p className="desktop-body-s">{f.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
