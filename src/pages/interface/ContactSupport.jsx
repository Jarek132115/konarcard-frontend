import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import ShareProfile from '../../components/ShareProfile';
import api from '../../services/api';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';
import { AuthContext } from '../../components/AuthContext';
import { useFetchBusinessCard } from '../../hooks/useFetchBusinessCard';

export default function ContactSupport() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        reason: '',
        message: '',
        agree: true,
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);
    const [showShareModal, setShowShareModal] = useState(false);

    const { user: authUser } = useContext(AuthContext);
    const userId = authUser?._id;
    const userUsername = authUser?.username;
    const { data: businessCard } = useFetchBusinessCard(userId);

    // Prefill name/email if logged in
    useEffect(() => {
        if (authUser) {
            setFormData((p) => ({
                ...p,
                name: p.name || authUser.name || '',
                email: p.email || authUser.email || '',
            }));
        }
    }, [authUser]);

    // Optional: open chat via flag
    useEffect(() => {
        const key = 'openChatOnLoad';
        if (localStorage.getItem(key) !== '1') return;
        const started = Date.now();
        const loop = () => {
            if (window.tidioChatApi?.open) {
                try { localStorage.removeItem(key); } catch { }
                window.tidioChatApi.open();
                return;
            }
            if (Date.now() - started < 5000) setTimeout(loop, 200);
            else try { localStorage.removeItem(key); } catch { }
        };
        loop();
    }, []);

    useEffect(() => {
        const onResize = () => {
            const m = window.innerWidth <= 1000;
            const sm = window.innerWidth <= 600;
            setIsMobile(m);
            setIsSmallMobile(sm);
            if (!m && sidebarOpen) setSidebarOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [sidebarOpen]);

    useEffect(() => {
        if (sidebarOpen && isMobile) document.body.classList.add('body-no-scroll');
        else document.body.classList.remove('body-no-scroll');
    }, [sidebarOpen, isMobile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, reason, message } = formData;
        if (!name || !email || !reason || !message) {
            toast.error('Please fill in all required fields.');
            return;
        }
        try {
            const res = await api.post('/contact', formData);
            if (res.data?.success) {
                toast.success('Message sent!');
                setFormData({ name: '', email: '', reason: '', message: '', agree: true });
            } else {
                toast.error(res.data?.error || 'Something went wrong');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send message.');
        }
    };

    const handleShareCard = () => {
        if (!authUser?.isVerified) return toast.error('Please verify your email to share your card.');
        setShowShareModal(true);
    };
    const closeShare = () => setShowShareModal(false);

    const contactDetailsForVCard = {
        full_name: businessCard?.full_name || authUser?.name || '',
        job_title: businessCard?.job_title || '',
        business_card_name: businessCard?.business_card_name || '',
        bio: businessCard?.bio || '',
        contact_email: businessCard?.contact_email || authUser?.email || '',
        phone_number: businessCard?.phone_number || '',
        username: userUsername || '',
    };

    const currentProfileUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : '';
    const currentQrCodeUrl = businessCard?.qrCodeUrl || '';

    return (
        <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''} contact-page`}>
            {/* Mobile header */}
            <div className="myprofile-mobile-header">
                <Link to="/" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
                <div
                    className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <span></span><span></span><span></span>
                </div>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && (
                <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
            )}

            <main className="main-content-container contact-main">
                <PageHeader
                    title="Contact Support"
                    onActivateCard={() => { }}
                    onShareCard={handleShareCard}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                />

                {/* Peach shell wrapper (desktop) that scrolls internally */}
                <div className="profile-page-wrapper contact">
                    <div className="profile-settings-card">
                        <div className="contact-card-head">
                            <div>
                                <h3 className="desktop-h5">Contact Support</h3>
                                <p className="desktop-body-xs light-black contact-sub">
                                    We typically reply within 24 hours. For urgent issues,&nbsp;
                                    <span
                                        className="support-live-chat-link"
                                        onClick={() => window.tidioChatApi?.open?.()}
                                    >
                                        start a live chat
                                    </span>.
                                </p>
                            </div>
                            <span className="pill-blue-solid">Support</span>
                        </div>

                        <div className="card-divider" />

                        {/* Label-less form with 10px gaps */}
                        <form onSubmit={handleSubmit} className="support-form">
                            <div className="support-field">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="support-input desktop-body"
                                    required
                                />
                            </div>

                            <div className="support-field">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="support-input desktop-body"
                                    required
                                />
                            </div>

                            <div className="support-field">
                                <select
                                    id="reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    className="support-select desktop-body"
                                    required
                                >
                                    <option value="">Reason for contact</option>
                                    <option value="Card not working">My card isn’t working</option>
                                    <option value="Card damaged">My card is damaged</option>
                                    <option value="Profile issue">I can’t see my profile</option>
                                    <option value="Setup help">Help setting up profile</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="support-field">
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Your message…"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="support-textarea desktop-body"
                                    rows={4}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="cta-accent-button desktop-button support-submit-button"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <ShareProfile
                isOpen={showShareModal}
                onClose={closeShare}
                profileUrl={currentProfileUrl}
                qrCodeUrl={currentQrCodeUrl}
                contactDetails={contactDetailsForVCard}
                username={userUsername || ''}
            />
        </div>
    );
}
