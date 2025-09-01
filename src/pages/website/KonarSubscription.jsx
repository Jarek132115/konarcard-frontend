// frontend/src/pages/ProductAndPlan/KonarSubscription.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// ICONS + MEDIA (placeholders — replace with your subscription images)
import ReviewStars from '../../assets/icons/Stars-Icon.svg';
import LightningIcon from '../../assets/icons/Bolt-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import QRIcon from '../../assets/icons/QR-Code-Icon.svg';
import ProfilePencil from '../../assets/icons/ProfilePencil-Icon.svg';
import PaletteIcon from '../../assets/icons/Pallette-Icon.svg';
import PhoneIcon from '../../assets/icons/Phone-Icon.svg';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg'; // used in the full-width pill

// TEMP gallery images (swap to subscription visuals)
import ProductCover from '../../assets/images/Product-Cover.png';
import ProductImage1 from '../../assets/images/Product-Image-1.png';
import ProductImage2 from '../../assets/images/Product-Image-2.png';
import ProductImage3 from '../../assets/images/Product-Image-3.png';
import ProductImage4 from '../../assets/images/Product-Image-4.png';

export default function KonarSubscription() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // ====== Pricing (update if needed) ======
    const pricePerMonth = 4.95;    // show current
    const previousPerMonth = 7.95; // strike-through

    // ====== Gallery, 1 main + 5 thumbs just like KonarCard ======
    const [mainImage, setMainImage] = useState(ProductCover);
    const thumbnails = [
        ProductCover,
        ProductImage1,
        ProductImage2,
        ProductImage3,
        ProductImage4,
    ];

    // ====== Auth / CTA logic ======
    const isSubscribed = !!user && user.isSubscribed;
    let ctaText = 'Start Your Free 14-Day Trial';
    let ctaDisabled = false;

    if (authLoading) {
        ctaText = 'Loading…';
        ctaDisabled = true;
    } else if (user) {
        if (isSubscribed) {
            ctaText = 'Subscribed';
            ctaDisabled = true;
        } else {
            ctaText = 'Start Your Free 14-Day Trial';
        }
    }

    const handleSubscribe = async () => {
        if (!user) {
            navigate('/login', {
                state: { from: location.pathname, checkoutType: 'subscription' },
            });
            return;
        }
        if (isSubscribed) {
            toast.info('You are already subscribed to the Power Profile.');
            return;
        }
        try {
            const res = await api.post('/subscribe', {
                returnUrl: window.location.origin + '/SuccessSubscription',
            });
            const { url } = res.data;
            if (url) window.location.href = url;
            else toast.error('Could not start subscription. Please try again.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Subscription failed. Please try again.');
        }
    };

    // ====== Copy (subscription-focused) ======
    const featurePills = [
        { icon: ProfilePencil, title: 'Easy Setup', text: 'Build your page in minutes' },
        { icon: PaletteIcon, title: 'Custom Branding', text: 'Fonts, colours, layouts' },
        { icon: PhoneIcon, title: 'Contact Buttons', text: 'Call, WhatsApp, email, map' },
        { icon: NFCIcon, title: 'Tap to Share', text: 'Works with NFC cards' },
        { icon: QRIcon, title: 'QR + Link', text: 'Share anywhere, instantly' },
        { icon: TickIcon, title: 'Show Your Work', text: 'Photos, services, pricing' },
        { icon: TickIcon, title: 'Reviews', text: 'Collect & display stars' },
        { icon: LightningIcon, title: 'Update Anytime', text: 'Changes go live instantly' },
    ];

    // ====== “Delivery” full-width pill (repurposed) ======
    // For subscription, we show instant activation + free trial date.
    const getFreeTrialEndDate = () => {
        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate() + 14);
        const opts = { year: 'numeric', month: 'long', day: 'numeric' };
        return end.toLocaleDateString('en-GB', opts);
    };
    const freeTrialEndDate = getFreeTrialEndDate();

    return (
        <>
            <Navbar />
            <div style={{ marginTop: 20 }} className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* ===== Product header shell (IDENTICAL structure to KonarCard) ===== */}
            <div className="section product-shell">
                {/* LEFT: tray + main + 5 thumbnails */}
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

                {/* RIGHT: content swapped for subscription */}
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

                        {/* Full-width pill (kept same component, different text) */}
                        <div className="pd-feature-pill pd-feature-pill--full">
                            <span className="pd-feature-icon">
                                <img src={DeliveryIcon} alt="" />
                            </span>
                            <div className="pd-feature-copy">
                                <p className="pd-feature-title desktop-body-s">Instant activation</p>
                                <p className="desktop-body-xs" style={{ color: '#666' }}>
                                    Free for 14 days — trial ends {freeTrialEndDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stars + price (styled exactly like KonarCard) */}
                    <div className="pd-meta-row">
                        <div className="pd-stars">
                            <img src={ReviewStars} alt="Rating" />
                            <span className="pd-reviews-count light-black">(1,024)</span>
                        </div>

                        <div className="pd-price-wrap">
                            <span className="pd-price-now">£{pricePerMonth.toFixed(2)}</span>
                            <span className="pd-price-was">£{previousPerMonth.toFixed(2)}</span>
                            <span className="pd-onetime">Per Month</span>
                        </div>
                    </div>

                    {/* CTA row (no quantity for subscription, but same layout) */}
                    <div className="pd-cta-row">
                        <button
                            onClick={handleSubscribe}
                            className="pd-buy-btn desktop-button"
                            disabled={ctaDisabled}
                            style={{ background: '#0081FF' }}
                        >
                            {ctaText}
                        </button>

                        {/* Optional: secondary link */}
                        <Link to="/productandplan" className="desktop-button" style={{ textDecoration: 'underline' }}>
                            View Plans & Cards
                        </Link>
                    </div>
                </div>
            </div>

            {/* ===== Keep your existing lower sections (FAQs etc.) or add subscription-specific blocks ===== */}
            <div className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">How It Works</h2>
                    <h3 className="desktop-h6 text-center">
                        Set up your profile in minutes. Show off your work and win more jobs.
                    </h3>
                </div>

                <div className="how-it-works-container">
                    <div className="white-card-column">
                        <div className="how-it-works-info">
                            <p className="desktop-h5">Build Your Page</p>
                            <p className="desktop-body">
                                Add your name, photos, services, and prices — no tech stuff needed.
                            </p>
                        </div>
                        <img src={ProductImage1} className="white-card-column-image" />
                    </div>

                    <div className="how-it-works-right">
                        <div className="white-card">
                            <div className="how-it-works-info">
                                <p className="desktop-h5">Share It Instantly</p>
                                <p className="desktop-body">
                                    Tap, scan, or send a link. Your full page opens in seconds.
                                </p>
                            </div>
                            <img src={ProductImage2} className="how-it-works-right-image" />
                        </div>

                        <div className="white-card">
                            <div className="how-it-works-info">
                                <p className="desktop-h5">Win More Work</p>
                                <p className="desktop-body">
                                    Look pro, earn trust, and get booked faster with reviews and a clean profile.
                                </p>
                            </div>
                            <img src={ProductImage3} className="how-it-works-right-image" />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
