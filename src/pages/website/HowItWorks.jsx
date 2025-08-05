import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import QRCode from '../../assets/icons/QR-Code-Icon.svg';
import NFCIcon from '../../assets/icons/NFC-Icon.svg';
import HowItWorks1 from '../../assets/images/HowItWorks-1.png';
import HowItWorks2 from '../../assets/images/HowItWorks-2.png';
import HowItWorks3 from '../../assets/images/HowItWorks-3.png';
import ProfilePencil from '../../assets/icons/ProfilePencil-Icon.svg';
import ToolBoxIcon from '../../assets/icons/ToolBox-Icon.svg';
import UpdateIcon from '../../assets/icons/Update-Icon.svg';
import Section1Image from '../../assets/images/Section-1-Image.png';
import TickIcon from '../../assets/icons/Tick-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import DeliveryIcon from '../../assets/icons/Delivery-Icon.svg'; // Reusing this icon for the free trial visual
import WarrantyIcon from '../../assets/icons/Warranty-Icon.svg'; // Adding this icon to match the product page's tickbox section

export default function SubscriptionPage() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isSubscribed = user ? user.isSubscribed : false;
    const loadingStatus = authLoading;

    // Define pricing variables to make them easy to update
    const newPrice = 7.95;
    const oldPrice = 12.95;

    const getFreeTrialEndDate = () => {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 14);

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return endDate.toLocaleDateString('en-GB', options);
    };

    const freeTrialEndDate = getFreeTrialEndDate();

    const handleSubscribe = async () => {
        if (!user) {
            navigate('/login', {
                state: {
                    from: location.pathname,
                    checkoutType: 'subscription',
                },
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

            if (url) {
                window.location.href = url;
            } else {
                toast.error('Could not start subscription. Please try again.');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Subscription failed. Please try again.');
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ marginTop: 20 }} className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            <div className="section-product">
                <div className="product-preview">
                    <img src={Section1Image} alt="Power Profile in action" className="main-card" />
                </div>
                <div className="product-options">
                    <p className="desktop-h5">Power Profile</p>
                    <p className="desktop-body">
                        Upgrade your digital profile with all the tools you need to look professional and win more work.
                    </p>

                    {/* REPLACED DELIVERY DATE SECTION WITH FREE TRIAL SECTION, STYLED TO MATCH THE PRODUCT PAGE */}
                    <div className="hero-tick-box">
                        <div className="hero-tick">
                            <img src={DeliveryIcon} className="icon" alt="Free Trial" />
                            <div>
                                <p className='bold-tick desktop-body-xs' style={{ fontSize: 14 }}>14 Day Free Trial</p>
                                <p className='desktop-body-xs' style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                                    Free until {freeTrialEndDate}
                                </p>
                            </div>
                        </div>
                        {/* ADDED A SECOND "TICK" TO MATCH THE LAYOUT OF THE ORIGINAL PRODUCT PAGE */}
                        <div className="hero-tick">
                            <img src={WarrantyIcon} className="icon" alt="Warranty" />
                            <p className='bold-tick desktop-body-xs' style={{ fontSize: 14 }}>Cancel Anytime</p>
                        </div>
                    </div>

                    {/* RE-STYLED PRICING TO MATCH THE "PRICE REDUCTION" LOOK OF THE ORIGINAL PRODUCT PAGE */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', }}>
                        <p style={{ fontSize: 24, fontWeight: 600 }}>
                            £{newPrice.toFixed(2)}
                        </p>
                        <p style={{ fontSize: 18, color: '#666', textDecoration: 'line-through' }}>
                            £{oldPrice.toFixed(2)}
                        </p>
                        <p style={{ fontSize: 18, color: '#666' }}>
                            per month
                        </p>
                    </div>

                    <div className="option-group">
                        <button onClick={handleSubscribe} className="blue-button desktop-button">
                            Upgrade to Power Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* REMOVED THE SUBSCRIPTION FEATURES SECTION as requested */}

            {/* Original "Your Digital Page to Win Work" content remains */}
            <div style={{ marginTop: 40 }} className="section">
                <div className="section-1-title">
                    <h2 className="desktop-h3 text-center">Your Digital Page to Win Work</h2>
                    <h3 className="desktop-h6 text-center">Share your contact details, show your best jobs, and earn trust — all in one simple link.</h3>
                </div>
                <div style={{ gap: 40 }} className="section-1-content">
                    <div className="section-1-left">
                        <img src={Section1Image} className="" />
                    </div>
                    <div className="section-1-right">
                        <p className="desktop-h5">Look Pro. Build Trust. Get Hired.</p>
                        <p className="desktop-body">Show clients what you do and make it easy for them to call, message, or book you.</p>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={ProfilePencil} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Add Your Info</p>
                                <p className="desktop-body-xs">Put your name, trade, and photo on your page — make it personal and professional.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={ToolBoxIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Show Off Your Work</p>
                                <p className="desktop-body-xs">Upload job photos, add your services and pricing, and share reviews from happy customers.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={UpdateIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Update Anytime</p>
                                <p className="desktop-body-xs">New prices? New jobs? You can update your page anytime, no hassle.</p>
                            </div>
                        </div>
                        <div className="section-list">
                            <div className="icon-white">
                                <img src={NFCIcon} className="icon" />
                            </div>
                            <div className="section-list-info">
                                <p className="desktop-h6">Share It Fast</p>
                                <p className="desktop-body-xs">Tap a phone, scan a code, or send a link. Your page opens anywhere — no apps needed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                        <img src={HowItWorks1} className="white-card-column-image" />
                    </div>
                    <div className="how-it-works-right">
                        <div className="white-card">
                            <div className="how-it-works-info">
                                <p className="desktop-h5">Share It Instantly</p>
                                <p className="desktop-body">
                                    Tap, scan, or send a link. Your full page opens in seconds.
                                </p>
                            </div>
                            <img src={HowItWorks2} className="how-it-works-right-image" />
                        </div>
                        <div className="white-card">
                            <div className="how-it-works-info">
                                <p className="desktop-h5">Win More Work</p>
                                <p className="desktop-body">
                                    Look pro, earn trust, and get booked faster with real reviews and a clean profile.
                                </p>
                            </div>
                            <img src={HowItWorks3} className="how-it-works-right-image" />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}